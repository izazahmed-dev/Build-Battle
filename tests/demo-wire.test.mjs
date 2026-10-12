import test from 'node:test';
import assert from 'node:assert/strict';
import snapshot from '../web/demo-snapshot.json' with {type:'json'};
import {handleDemo} from '../server/demo.mjs';
import {unpackAnnotations} from '../web/engine.mjs';
test('public demo wire compression preserves all occurrence IDs, exact evidence and lineage',async()=>{
 const response=await handleDemo(new Request('https://site.test/api/demo/workspace'));
 const payload=await response.json(),decoded=unpackAnnotations(payload.state.enriched);
 assert.deepEqual(decoded.sort((a,b)=>a.id.localeCompare(b.id)),[...snapshot.workspace.enriched].sort((a,b)=>a.id.localeCompare(b.id)));
 const before=Buffer.byteLength(JSON.stringify(snapshot.workspace)),after=Buffer.byteLength(JSON.stringify(payload.state));
 assert.ok(after<before/2,'Compact wire representation must materially reduce transfer without changing meaning');
 console.log(JSON.stringify({originalWorkspaceBytes:before,wireWorkspaceBytes:after,annotations:decoded.length,annotationGroups:payload.state.enriched.length}));
});
