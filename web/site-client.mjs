import {initPrivacyControls,trackEvent} from './privacy.mjs';
import {pageKey,thankYouContent} from './site-config.mjs';
initPrivacyControls();
const page=pageKey(location.pathname);
trackEvent('page_view',page);
document.addEventListener('click',event=>{if(event.target.closest('[data-consent="accept"]'))queueMicrotask(()=>trackEvent('page_view',page))});
if(page==='thankyou'){let receipt;try{receipt=JSON.parse(sessionStorage.getItem('if-feedback-receipt')||'null')}catch{}document.querySelector('#main').innerHTML=thankYouContent(receipt)}
