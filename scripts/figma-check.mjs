import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(path.join(process.env.QA_PACKAGE_ROOT,'package.json'));
const {chromium}=require('playwright');const {default:AxeBuilder}=require('@axe-core/playwright');
const base=process.env.QA_BASE_URL||'http://127.0.0.1:8787',out=path.resolve('artifacts/figma-review/implemented');await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});const report={base,checkedAt:new Date().toISOString(),checks:[],errors:[]};
try{
 for(const width of [1440,1024,390,320]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(base+'/?demo=1');await page.waitForFunction(()=>document.querySelector('.quality-strip')?.textContent.includes('320 / 320'));await page.locator('[data-consent="reject"]').click();
  assert.equal(await page.locator('.page-head .actions [data-action="tour-start"]').count(),0,'walkthrough is not a third masthead button');
  assert.equal(await page.locator('.overview-tour').count(),1);
  assert.equal(await page.locator('.mobile-cta').count(),0,'overview has no duplicate fixed import bar');
  assert.equal(await page.locator('.overview-head [data-action="import"]').count(),1);
  assert.equal(await page.locator('[data-proof="rows"] b').innerText(),'7,000');
  assert.equal(await page.locator('[data-proof="provider"] b').innerText(),'320 / 320');
  assert.equal(await page.locator('[data-proof="reviewed"] b').innerText(),'0');
  assert.equal(await page.locator('.quality-strip').evaluate(e=>getComputedStyle(e).borderRadius),'0px');
  const imports=await page.locator('.overview-head [data-action="import"]').boundingBox(),exports=await page.locator('.overview-head [data-action="report-export"]').boundingBox();
  if(width<700){assert.ok(imports.x<exports.x||imports.y<exports.y,'mobile Import precedes Export');assert.ok(imports.height>=44);const hero=await page.locator('.hero').boundingBox();assert.ok(hero.height<370,'no large empty mockup space');}
  const evidence=await page.locator('.hero [data-issue]').boundingBox();assert.ok(evidence.height>=44,'evidence touch target');
  assert.ok(await page.locator('.hero [data-issue]').evaluate(e=>{const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return y>=innerHeight||e.contains(document.elementFromPoint(x,y))}),'visible evidence button unobstructed');
  await page.screenshot({path:path.join(out,'overview-'+width+'.png')});
  await page.locator('.overview-tour').focus();await page.keyboard.press('Enter');await page.locator('.tour-banner').waitFor();assert.equal(await page.locator('.tour-banner').isVisible(),true);await page.locator('[data-action="tour-end"]').click();
  await page.locator('#category').selectOption('Operational Issues');assert.equal(await page.locator('[data-proof="rows"] b').innerText(),'1,800');
  const scope=await page.locator('.quality-strip').innerText();await page.locator('[data-action="unique"]').click();assert.equal(await page.locator('.quality-strip').innerText(),scope,'proof rail remains source-occurrence based across counting toggle');
  await page.locator('.quality-strip [data-nav="lab"]').click();await page.waitForURL('**/studio?demo=1');
  const menu=page.locator('[data-action="menu"]');if(await menu.isVisible())await menu.click();await page.locator('.nav [data-nav="overview"]').click();
  await page.locator('#category').selectOption('All categories');await page.locator('#sentiment').selectOption('All sentiments');
  assert.equal(await page.locator('[data-proof="rows"] b').innerText(),'7,000');
  const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>v.id);assert.deepEqual(violations,[]);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  report.checks.push({width,tourKeyboard:true,singleOverviewImport:true,sourceCountsDynamic:true,providerLabelPreserved:true,analysisNavigation:true,violations});await context.close();
 }
 assert.deepEqual(report.errors,[]);console.log(JSON.stringify(report,null,2));
}catch(e){report.failure=e.stack;console.error(e);process.exitCode=1}finally{await browser.close();await writeFile(path.join(out,'audit.json'),JSON.stringify(report,null,2))}
