const KEY='if-privacy-consent';
const EVENTS=new Set(['page_view','feedback_added','import_completed','report_exported']);
const PAGES=new Set(['overview','feedback','issues','reports','lab','architecture','privacy','terms','thankyou','notfound']);
let initialized=false,consent=null,lastPage=null,settingsOpener=null;
const pending=new Set();
function privacySignal(){return navigator.globalPrivacyControl===true||navigator.doNotTrack==='1'||window.doNotTrack==='1';}
function storedChoice(){try{const value=window.localStorage.getItem(KEY);return value==='accepted'||value==='rejected'?value:null;}catch{return null;}}
function enabled(){return Boolean(document.querySelector('meta[name="insightflow-analytics"][content="true"]'));}
function allowed(){return consent==='accepted'&&storedChoice()==='accepted'&&!privacySignal()&&enabled();}
function banner(){return document.getElementById('if-privacy-banner');}
function choose(value){
 consent=null;lastPage=null;
 for(const controller of pending)controller.abort();pending.clear();
 try{window.localStorage.setItem(KEY,value);if(storedChoice()===value)consent=value;}catch{/* Unavailable storage must not enable tracking. */}
 const region=banner();if(region){region.hidden=consent!==null;if(region.hidden)(settingsOpener?.isConnected?settingsOpener:document.querySelector('#main'))?.focus?.({preventScroll:true})}settingsOpener=null;
}
export function initPrivacyControls(){
 try{
  if(initialized)return;initialized=true;consent=storedChoice();
  const region=document.createElement('section');region.id='if-privacy-banner';region.className='privacy-banner';region.setAttribute('role','region');region.setAttribute('aria-label','Privacy choices');region.hidden=consent!==null;
  region.innerHTML='<strong>Privacy choices</strong><p>Browser feedback backups are essential local storage. Optional anonymous aggregate analytics count pages and actions only after you accept. No feedback text, visitor IDs, cookies or referrers are sent.</p><p class="privacy-note">Do Not Track and Global Privacy Control always prevent analytics. Reject or withdraw anytime using Privacy settings. Withdrawing stops future collection; anonymous counters cannot be linked back to you.</p><div class="privacy-actions"><button type="button" data-consent="accept">Accept optional analytics</button><button type="button" data-consent="reject">Reject optional analytics</button></div><div class="privacy-links"><a href="/privacy">Privacy policy</a><a href="/terms">Terms</a></div>';
  document.body.append(region);
  document.addEventListener('click',event=>{
   try{
    if(event.target.closest('[data-privacy-settings]')){event.preventDefault();settingsOpener=event.target.closest('[data-privacy-settings]');region.hidden=false;region.querySelector('[data-consent="reject"]')?.focus();return;}
    const button=event.target.closest('[data-consent]');if(!button||!region.contains(button))return;
    const choice=button.getAttribute('data-consent');if(choice!=='accept'&&choice!=='reject')return;
    event.preventDefault();choose(choice==='accept'?'accepted':'rejected');
   }catch{/* Privacy controls must never interrupt the app. */}
  });
  window.addEventListener?.('storage',event=>{if(event.key!==KEY)return;consent=storedChoice();lastPage=null;if(consent!=='accepted'){for(const controller of pending)controller.abort();pending.clear();}region.hidden=consent!==null;});
 }catch{consent=null;}
}
export async function trackEvent(event,page){
 try{
  if(!initialized||!EVENTS.has(event)||!PAGES.has(page)||!allowed())return;
  // Suppress rerenders, not later navigation back to the same page.
  if(event==='page_view'){if(lastPage===page)return;lastPage=page;}
  const controller=new AbortController();pending.add(controller);
  try{await fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,page,consent:true}),credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',mode:'same-origin',signal:controller.signal});}
  finally{pending.delete(controller);}
 }catch{/* Offline, blocked storage, and disabled analytics are nonfatal. */}
}
