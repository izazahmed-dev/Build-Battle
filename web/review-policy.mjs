import {validateEnrichment} from './engine.mjs';

const sentiments=new Set(['Positive','Negative','Mixed','Unclear']);
const isReviewed=method=>/^(Human|Reviewed)/.test(method||'');

// Shared by browser policy and workspace validation. History is a single,
// bounded annotation, not an audit log or an authenticated identity claim.
export function validatePreviousAnalysis(previous,review){
 const allowed=new Set(['sentiment','evidence','method','provider_run_id','dataset_id']);
 if(!previous||typeof previous!=='object'||Array.isArray(previous)||Object.keys(previous).some(key=>!allowed.has(key)))throw Error('Invalid previous analysis snapshot.');
 if(!sentiments.has(previous.sentiment)||typeof previous.evidence!=='string'||!previous.evidence.trim()||previous.evidence.length>10000||!review.includes(previous.evidence)||typeof previous.method!=='string'||!previous.method.trim()||previous.method.length>100||isReviewed(previous.method))throw Error('Previous analysis needs a valid label, method and exact supporting quote.');
 const snapshot={sentiment:previous.sentiment,evidence:previous.evidence,method:previous.method};
 for(const key of ['provider_run_id','dataset_id'])if(Object.hasOwn(previous,key)){
  if(typeof previous[key]!=='string'||!previous[key].trim()||previous[key].length>200)throw Error('Invalid previous analysis lineage.');
  snapshot[key]=previous[key];
 }
 return snapshot;
}

// Returns an annotation only. The caller owns merging it into the row and
// clearing obsolete top-level provider_run_id/dataset_id on reviewed rows.
export function createReviewedAnnotation(row,correction){
 if(!row||typeof row.id!=='string'||!row.id.trim()||row.id.length>100||typeof row.review!=='string')throw Error('Review needs a known source row.');
 const checked=validateEnrichment([{id:row.id,sentiment:correction?.sentiment,evidence:correction?.evidence}],[row])[0];
 if(checked.evidence.length>10000)throw Error('Supporting quote exceeds 10,000 characters.');
 const annotation={id:row.id,sentiment:checked.sentiment,evidence:checked.evidence,method:'Reviewed annotation'};
 if(isReviewed(row.method)){
  if(Object.hasOwn(row,'previous_analysis'))annotation.previous_analysis=validatePreviousAnalysis(row.previous_analysis,row.review);
 }else if(/^(Adaption|Imported)/.test(row.method||'')||row.provider_run_id||row.dataset_id){
  const original={sentiment:row.sentiment,evidence:row.evidence,method:row.method};
  for(const key of ['provider_run_id','dataset_id'])if(row[key]!==undefined)original[key]=row[key];
  annotation.previous_analysis=validatePreviousAnalysis(original,row.review);
 }
 return annotation;
}

// applied/protected count occurrences, not distinct texts. annotations contains
// ONLY newly applied records; merge these into existing persisted annotations.
// Matching is byte-for-byte review text, never normalized text or quote alone.
export function applyImportedAnalysis(rows,validated){
 const checked=validateEnrichment(validated,rows),byId=new Map(rows.map(row=>[row.id,row])),byText=new Map;
 for(const annotation of checked){
  const text=byId.get(annotation.id).review,existing=byText.get(text);
  if(existing&&(existing.sentiment!==annotation.sentiment||existing.evidence!==annotation.evidence))throw Error('Conflicting analysis for identical review texts.');
  byText.set(text,annotation);
 }
 let applied=0,protectedCount=0;const annotations=[];
 const next=rows.map(row=>{
  const cloned={...row};if(row.previous_analysis)cloned.previous_analysis={...row.previous_analysis};
  const annotation=byText.get(row.review);if(!annotation)return cloned;
  if(isReviewed(row.method)){protectedCount++;return cloned;}
  const record={...annotation,id:row.id};
  delete cloned.provider_run_id;delete cloned.dataset_id;delete cloned.previous_analysis;
  Object.assign(cloned,record);annotations.push(record);applied++;return cloned;
 });
 return {rows:next,annotations,applied,protected:protectedCount};
}
