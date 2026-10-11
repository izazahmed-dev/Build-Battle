import test from 'node:test';
import assert from 'node:assert/strict';
import {handleAdaption,extractResults} from '../server/adaption.mjs';
class Bucket{data=new Map;async put(k,v){this.data.set(k,v)}async get(k){const v=this.data.get(k);return v===undefined?null:{json:async()=>JSON.parse(v)}}async list({prefix}){return {objects:[...this.data.keys()].filter(k=>k.startsWith(prefix)).map(key=>({key}))}}}
const source=[{id:'FB-001',review:'Delivery was delayed, but support was helpful.',category:'Operational Issues'},{id:'FB-002',review:'No fraudulent activity or scam during my purchase.',category:'Fraud and Scam'}];
const req=(route,body,origin)=>new Request('https://example.test/api/adaption/'+route,{...(body?{method:'POST',headers:{'Content-Type':'application/json',...(origin?{origin}:{})},body:JSON.stringify(body)}:{})});
const reply=(o,status=200)=>new Response(JSON.stringify(o),{status});
test('live pipeline preserves provenance, quotes cost, avoids repeat launch, validates output',async()=>{
 const env={ADAPTION_API_KEY:'test-secret',BUCKET:new Bucket};let started=0,created=0,finished=false;
 const fetcher=async(url,init)=>{const path=new URL(url).pathname;
  if(url.startsWith('https://example-bucket.s3.amazonaws.com')){assert.equal(init.headers.Authorization,undefined);return new Response('',{status:200})}
  assert.equal(init.headers.Authorization,'Bearer test-secret');
  if(path==='/api/v1/datasets'){created++;return reply({dataset_id:'provider-dataset-1',upload_instructions:{url:'https://example-bucket.s3.amazonaws.com/input'}})}
  if(path.endsWith('/upload/complete'))return reply({status:'processing'});
  if(path.endsWith('/start-adaption'))return reply({status:'processing'},202);
  if(path.endsWith('/status'))return reply({row_count:2,status:finished?'succeeded':started?'running':'awaiting_input',progress:started?{percent:30}:null});
  if(path.endsWith('/adapt')){const config=JSON.parse(init.body);assert.equal(config.recipe_specification.recipes.prompt_rephrase,false);assert.ok(config.column_mapping.context.includes('id'));assert.equal(config.column_mapping.completion,'baseline_completion');if(config.estimate)return reply({estimatedCreditsConsumed:2,estimatedMinutes:1});started++;return reply({run_id:'provider-run-1'})}
  if(path.endsWith('/download'))return reply([{enhanced_completion:JSON.stringify({id:'FB-001',sentiment:'Mixed',evidence:'delayed'})},{enhanced_completion:JSON.stringify({id:'FB-002',sentiment:'Positive',evidence:'No fraudulent activity'})},{enhanced_completion:JSON.stringify({id:'unknown',sentiment:'Positive',evidence:'made up'})}]);
  throw Error('Unexpected provider path '+path)
 };
 const prepare=await handleAdaption(req('prepare',{rows:source}),env,fetcher);assert.equal(prepare.status,201);let run=await prepare.json();assert.equal(run.status,'ingesting');
 await handleAdaption(req('prepare',{rows:source}),env,fetcher);assert.equal(created,1);
 run=await (await handleAdaption(req('runs/'+run.id),env,fetcher)).json();assert.equal(run.status,'ready');assert.equal(run.estimated_credits,2);
 const denied=await handleAdaption(req('runs/'+run.id+'/start',{confirmed_credits:1}),env,fetcher);assert.equal(denied.status,409);assert.equal(started,0);
 run=await (await handleAdaption(req('runs/'+run.id+'/start',{confirmed_credits:2}),env,fetcher)).json();assert.equal(run.provider_run_id,'provider-run-1');assert.equal(started,1);
 await handleAdaption(req('runs/'+run.id+'/start',{confirmed_credits:2}),env,fetcher);assert.equal(started,1);
 finished=true;run=await (await handleAdaption(req('runs/'+run.id),env,fetcher)).json();assert.equal(run.status,'completed');assert.equal(run.accepted,2);assert.equal(run.rejected,1);
 const result=await (await handleAdaption(req('runs/'+run.id+'/results'),env,fetcher)).json();assert.equal(result.results[0].sentiment,'Mixed');assert.equal(result.source_rows[0].review,source[0].review);assert.ok(!JSON.stringify(result).includes('test-secret'));
});
test('provider parsing accepts JSONL and rejects hallucinated evidence',()=>{const r=extractResults(JSON.stringify({enhanced_completion:'```json\n'+JSON.stringify({id:'FB-001',sentiment:'Mixed',evidence:'delayed'})+'\n```'})+'\n'+JSON.stringify({enhanced_completion:JSON.stringify({id:'FB-002',sentiment:'Negative',evidence:'payment stolen'})}),source);assert.equal(r.results.length,1);assert.equal(r.rejections.length,1)});
test('server blocks cross-origin mutations, duplicate input and missing configuration',async()=>{let calls=0;const env={ADAPTION_API_KEY:'secret',BUCKET:new Bucket},fetcher=()=>{calls++;throw Error('Should not call provider')};assert.equal((await handleAdaption(req('prepare',{rows:source},'https://evil.test'),env,fetcher)).status,403);assert.equal((await handleAdaption(req('prepare',{rows:[source[0],source[0]]}),env,fetcher)).status,400);assert.equal((await handleAdaption(req('connection'),{},fetcher)).status,503);assert.equal(calls,0)});
test('provider errors redact the configured secret',async()=>{const env={ADAPTION_API_KEY:'sensitive-test-value',BUCKET:new Bucket};const response=await handleAdaption(req('connection'),env,async()=>reply({message:'sensitive-test-value rejected'},401));assert.equal(response.status,502);assert.ok(!(await response.text()).includes('sensitive-test-value'))});
test('a timed-out provider launch is recovered without a second billable submission',async()=>{
 const env={ADAPTION_API_KEY:'test-secret',BUCKET:new Bucket};let launches=0,finished=false;
 const fetcher=async(url,init)=>{const path=new URL(url).pathname;if(url.startsWith('https://example-bucket.s3.amazonaws.com'))return new Response('');if(path==='/api/v1/datasets')return reply({dataset_id:'timeout-dataset',upload_instructions:{url:'https://example-bucket.s3.amazonaws.com/input'}});if(path.endsWith('/upload/complete')||path.endsWith('/start-adaption'))return reply({status:'processing'});if(path.endsWith('/status'))return reply({row_count:2,status:finished?'succeeded':launches?'running':'awaiting_input'});if(path.endsWith('/adapt')){if(JSON.parse(init.body).estimate)return reply({estimatedCreditsConsumed:1,estimatedMinutes:11});launches++;throw new DOMException('Provider response timed out','TimeoutError')}if(path.endsWith('/timeout-dataset'))return reply({run_id:'recovered-run'});if(path.endsWith('/download'))return reply([{enhanced_completion:JSON.stringify({id:'FB-001',sentiment:'Mixed',evidence:'delayed'})}]);throw Error('Unexpected path '+path)};
 let run=await(await handleAdaption(req('prepare',{rows:source}),env,fetcher)).json();run=await(await handleAdaption(req('runs/'+run.id),env,fetcher)).json();assert.equal((await handleAdaption(req('runs/'+run.id+'/start',{confirmed_credits:1}),env,fetcher)).status,502);await handleAdaption(req('runs/'+run.id+'/start',{confirmed_credits:1}),env,fetcher);assert.equal(launches,1);run=await(await handleAdaption(req('runs/'+run.id),env,fetcher)).json();assert.equal(run.status,'running');assert.equal(run.provider_run_id,'recovered-run');assert.equal(run.error,null);finished=true;run=await(await handleAdaption(req('runs/'+run.id),env,fetcher)).json();assert.equal(run.status,'completed');assert.equal(launches,1);
});
