const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export function validateState(state){
 if(!state||!Array.isArray(state.imported)||!Array.isArray(state.enriched)||!state.saved||typeof state.saved!=='object'||Array.isArray(state.saved))throw Error('Invalid workspace format.');
 if(state.imported.length>40000||state.enriched.length>60000||Object.keys(state.saved).length>100)throw Error('Workspace capacity exceeded. Export your feedback before adding more.');
 const ids=new Set;
 const imported=state.imported.map(r=>{if(typeof r.id!=='string'||r.id.length>100||ids.has(r.id)||typeof r.review!=='string'||!r.review.trim()||r.review.length>10000)throw Error('Invalid imported feedback.');ids.add(r.id);if(r.occurred_at&&(!/^\d{4}-\d{2}-\d{2}$/.test(r.occurred_at)||!Number.isFinite(Date.parse(r.occurred_at))||new Date(r.occurred_at).toISOString().slice(0,10)!==r.occurred_at))throw Error('Invalid feedback date.');return {id:r.id,review:r.review,category:String(r.category||'Uncategorized').slice(0,100),source:String(r.source||'Imported').slice(0,200),occurred_at:r.occurred_at||null}});
 const saved=Object.fromEntries(Object.entries(state.saved).map(([id,r])=>{if(!/^[a-z0-9_-]{1,100}$/i.test(id)||!['Planned','In progress','Resolved'].includes(r.status))throw Error('Invalid issue record.');return [id,{name:String(r.name||'').slice(0,200),action:String(r.action||'').slice(0,2000),owner:String(r.owner||'Unassigned').slice(0,100),status:r.status,updated_at:r.updated_at||null}]}));
 const enriched=state.enriched.map(r=>{if(typeof r.id!=='string'||r.id.length>100||!['Positive','Negative','Mixed','Unclear'].includes(r.sentiment)||typeof r.evidence!=='string'||!r.evidence.trim()||r.evidence.length>10000)throw Error('Invalid analysis annotation.');return {id:r.id,sentiment:r.sentiment,evidence:r.evidence,method:String(r.method||'User annotation').slice(0,100),...(r.provider_run_id?{provider_run_id:String(r.provider_run_id).slice(0,200)}:{}),...(r.dataset_id?{dataset_id:String(r.dataset_id).slice(0,200)}:{})}});
 return {imported,saved,enriched};
}
export async function handleWorkspace(request,env){
 try{
  if(!env.DB||!env.BUCKET)return json({error:'Workspace storage is unavailable.'},503);
  // Sites enforces access to this owner-private workspace.
  if(request.method==='GET'){
   const head=await env.DB.prepare('SELECT revision, object_key, updated_at FROM workspace_head WHERE id = ?').bind('owner').first();
   if(!head)return json({revision:0,state:null});const object=await env.BUCKET.get(head.object_key);if(!object)return json({error:'Saved workspace could not be loaded.'},503);
   return json({revision:head.revision,updated_at:head.updated_at,state:await object.json()});
  }
  if(request.method!=='POST')return json({error:'Method not allowed.'},405);
  const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return json({error:'Cross-origin requests are not allowed.'},403);
  if(!(request.headers.get('content-type')||'').startsWith('application/json'))return json({error:'Send JSON.'},415);
  if(Number(request.headers.get('content-length')||0)>6_000_000)return json({error:'Workspace is too large. Export your feedback.'},413);
  const raw=await request.text();if(raw.length>6_000_000)return json({error:'Workspace is too large. Export your feedback.'},413);
  let body;try{body=JSON.parse(raw)}catch{return json({error:'Invalid JSON.'},400)}
  if(!Number.isSafeInteger(body.revision)||body.revision<0)return json({error:'Invalid workspace revision.'},400);
  const state=validateState(body.state),revision=body.revision+1,updated_at=new Date().toISOString(),key='workspace/snapshots/'+crypto.randomUUID()+'.json';
  await env.BUCKET.put(key,JSON.stringify(state),{httpMetadata:{contentType:'application/json'}});
  const statement=body.revision===0?env.DB.prepare('INSERT INTO workspace_head (id, revision, object_key, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO NOTHING').bind('owner',revision,key,updated_at):env.DB.prepare('UPDATE workspace_head SET revision = ?, object_key = ?, updated_at = ? WHERE id = ? AND revision = ?').bind(revision,key,updated_at,'owner',body.revision);
  const result=await statement.run();if(result.meta.changes!==1)return json({error:'Another tab saved a newer workspace. Export your local work, then reload to continue.',conflict:true},409);
  return json({revision,updated_at});
 }catch(error){return json({error:error.message||'Workspace could not be saved.'},400)}
}
