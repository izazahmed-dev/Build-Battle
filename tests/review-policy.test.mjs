import test from 'node:test';
import assert from 'node:assert/strict';
import {createReviewedAnnotation,applyImportedAnalysis} from '../web/review-policy.mjs';
import {packAnnotations,unpackAnnotations,validateEnrichment} from '../web/engine.mjs';
import {validateState,handleWorkspace} from '../server/workspace.mjs';

const provider=()=>({id:'REVIEW-1',review:'Support was slow but resolved it.',category:'Customer Service',source:'Original CSV',occurred_at:'2026-10-11',sentiment:'Mixed',evidence:'slow but resolved',method:'Adaption · v1',provider_run_id:'actual-run',dataset_id:'actual-dataset'});
const correction={sentiment:'Negative',evidence:'slow'};
const stateFor=annotation=>({imported:[{id:annotation.id,review:provider().review}],saved:{},enriched:[annotation]});

test('review is pure, preserves original provider lineage and original source values',()=>{
 const original=provider(),before=structuredClone(original),annotation=createReviewedAnnotation(original,correction);
 assert.deepEqual(original,before);
 assert.deepEqual(annotation,{id:original.id,...correction,method:'Reviewed annotation',previous_analysis:{sentiment:'Mixed',evidence:'slow but resolved',method:'Adaption · v1',provider_run_id:'actual-run',dataset_id:'actual-dataset'}});
 const row={...original,...annotation};delete row.provider_run_id;delete row.dataset_id;
 const second=createReviewedAnnotation(row,{sentiment:'Positive',evidence:'resolved'});
 assert.deepEqual(second.previous_analysis,annotation.previous_analysis);
 assert.notEqual(second.previous_analysis,annotation.previous_analysis);
 assert.equal(second.previous_analysis.previous_analysis,undefined);
 for(const key of ['review','category','source','occurred_at'])assert.equal(row[key],before[key]);
});
test('imported annotation lineage is retained; baseline and legacy human labels invent no provider history',()=>{
 const imported={...provider(),method:'Imported analysis (user supplied)'};delete imported.provider_run_id;delete imported.dataset_id;
 assert.equal(createReviewedAnnotation(imported,correction).previous_analysis.method,imported.method);
 assert.equal(createReviewedAnnotation({...provider(),method:'Rule-based preview',evidence:undefined,provider_run_id:undefined,dataset_id:undefined},correction).previous_analysis,undefined);
 assert.equal(createReviewedAnnotation({...provider(),method:'Human-reviewed annotation'},correction).previous_analysis,undefined);
});
test('review and imports reject unknown IDs, duplicate IDs, invalid sentiments and nonexact/blank quotes',()=>{
 for(const patch of [{sentiment:'Perfect'},{evidence:'Slow'},{evidence:' '},{evidence:42}])assert.throws(()=>createReviewedAnnotation(provider(),{...correction,...patch}));
 assert.throws(()=>createReviewedAnnotation({...provider(),id:''},correction));
 const valid={id:'REVIEW-1',...correction};
 for(const records of [[{...valid,id:'unknown'}],[valid,valid],[{...valid,evidence:'SLOW'}],[{...valid,sentiment:'Perfect'}]])assert.throws(()=>applyImportedAnalysis([provider()],records));
});
test('manual import protects Human/Reviewed occurrences and applies only to exact matching text',()=>{
 const original=provider(),reviewed={...original,...createReviewedAnnotation(original,correction)},human={...original,id:'HUMAN-1',method:'Human-reviewed annotation'},duplicate={...original,id:'DUP-1'},caseDifferent={...original,id:'CASE-1',review:'support was slow but resolved it.'};
 const input=[original,reviewed,human,duplicate,caseDifferent];reviewed.id='REVIEWED-1';
 const before=structuredClone(input),result=applyImportedAnalysis(input,validateEnrichment([{id:original.id,sentiment:'Positive',evidence:'resolved'}],input));
 assert.deepEqual(input,before);assert.equal(result.applied,2);assert.equal(result.protected,2);assert.deepEqual(result.annotations.map(r=>r.id),['REVIEW-1','DUP-1']);
 assert.equal(result.rows[0].method,'Imported analysis (user supplied)');assert.equal(result.rows[0].provider_run_id,undefined);assert.equal(result.rows[0].dataset_id,undefined);
 assert.deepEqual(result.rows[1],reviewed);assert.deepEqual(result.rows[2],human);assert.deepEqual(result.rows[4],caseDifferent);
 assert.notEqual(result.rows[1].previous_analysis,reviewed.previous_analysis);
 for(let i=0;i<input.length;i++)for(const key of ['id','review','category','source','occurred_at'])assert.equal(result.rows[i][key],input[i][key]);
});
test('ambiguous labels for the same exact text are rejected without mutation',()=>{
 const rows=[provider(),{...provider(),id:'DUP-1'}],before=structuredClone(rows);
 assert.throws(()=>applyImportedAnalysis(rows,[{id:'REVIEW-1',...correction},{id:'DUP-1',sentiment:'Positive',evidence:'resolved'}]),/Conflicting/);assert.deepEqual(rows,before);
});
test('compact backup and server validation retain a bounded nonrecursive original snapshot',()=>{
 const annotation=createReviewedAnnotation(provider(),correction);
 assert.deepEqual(unpackAnnotations(packAnnotations([annotation])),[annotation]);
 assert.deepEqual(validateState(stateFor(annotation)).enriched,[annotation]);
 for(const patch of [{previous_analysis:{...annotation.previous_analysis,previous_analysis:{}}},{previous_analysis:{...annotation.previous_analysis,evidence:'invented'}},{previous_analysis:{...annotation.previous_analysis,sentiment:'Perfect'}},{previous_analysis:{...annotation.previous_analysis,method:'x'.repeat(101)}},{previous_analysis:{...annotation.previous_analysis,provider_run_id:'x'.repeat(201)}},{previous_analysis:{...annotation.previous_analysis,dataset_id:42}},{method:'Imported analysis (user supplied)'},{previous_analysis:null},{previous_analysis:{...annotation.previous_analysis,reviewer:'authenticated person'}},{previous_analysis:{...annotation.previous_analysis,method:'Reviewed annotation'}}])assert.throws(()=>validateState(stateFor({...annotation,...patch})));
 assert.throws(()=>validateState({...stateFor(annotation),enriched:[{...annotation,id:'UNKNOWN'}]}));
});
test('workspace POST/GET roundtrip retains lineage and rejects malformed history before writes',async()=>{
 let head=null;const objects=new Map;
 const env={DB:{prepare:()=>({bind:(...args)=>({first:async()=>head,run:async()=>{head={revision:args[1],object_key:args[2],updated_at:args[3]};return {meta:{changes:1}}}})})},BUCKET:{put:async(k,v)=>objects.set(k,v),get:async k=>({json:async()=>JSON.parse(objects.get(k))})}};
 const annotation=createReviewedAnnotation(provider(),correction),state=stateFor(annotation),url='https://site.test/api/workspace';
 const post=state=>new Request(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:0,state})});
 assert.equal((await handleWorkspace(post(state),env)).status,200);
 const loaded=await(await handleWorkspace(new Request(url),env)).json();assert.deepEqual(loaded.state.enriched,[annotation]);
 const before=objects.size;assert.equal((await handleWorkspace(post(stateFor({...annotation,previous_analysis:{...annotation.previous_analysis,previous_analysis:{}}})),env)).status,400);assert.equal(objects.size,before);
});
