import {summarize,issues,group,topics} from './engine.mjs';

// Untrusted review text remains literal Markdown, never headings or raw HTML.
const text=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/([\\`*_{}\[\]()#+!|])/g,'\\$1');
const quote=value=>String(value??'').split(/\r?\n/).map(line=>'> '+text(line)).join('\n');
const label=value=>text(String(value??'').replace(/[\r\n]+/g,' '));
export function priorityBreakdown(issue,total){
 return {severity:60*issue.severity/5,frequency:total?40*issue.count/total:0,matching:issue.count,total,score:issue.score};
}
export function decisionBrief({rows,saved={},unique=false,category='All categories',sentiment='All sentiments',query='',demo=true,generatedAt=new Date().toISOString()}){
 const s=summarize(rows,unique),ranked=issues(rows,unique),distinct=group(rows);
 const provenance=new Map;
 for(const row of rows){for(const a of [row,row.previous_analysis].filter(Boolean)){
  if(!a.provider_run_id)continue;
  const key=JSON.stringify([a.dataset_id,a.provider_run_id]);
  if(!provenance.has(key))provenance.set(key,{dataset:a.dataset_id,run:a.provider_run_id,method:a.method});
 }}
 const methods=new Map;for(const r of distinct)methods.set(r.method,(methods.get(r.method)||0)+1);
 const trackedIds=Object.keys(saved).filter(id=>!ranked.some(i=>i.id===id));
 return `# InsightFlow — Customer feedback brief\n\nGenerated: ${label(generatedAt)}\nScope: ${label(category)}; ${label(sentiment)}; search=${label(query||'(none)')}; count=${unique?'distinct texts':'all rows'}\n\n## Evidence base\n${s.raw} rows; ${s.unique} distinct texts; ${s.total} counted items.\nSentiment: ${Object.entries(s.sentiments).map(([k,n])=>`${k} ${n}`).join(', ')}.\n\n## Priorities\n${ranked.map((i,n)=>{
 const p=priorityBreakdown(i,s.total),tracked=saved[i.id];
 return `### ${n+1}. ${i.name}\n${i.count} matching ${unique?'distinct texts':'rows'}; priority ${i.score}/100.\nCalculation: round(60 × ${i.severity}/5 + 40 × ${i.count}/${s.total}) = round(${p.severity.toFixed(2)} + ${p.frequency.toFixed(2)}) = ${p.score}.\nRecommendation: ${label(tracked?.action||i.action)}\nStatus: ${label(tracked?.status||'Not tracked')}\nOwner: ${label(tracked?.owner||i.owner)}\n\n${group(i.evidence).slice(0,3).map(r=>`Source ${label(r.id)} · ${label(r.category)} · ${label(r.sentiment)} · ${label(r.method)}\n${quote(r.review)}${r.evidence?'\nSupporting quote:\n'+quote(r.evidence):''}${r.previous_analysis?'\nBefore human review: '+label(r.previous_analysis.sentiment)+' · '+label(r.previous_analysis.method):''}`).join('\n\n')}`;
 }).join('\n\n')||'No matching issues in this selection.'}
${trackedIds.length?`\n## Tracked decisions outside this evidence scope\n${trackedIds.map(id=>{const t=saved[id],theme=topics.find(x=>x.id===id);return `- ${label(t.name)}${theme?'':' (custom tracked decision)'}: status ${label(t.status)}, owner ${label(t.owner)}. ${theme?theme.name:'This decision'} has no matching feedback under the current filters. This is your workflow decision, not evidence the customer issue was resolved.`}).join('\n')}\n`:''}
## Analysis provenance\nAnalysis provenance by distinct text: ${[...methods].map(([method,n])=>n+' '+label(method)).join('; ')||'No labels'}.\n${[...provenance.values()].map(p=>`- Dataset: ${label(p.dataset||'Not recorded')}\n  Run: ${label(p.run)}\n  Method: ${label(p.method)}`).join('\n')||'No provider run is attached to this selection.'}\n\n${distinct.some(r=>/^(Human|Reviewed)/.test(r.method))?'Reviewed labels are user decisions, not provider endorsements. Where retained, the preceding analysis stays separate from the active correction.\n\n':''}## Method and limits\nExact quotes validate source grounding, not sentiment correctness. Priority = round(60 × severity/5 + 40 × matching items/selected items). Severity is a product policy, not a learned probability. Five complaint themes and recommended actions are deterministic rules, not learned root causes. Themes may overlap. Repeated text does not establish independent customers. The supplied CSV has no timestamps, customer IDs, ratings, channel or revenue. No historical trend or financial impact is inferred. Evidence excerpts above are a sample, not the entire matching set. ${demo?'Public demo edits remain in this browser; export to keep your work.':'Tracked state uses the private workspace; check the save indicator before closing.'}\n`;
}
