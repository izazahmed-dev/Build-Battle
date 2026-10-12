import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {handleAnalytics} from '../server/analytics.mjs';

class D1 {
 constructor(){this.sqlite=new DatabaseSync(':memory:');this.calls=[];this.fail=false;}
 prepare(sql){this.calls.push(sql);const statement={args:[],bind(...args){this.args=args;return this;},run:async()=>{if(this.fail)throw Error('DB unavailable');this.sqlite.prepare(sql).run(...statement.args);return {success:true};}};return statement;}
 async batch(statements){this.sqlite.exec('BEGIN');try{const result=[];for(const statement of statements)result.push(await statement.run());this.sqlite.exec('COMMIT');return result;}catch(error){this.sqlite.exec('ROLLBACK');throw error;}}
 rows(){return this.sqlite.prepare('SELECT * FROM analytics_daily ORDER BY day,event,page').all();}
}
const payload={event:'page_view',page:'overview',consent:true};
function request(body=payload,headers={},method='POST'){return new Request('https://site.test/api/analytics',{method,headers:{origin:'https://site.test','content-type':'application/json',...headers},...(method==='GET'?{}:{body:typeof body==='string'?body:JSON.stringify(body)})});}
test('SQLite-backed D1 aggregates only day/event/page/count and retains exactly 30 UTC days',async()=>{
 const DB=new D1();const env={DB};assert.equal((await handleAnalytics(request(),env)).status,204);
 const day=new Date().toISOString().slice(0,10);const old=new Date();old.setUTCDate(old.getUTCDate()-30);const oldest=new Date();oldest.setUTCDate(oldest.getUTCDate()-29);
 DB.sqlite.prepare('INSERT INTO analytics_daily VALUES (?,?,?,?)').run(old.toISOString().slice(0,10),'page_view','privacy',1);
 DB.sqlite.prepare('INSERT INTO analytics_daily VALUES (?,?,?,?)').run(oldest.toISOString().slice(0,10),'page_view','terms',1);
 assert.equal((await handleAnalytics(request(),env)).status,204);
 assert.equal((await handleAnalytics(request({...payload,event:'feedback_added',page:'feedback'}),env)).status,204);
 assert.deepEqual(DB.rows().map(r=>({...r})),[{day:oldest.toISOString().slice(0,10),event:'page_view',page:'terms',count:1},{day,event:'feedback_added',page:'feedback',count:1},{day,event:'page_view',page:'overview',count:2}]);
 assert.deepEqual(DB.sqlite.prepare('PRAGMA table_info(analytics_daily)').all().map(r=>r.name),['day','event','page','count']);
});
test('server refuses invalid requests before any persistence',async()=>{
 const DB=new D1();const env={DB};
 const cases=[[request(payload,{},'GET'),405],[request(payload,{'content-type':'text/plain'}),415],[request(payload,{origin:'https://evil.test'}),403],[request(payload,{'sec-fetch-site':'cross-site'}),403],[request(payload,{origin:''}),403],[request({...payload,consent:false}),403],[request({...payload,consent:'true'}),403],[request({...payload,event:'unknown'}),400],[request({...payload,page:'overview?secret=x'}),400],[request({...payload,review:'private'}),400],[request('null'),400],[request('{'),400],[request(' '.repeat(1025)),413],[request('é'.repeat(513)),413],[request(payload,{'content-length':'1025'}),413],[request(payload,{DNT:'1'}),403],[request(payload,{'Sec-GPC':'1'}),403]];
 for(const [req,status] of cases)assert.equal((await handleAnalytics(req,env)).status,status);
 assert.equal(DB.calls.length,0);
 assert.equal((await handleAnalytics(request(),{})).status,503);
 assert.equal((await handleAnalytics(request(),{DB,ANALYTICS_ENABLED:'false'})).status,503);
});
test('same-origin fetch metadata is accepted; database failures never report success',async()=>{
 const DB=new D1();assert.equal((await handleAnalytics(request(payload,{origin:'','sec-fetch-site':'same-origin'}),{DB})).status,204);
 DB.fail=true;assert.equal((await handleAnalytics(request(),{DB})).status,503);
 const failed={prepare(){return {run:async()=>({success:false})}}};assert.equal((await handleAnalytics(request(),{DB:failed})).status,503);
});

