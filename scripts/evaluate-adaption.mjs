import {readFile,writeFile} from 'node:fs/promises';
import {prepare,group,classify,validateEnrichment} from '../web/engine.mjs';
const data=group(prepare(JSON.parse(await readFile('web/data.json','utf8')))),reference=JSON.parse(await readFile('artifacts/reference-labels.json','utf8'));
const file=process.argv[2]||'artifacts/adaption-verification.json',payload=JSON.parse(await readFile(file,'utf8'));
validateEnrichment(payload.results,payload.source_rows);const actual=new Map(payload.results.map(r=>[r.id,r]));
const selected=Object.entries(reference.labels).filter(([id])=>actual.has(id));
const comparison=selected.map(([id,expected])=>{const source=data.find(r=>r.id===id);if(!source)throw Error('Reference ID missing');return {id,review:source.review,expected,baseline:classify(source.review),adaption:actual.get(id).sentiment,evidence:actual.get(id).evidence}});
const result={generated_at:new Date().toISOString(),provider_run_id:payload.run.provider_run_id,prompt_version:payload.run.prompt_version,reference_description:reference.description,total_reference_texts:Object.keys(reference.labels).length,evaluated_texts:comparison.length,baseline_agreement:comparison.filter(r=>r.baseline===r.expected).length,adaption_agreement:comparison.filter(r=>r.adaption===r.expected).length,validated_output_texts:payload.results.length,rejected_output_texts:payload.rejections.length,comparison,limitation:'Judgment-sample agreement, not full-dataset accuracy. The reference is assistant-labelled and includes deliberately challenging cases. Exact-quote validity is assessed separately from sentiment correctness.'};
await writeFile('artifacts/evaluation.json',JSON.stringify(result,null,2));console.log(JSON.stringify({...result,comparison:undefined},null,2));
