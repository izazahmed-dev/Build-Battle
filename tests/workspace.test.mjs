import test from 'node:test';
import assert from 'node:assert/strict';
import {handleWorkspace,validateState} from '../server/workspace.mjs';
class DB{
 head=null;
 prepare(sql){return {bind:(...args)=>({first:async()=>this.head,run:async()=>{
  if(sql.startsWith('INSERT')){if(this.head)return {meta:{changes:0}};this.head={revision:args[1],object_key:args[2],updated_at:args[3]}}
  else{if(this.head?.revision!==args[4])return {meta:{changes:0}};this.head={revision:args[0],object_key:args[1],updated_at:args[2]}}
  return {meta:{changes:1}};
 }})}}
}
class Bucket{data=new Map;async put(k,v){this.data.set(k,v)}async get(k){return this.data.has(k)?{json:async()=>JSON.parse(this.data.get(k))}:null}}
const state={imported:[{id:'NEW-1',review:'Support resolved my problem.',category:'Customer Service',source:'Manual entry',occurred_at:'2026-10-11'}],saved:{support:{name:'Support',action:'Investigate',owner:'CX',status:'Planned'}},enriched:[{id:'NEW-1',sentiment:'Positive',evidence:'resolved',method:'Human-reviewed annotation'}]};
const req=body=>new Request('https://site.test/api/workspace',body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});
test('durable workspace roundtrip and stale-write prevention preserve the newest snapshot',async()=>{const env={DB:new DB,BUCKET:new Bucket};assert.equal((await(await handleWorkspace(req(),env)).json()).revision,0);assert.equal((await handleWorkspace(req({revision:0,state}),env)).status,200);let response=await(await handleWorkspace(req(),env)).json();assert.equal(response.revision,1);assert.equal(response.state.imported[0].review,state.imported[0].review);assert.equal((await handleWorkspace(req({revision:0,state:{...state,saved:{}}}),env)).status,409);assert.equal((await handleWorkspace(req({revision:1,state}),env)).status,200);response=await(await handleWorkspace(req(),env)).json();assert.equal(response.revision,2);assert.equal(response.state.saved.support.owner,'CX')});
test('workspace refuses invalid dates, labels, issue status and cross-origin saves',async()=>{assert.throws(()=>validateState({...state,imported:[{...state.imported[0],occurred_at:'2026-02-30'}]}));assert.throws(()=>validateState({...state,enriched:[{...state.enriched[0],sentiment:'Perfect'}]}));assert.throws(()=>validateState({...state,saved:{support:{status:'Invented'}}}));const r=new Request('https://site.test/api/workspace',{method:'POST',headers:{origin:'https://evil.test','Content-Type':'application/json'},body:JSON.stringify({revision:0,state})});assert.equal((await handleWorkspace(r,{DB:new DB,BUCKET:new Bucket})).status,403)});