test('all supported events and pages persist, and failed batches roll back counters',async()=>{
 const DB=new D1();
 for(const event of ['page_view','feedback_added','import_completed','report_exported'])for(const page of ['overview','feedback','issues','reports','lab','architecture','privacy','terms','thankyou','notfound'])assert.equal((await handleAnalytics(request({event,page,consent:true}),{DB})).status,204);
 assert.equal(DB.rows().length,40);
 const batch=DB.batch.bind(DB);DB.batch=async statements=>{DB.fail=true;try{return await batch(statements);}finally{DB.fail=false;}};
 assert.equal((await handleAnalytics(request(),{DB})).status,503);assert.equal(DB.rows().find(row=>row.event==='page_view'&&row.page==='overview').count,1);
});

async function browser({saved=null,blocked=false,dnt=false,gpc=false,enabled=true}={}){
 const listeners=new Map();const nodes=new Map();const sent=[];let value=saved;let writes=0;
 const document={body:{append(node){nodes.set(node.id,node);}},querySelector(){return enabled?{}:null;},getElementById(id){return nodes.get(id)||null;},createElement(){return {hidden:false,setAttribute(){},innerHTML:'',contains(target){return target.inside===true;},querySelector(){return {focus(){}};}};},addEventListener(type,fn){listeners.set(type,fn);}};
 const localStorage={getItem(){if(blocked)throw Error('Storage denied');return value;},setItem(key,v){writes++;if(blocked)throw Error('Storage denied');assert.equal(key,'if-privacy-consent');value=v;}};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{doNotTrack:dnt?'1':'0',globalPrivacyControl:gpc}});
 Object.assign(globalThis,{document,window:{localStorage},fetch:async(url,options)=>{sent.push({url,options});return new Response(null,{status:204});}});
 const mod=await import(`../web/privacy.mjs?test=${Math.random()}`);
 const click=(kind,inside=true)=>listeners.get('click')?.({target:{inside,closest(selector){return selector==='[data-privacy-settings]'?(kind==='settings'?this:null):(kind==='settings'?null:this);},getAttribute(){return kind;}},preventDefault(){}});
 return {mod,sent,nodes,click,value:()=>value,writes:()=>writes};
}
test('browser sends nothing by default; acceptance is explicit and repeated initialization/render is safe',async()=>{
 const b=await browser();b.mod.initPrivacyControls();b.mod.initPrivacyControls();assert.equal(b.nodes.size,1);
 await b.mod.trackEvent('page_view','overview');assert.equal(b.sent.length,0);
 b.click('accept');assert.equal(b.value(),'accepted');assert.equal(b.nodes.values().next().value.hidden,true);
 await b.mod.trackEvent('page_view','overview');await b.mod.trackEvent('page_view','overview');await b.mod.trackEvent('feedback_added','feedback');assert.equal(b.sent.length,2);
 assert.equal(b.sent[0].url,'/api/analytics');assert.deepEqual(JSON.parse(b.sent[0].options.body),payload);assert.equal(b.sent[0].options.credentials,'omit');assert.equal(b.sent[0].options.referrerPolicy,'no-referrer');
 b.click('settings');assert.equal(b.nodes.values().next().value.hidden,false);b.click('reject');assert.equal(b.value(),'rejected');await b.mod.trackEvent('page_view','issues');assert.equal(b.sent.length,2);
});
test('DNT, GPC, absent server capability, storage failures and rejection keep analytics off',async()=>{
 for(const options of [{dnt:true,saved:'accepted'},{gpc:true,saved:'accepted'},{enabled:false,saved:'accepted'},{blocked:true},{saved:'rejected'}]){
  const b=await browser(options);b.mod.initPrivacyControls();if(options.blocked)b.click('accept');await b.mod.trackEvent('page_view','overview');assert.equal(b.sent.length,0);
 }
});
test('browser validates tiny allowlisted payloads and fails silently when transport fails',async()=>{
 const b=await browser({saved:'accepted'});b.mod.initPrivacyControls();await b.mod.trackEvent('anything','overview');await b.mod.trackEvent('page_view','overview?private=1');assert.equal(b.sent.length,0);
 globalThis.fetch=async()=>{throw Error('Offline');};await assert.doesNotReject(()=>b.mod.trackEvent('page_view','privacy'));
});
