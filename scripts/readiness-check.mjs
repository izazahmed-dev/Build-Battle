import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pages} from '../web/site-config.mjs';
const require=createRequire(process.env.QA_PACKAGE_ROOT?path.join(process.env.QA_PACKAGE_ROOT,'package.json'):import.meta.url);
const {chromium}=require('playwright');
const {default:AxeBuilder}=require('@axe-core/playwright');
const base=process.env.QA_BASE_URL||'http://127.0.0.1:5173';
const out=path.resolve('artifacts/readiness');await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const report={base,checkedAt:new Date().toISOString(),pages:[],flows:[],errors:[],analytics:[]};
async function ready(page,key){
 if(['overview','feedback','issues','reports','lab','architecture'].includes(key))await page.waitForFunction(()=>document.querySelector('.status')?.textContent.includes('browser only'));
 else await page.locator('#main h1').waitFor();
}
function recordErrors(page){page.on('pageerror',e=>report.errors.push(e.message))}
try{
 report.assets=[];
 const assetContext=await browser.newContext();
 for(const [asset,mime] of [['/style.css','text/css'],['/app.mjs','javascript'],['/engine.mjs','javascript'],['/decision-brief.mjs','javascript'],['/review-policy.mjs','javascript'],['/motion-loader.mjs','javascript'],['/motion/motion-entry.js','javascript'],['/privacy.mjs','javascript'],['/workspace-client.mjs','javascript'],['/adaption-client.mjs','javascript'],['/site-config.mjs','javascript'],['/site-client.mjs','javascript'],['/data.json','application/json'],['/fonts/dm-sans-latin.woff2','font/woff2'],['/fonts/manrope-latin.woff2','font/woff2'],['/assets/og-image.png','image/png']]){
  const response=await assetContext.request.get(base+asset),contentType=response.headers()['content-type']||'';
  report.assets.push({asset,status:response.status(),contentType});
  assert.equal(response.status(),200,asset+' failed: HTML working alone is not a working application');assert.ok(contentType.includes(mime),asset+' incorrect MIME: '+contentType);
 }
 await assetContext.close();
 for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage();recordErrors(page);
  const analytics=[];page.on('request',r=>{if(new URL(r.url()).pathname==='/api/analytics')analytics.push(r)});
  await page.goto(base+'/?demo=1');await ready(page,'overview');
  await page.locator('.privacy-banner').waitFor({state:'visible'});
  assert.equal(analytics.length,0,'No tracking before consent');
  const bannerAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(bannerAxe.violations.map(v=>v.id),[],'Consent banner accessibility');
  await page.locator('[data-consent="reject"]').click();
  for(const key of Object.keys(pages)){
   const expected=pages[key],url=expected.path||'/not-a-real-page';const response=await page.goto(base+url+'?demo=1');await ready(page,key);
   assert.equal(response.status(),key==='notfound'?404:200,url);
   assert.equal(await page.title(),expected.title,url);
   assert.equal(await page.locator('meta[name="description"]').getAttribute('content'),expected.description,url);
   assert.ok((await response.text()).includes(expected.title),'Metadata must be in initial HTML, not just JavaScript');
   assert.equal(await page.locator('img:not([alt])').count(),0,'Every image has alt');
   const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(layout.scroll<=layout.width+1,url+' horizontal page overflow');
   if(width<700&&['overview','feedback','issues','reports','lab','architecture'].includes(key)){
    if(key==='overview'){assert.equal(await page.locator('.mobile-cta').count(),0,'No duplicate fixed CTA over Overview evidence')}else{assert.equal(await page.locator('.mobile-cta').isVisible(),true);const box=await page.locator('.mobile-cta').boundingBox();assert.ok(box.y+box.height<=901,'Sticky CTA in viewport')}
   }
   if(key==='overview'){
    assert.ok((await page.locator('.quality-strip').innerText()).includes('320 / 320'));assert.ok((await page.locator('.hero').innerText()).includes('1,429'));
    const aboveFold=await page.locator('.page-head .actions button').evaluateAll(es=>es.some(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight}));assert.equal(aboveFold,true,'CTA above fold');
   }
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();const violations=axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));report.pages.push({key,width,status:response.status(),layout,violations});assert.deepEqual(violations,[],url+' accessibility');
   if(width===390&&['privacy','terms','notfound'].includes(key))await page.screenshot({path:path.join(out,key+'-390.png'),fullPage:true});
  }
  assert.equal(analytics.length,0,'Rejected analytics stays off across pages');await context.close();
 }
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();recordErrors(page);
 await page.goto(base+'/feedback?demo=1');await ready(page,'feedback');await page.locator('[data-consent="reject"]').click();
 await page.locator('[data-action="add"]').click();await page.locator('#feedback-form button[type="submit"]').click();assert.match(await page.locator('#feedback-error').innerText(),/between 3/);assert.equal(await page.locator('#review').getAttribute('aria-invalid'),'true');
 const fixture='Synthetic QA fixture: support resolved this isolated test issue.';await page.locator('#review').fill(fixture);await page.locator('#occurred').fill('2026-10-11');await page.locator('#feedback-form button[type="submit"]').click();
 await page.waitForURL('**/thank-you?demo=1');assert.match(await page.locator('#main').innerText(),/Your feedback is in the workspace/);assert.match(await page.locator('#main').innerText(),/changes stay in this browser/);
 await page.reload();assert.match(await page.locator('#main').innerText(),/Your feedback is in the workspace/);
 await page.goto(base+'/feedback?demo=1');await ready(page,'feedback');await page.locator('#search').fill(fixture);await page.locator('.review-link').filter({hasText:fixture}).waitFor();await page.locator('.review-link').filter({hasText:fixture}).click();
 await page.locator('#review-evidence').fill('This quote never occurred in the review.');await page.locator('#save-review').click();assert.match(await page.locator('#review-error').innerText(),/exact quote/);await page.locator('#close-modal').click();
 await page.locator('#search').fill('');await page.locator('#search').press('Tab');await page.locator('.nav [data-nav="overview"]').click();assert.equal(new URL(page.url()).pathname,'/');assert.equal(await page.title(),pages.overview.title);await page.goBack();assert.equal(new URL(page.url()).pathname,'/feedback');assert.equal(await page.title(),pages.feedback.title);
 await page.goto(base+'/?demo=1');await ready(page,'overview');await page.locator('[data-action="import"]').first().click();await page.locator('#csv-file').setInputFiles({name:'invalid.csv',mimeType:'text/csv',buffer:Buffer.from('name,category\nNo review column,Test\n')});await page.locator('#import-preview [role="alert"]').waitFor();assert.match(await page.locator('#import-preview').innerText(),/review column/);await page.locator('#close-modal').click();
 report.flows.push('Inline required-feedback error; real browser-local add; thank-you route and reload; local feedback survives reload; fabricated quote rejection; real navigation/back metadata; invalid CSV error');await context.close();
 const consentContext=await browser.newContext({viewport:{width:1280,height:900}}),consentPage=await consentContext.newPage();recordErrors(consentPage);let sent=[];
 consentPage.on('request',r=>{if(new URL(r.url()).pathname==='/api/analytics')sent.push(r.postDataJSON())});
 await consentPage.goto(base+'/?demo=1');await ready(consentPage,'overview');assert.equal(sent.length,0);
 const responsePromise=consentPage.waitForResponse(r=>new URL(r.url()).pathname==='/api/analytics');await consentPage.locator('[data-consent="accept"]').click();const analyticsResponse=await responsePromise;assert.ok(analyticsResponse.ok(),'Analytics must persist, not silently fake success');
 assert.ok(sent.length>0);for(const payload of sent){assert.deepEqual(Object.keys(payload).sort(),['consent','event','page']);assert.equal(payload.consent,true)}
 const downloadPromise=consentPage.waitForEvent('download'),exportResponse=consentPage.waitForResponse(r=>new URL(r.url()).pathname==='/api/analytics'&&r.request().postDataJSON()?.event==='report_exported');await consentPage.locator('[data-action="report-export"]').click();const download=await downloadPromise;await download.saveAs(path.join(out,'verified-decision-brief.md'));assert.ok((await exportResponse).ok());const brief=await readFile(path.join(out,'verified-decision-brief.md'),'utf8');assert.match(brief,/7000 rows; 320 distinct texts/);assert.match(brief,/Analysis provenance/);assert.match(brief,/No historical trend or financial impact is inferred/);report.flows.push('Actual decision-brief download checked for source counts, provenance and limitations');
 const before=sent.length;await consentPage.locator('[data-privacy-settings]').first().click();await consentPage.locator('[data-consent="reject"]').click();await consentPage.locator('.nav [data-nav="feedback"]').click();await consentPage.locator('#search').waitFor();await consentPage.waitForTimeout(200);assert.equal(sent.length,before,'Withdrawal stops future tracking');
 report.analytics.push({consentResponse:analyticsResponse.status(),acceptedPayloads:sent,withdrawalStopped:true});await consentContext.close();
 const privateContext=await browser.newContext(),privatePage=await privateContext.newPage();await privatePage.addInitScript(()=>Object.defineProperty(navigator,'doNotTrack',{value:'1'}));let dntEvents=0;privatePage.on('request',r=>{if(new URL(r.url()).pathname==='/api/analytics')dntEvents++});await privatePage.goto(base+'/?demo=1');await ready(privatePage,'overview');assert.equal(dntEvents,0);report.flows.push('Do Not Track respected');await privateContext.close();
 assert.deepEqual(report.errors,[]);console.log(JSON.stringify({pageChecks:report.pages.length,flows:report.flows,analytics:report.analytics,pageErrors:report.errors.length},null,2));
}catch(error){report.failure=error.stack;process.exitCode=1;console.error(error)}finally{await browser.close();await writeFile(path.join(out,'audit.json'),JSON.stringify(report,null,2))}
