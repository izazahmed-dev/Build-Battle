import snapshot from '../web/demo-snapshot.json' with {type:'json'};
import {evaluateRun} from './evaluation.mjs';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export function handleDemo(request){
 if(request.method!=='GET')return json({error:'This judge preview cannot change the server workspace or start paid analysis. Explore locally and export your work.'},403);
 const route=new URL(request.url).pathname.replace(/^\/api\/(?:demo\/)?/,'');
 if(route==='workspace')return json({demo:true,revision:0,state:snapshot.workspace});
 if(route==='adaption/connection')return json({demo:true,connected:false,storage:false,provider:'Adaption',prompt_version:snapshot.payload.run.prompt_version});
 if(route==='adaption/runs')return json({runs:[snapshot.payload.run],demo:true});
 if(route==='adaption/runs/'+snapshot.payload.run.id)return json(snapshot.payload.run);
 if(route==='adaption/runs/'+snapshot.payload.run.id+'/results'){const p=snapshot.payload;return json({...p,evaluation:evaluateRun({...p.run,rows:p.source_rows,results:p.results})})}
 return json({error:'Unknown demo endpoint.'},404);
}
