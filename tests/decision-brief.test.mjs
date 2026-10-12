import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {prepare,issues,summarize} from '../web/engine.mjs';
import {decisionBrief,priorityBreakdown} from '../web/decision-brief.mjs';
const source=prepare(JSON.parse(await readFile(new URL('../web/data.json',import.meta.url),'utf8')));

test('decision brief carries reproducible numeric priorities in both counting modes',()=>{
 for(const unique of [false,true]){
  const output=decisionBrief({rows:source,unique,generatedAt:'2026-10-12T00:00:00Z'}),s=summarize(source,unique);
  for(const i of issues(source,unique)){
   const p=priorityBreakdown(i,s.total);assert.equal(Math.round(p.severity+p.frequency),i.score);
   assert.ok(output.includes(`40 × ${i.count}/${s.total}`));assert.ok(output.includes(i.evidence[0].id));
  }
  assert.ok(output.includes('7000 rows; 320 distinct texts'));assert.ok(output.includes('No historical trend or financial impact is inferred'));
 }
});
test('brief retains original provider lineage separately from a reviewed decision',()=>{
 const rows=[{...source[2],sentiment:'Negative',method:'Reviewed annotation',evidence:source[2].review,previous_analysis:{sentiment:'Mixed',evidence:'victim of fraud',method:'Adaption · fixture-version',provider_run_id:'test-run',dataset_id:'test-dataset'}}];
 const output=decisionBrief({rows,saved:{fraud:{status:'Planned',owner:'Trust & Safety',action:'Verify the allegation.'}}});
 assert.match(output,/Before human review: Mixed/);assert.match(output,/Dataset: test-dataset/);assert.match(output,/Run: test-run/);assert.match(output,/Owner: Trust &amp; Safety/);assert.match(output,/user decisions, not provider endorsements/);
});
test('tracked decisions outside the filtered scope stay in the brief without changing priorities',()=>{
 const positiveOnly=source.filter(r=>r.sentiment!=='Negative'&&r.sentiment!=='Mixed');
 const output=decisionBrief({rows:positiveOnly,saved:{support:{name:'Unresolved support requests',status:'In progress',owner:'CX',action:'Triage.'}},category:'Positive'});
 assert.match(output,/## Tracked decisions outside this evidence scope/);assert.match(output,/Unresolved support requests/);assert.match(output,/status In progress/);assert.match(output,/workflow decision, not evidence/);
 assert.ok(!output.includes('### 1. Unresolved support requests'),'priorities must not gain out-of-scope entries');
 assert.doesNotMatch(decisionBrief({rows:source}),/outside this evidence scope/,'no section when nothing is out of scope');
});
test('export escapes Markdown and HTML in untrusted text, keeps empty scopes honest',()=>{
 const rows=[{...source[2],review:'fraud <img src=x onerror=alert(1)>\n# forged heading',method:'Rule-based preview'}];
 const output=decisionBrief({rows,saved:{fraud:{owner:'<script>bad</script>',action:'[click](javascript:alert(1))',status:'Planned'}}});
 assert.ok(!output.includes('<img'));assert.ok(!output.includes('<script>'));assert.ok(!output.includes('\n# forged heading'));
 assert.match(decisionBrief({rows:[]}),/0 rows; 0 distinct texts; 0 counted items/);assert.match(decisionBrief({rows:[]}),/No matching issues/);
});
