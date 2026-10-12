export const siteOrigin='https://insightflow-build-battle.azurebasil8.chatgpt.site';
export const pages={
 overview:{path:'/',label:'Overview',title:'InsightFlow — Customer intelligence',description:'Turn customer feedback into clear priorities. Explore original reviews, verified Adaption analysis, recurring issues and evidence-backed decisions.',indexable:true},
 feedback:{path:'/feedback',label:'Feedback inbox',title:'Feedback inbox — InsightFlow',description:'Search original customer reviews, compare distinct texts, inspect exact supporting quotes and add or import feedback without rewriting source evidence.'},
 issues:{path:'/issues',label:'Issue tracker',title:'Issue tracker — InsightFlow',description:'Inspect recurring complaint themes, transparent priority scores and original evidence. Assign owners and track planned, in-progress or resolved decisions.'},
 reports:{path:'/reports',label:'Reports',title:'Decision reports — InsightFlow',description:'Create a portable customer-feedback brief with original quotes, selected filters, counting methods, priority calculations and explicit limitations.'},
 lab:{path:'/studio',label:'Adaption studio',title:'Adaption analysis studio — InsightFlow',description:'Inspect verified Adaption output and provider provenance. Compare rule-based labels, source-grounding validation and a clearly limited judgment sample.'},
 architecture:{path:'/architecture',label:'Architecture',title:'Product architecture — InsightFlow',description:'Explore how InsightFlow preserves original feedback, validates AI analysis and links customer evidence to decisions. Separate implemented features from proposals.',indexable:true},
 privacy:{path:'/privacy',label:'Privacy',title:'Privacy notice — InsightFlow',description:'Understand browser-local feedback storage, private workspace persistence, provider processing and optional first-party analytics in InsightFlow.',indexable:true},
 terms:{path:'/terms',label:'Terms',title:'Terms of use — InsightFlow',description:'Read the use conditions and limitations of the InsightFlow competition prototype, including AI labels, source evidence, imports and optional analytics.',indexable:true},
 thankyou:{path:'/thank-you',label:'Confirmation',title:'Feedback confirmation — InsightFlow',description:'Confirm feedback added in your current browser session, understand where it is saved and return to the original customer-feedback workspace.'},
 notfound:{path:null,label:'Page not found',title:'Page not found — InsightFlow',description:'This InsightFlow page does not exist. Return to the customer-feedback workspace or read the privacy notice.'}
};
export const workspacePages=['overview','feedback','issues','reports','lab','architecture','thankyou'];
export function pageKey(pathname){return Object.keys(pages).find(key=>pages[key].path===pathname)||'notfound'}
export function pageHref(key,search=''){return (pages[key]?.path||'/')+search}
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function updatePageMetadata(key){
 const p=pages[key]||pages.notfound;document.title=p.title;document.querySelector('meta[name="insightflow-page"]')?.setAttribute('content',key);
 for(const [selector,value] of [['meta[name="description"]',p.description],['meta[property="og:title"]',p.title],['meta[property="og:description"]',p.description],['meta[name="twitter:title"]',p.title],['meta[name="twitter:description"]',p.description]])document.querySelector(selector)?.setAttribute('content',value);
 const canonical=new URL(p.path||location.pathname,siteOrigin).href;
 document.querySelector('link[rel="canonical"]')?.setAttribute('href',canonical);
 document.querySelector('meta[property="og:url"]')?.setAttribute('content',canonical);
 document.querySelector('meta[name="robots"]')?.setAttribute('content',p.indexable&&document.querySelector('meta[name="insightflow-demo"]')?.content==='true'?'index,follow':'noindex,follow');
}
export function thankYouContent(receipt){
 const valid=receipt?.kind==='feedback'&&typeof receipt.id==='string';
 return `<article class="panel report confirmation"><div class="eyebrow">${valid?'Feedback recorded':'Confirmation'}</div><h1>${valid?'Your feedback is in the workspace.':'No submission to confirm.'}</h1><p>${valid?'The review was added to this browser’s workspace. Your original text stays unchanged.':'A direct visit to this page does not submit feedback. Add a review from the feedback inbox to receive a real confirmation.'}</p>${valid?`<p>Reference: <code>${escapeHTML(receipt.id)}</code></p><div class="callout">${receipt.demo?'Judge preview: changes stay in this browser. Export your feedback to keep a portable copy.':'A browser backup was created. Check the workspace save indicator before closing; this page does not claim the server has saved it.'}</div>`:''}<div class="actions"><a class="btn primary" href="/feedback${receipt?.demo?'?demo=1':''}">Open feedback inbox</a><a class="btn" href="/">Back to overview</a></div></article>`;
}
