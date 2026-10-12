// First-party counters only. Never persist request headers or visitor records.
const EVENTS=new Set(['page_view','feedback_added','import_completed','report_exported']);
const PAGES=new Set(['overview','feedback','issues','reports','lab','architecture','privacy','terms','thankyou','notfound']);
const LIMIT=1024;
const reply=(status,error)=>new Response(error?JSON.stringify({error}):null,{status,headers:{'Cache-Control':'no-store',...(error?{'Content-Type':'application/json'}:{}),...(status===405?{Allow:'POST'}:{})}});
async function boundedBody(request){
 const reader=request.body?.getReader();if(!reader)return '';
 const chunks=[];let length=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>LIMIT){await reader.cancel();throw new RangeError('Payload too large');}chunks.push(value);}}
 finally{reader.releaseLock();}
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 return new TextDecoder('utf-8',{fatal:true}).decode(bytes);
}
function checked(result){if(result?.success===false)throw Error('Persistence failed');}
export async function handleAnalytics(request,env={}){
 if(request.method!=='POST')return reply(405,'Method not allowed.');
 if(!env.DB||env.ANALYTICS_ENABLED==='false')return reply(503,'Analytics unavailable.');
 const origin=request.headers.get('origin'),site=request.headers.get('sec-fetch-site');
 if((origin&&origin!==new URL(request.url).origin)||(site&&site!=='same-origin')||(!origin&&site!=='same-origin'))return reply(403,'Same-origin requests only.');
 if(request.headers.get('dnt')==='1'||request.headers.get('sec-gpc')==='1')return reply(403,'Privacy signal enabled.');
 if((request.headers.get('content-type')||'').split(';')[0].trim().toLowerCase()!=='application/json')return reply(415,'Send application/json.');
 if(Number(request.headers.get('content-length'))>LIMIT)return reply(413,'Payload too large.');
 let body;try{body=JSON.parse(await boundedBody(request));}catch(error){return reply(error instanceof RangeError?413:400,'Invalid payload.');}
 if(!body||typeof body!=='object'||Array.isArray(body))return reply(400,'Invalid payload.');
 if(body.consent!==true)return reply(403,'Explicit consent required.');
 if(Object.keys(body).length!==3||!EVENTS.has(body.event)||!PAGES.has(body.page))return reply(400,'Invalid event or page.');
 const now=new Date(),day=now.toISOString().slice(0,10);now.setUTCDate(now.getUTCDate()-29);const oldest=now.toISOString().slice(0,10);
 try{
  checked(await env.DB.prepare('CREATE TABLE IF NOT EXISTS analytics_daily (day TEXT NOT NULL, event TEXT NOT NULL, page TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, event, page))').run());
  const statements=[env.DB.prepare('DELETE FROM analytics_daily WHERE day < ?').bind(oldest),env.DB.prepare('INSERT INTO analytics_daily (day, event, page, count) VALUES (?, ?, ?, 1) ON CONFLICT(day, event, page) DO UPDATE SET count = count + 1').bind(day,body.event,body.page)];
  const results=await env.DB.batch(statements);for(const result of results)checked(result);
  return reply(204);
 }catch{return reply(503,'Analytics could not be recorded.');}
}
