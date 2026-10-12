import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE_ROOT?path.join(process.env.QA_PACKAGE_ROOT,'package.json'):import.meta.url);
const {chromium}=require('playwright');
const {default:AxeBuilder}=require('@axe-core/playwright');
const base=process.env.QA_BASE_URL||'http://127.0.0.1:8787';
const out=path.resolve('artifacts/journey');await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const report={base,checkedAt:new Date().toISOString(),checks:[],errors:[]};
async function ready(page){await page.waitForFunction(()=>document.querySelector('.status')?.textContent.includes('browser only'))}
async function nav(page,key){if(await page.locator('[data-action="menu"]').isVisible())await page.locator('[data-action="menu"]').click();await page.locator('.nav [data-nav="'+key+'"]').click();await page.locator('.nav [data-nav="'+key+'"][aria-current="page"]').waitFor({state:'attached'})}
try{
 for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>report.errors.push({width,message:e.message}));
  await page.goto(base+'/?demo=1');await ready(page);await page.locator('[data-consent="reject"]').click();
  await page.waitForFunction(()=>document.querySelector('.hero')?.textContent.includes('1,429'));
  await page.locator('.hero [data-issue="fraud"]').click();
  assert.match(await page.locator('.priority-proof').innerText(),/7,000/);assert.match(await page.locator('.priority-proof').innerText(),/1,429/);
  await page.screenshot({path:path.join(out,'priority-'+width+'.png'),fullPage:false});
  assert.deepEqual((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>v.id),[],'issue modal accessibility');
  const sourceId=await page.locator('[data-review-source]').first().getAttribute('data-review-source');
  await page.locator('[data-review-source]').first().click();await page.locator('#back-to-evidence').click();await page.locator('[data-review-source]').first().click();
  const original=await page.locator('#modal .evidence-quote p').innerText();
  await page.locator('#review-evidence').fill('Fabricated evidence that is not in source');await page.locator('#save-review').click();assert.match(await page.locator('#review-error').innerText(),/exact quote/);
  const raw=original.slice(1,-1);await page.locator('#review-evidence').fill(raw);await page.locator('#review-sentiment').selectOption('Unclear');await page.locator('#save-review').click();
  await nav(page,'feedback');await page.locator('#search').fill(sourceId);await page.locator('[data-feedback="'+sourceId+'"]').click();
  assert.equal(await page.locator('#modal .evidence-quote p').innerText(),original);assert.match(await page.locator('.review-lineage').innerText(),/Adaption/);assert.match(await page.locator('.review-lineage').innerText(),/dataset-fd968ec1/);
  await page.screenshot({path:path.join(out,'review-'+width+'.png'),fullPage:false});
  assert.deepEqual((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>v.id),[],'review modal accessibility');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('#close-modal').click();await page.reload();await ready(page);await page.locator('#search').fill(sourceId);await page.locator('[data-feedback="'+sourceId+'"]').click();assert.equal(await page.locator('#review-sentiment').inputValue(),'Unclear');assert.match(await page.locator('.review-lineage').innerText(),/Adaption/);await page.locator('#close-modal').click();
  await nav(page,'lab');await page.locator('#adaption-check').click();await page.locator('#adaption-quality').waitFor();await page.locator('#adaption-quality').click();await page.locator('[data-quality-source]').first().click();assert.match(await page.locator('#modal .evidence-quote p').innerText(),/minimalist and understated/);await page.locator('#back-to-evidence').click();assert.match(await page.locator('#modal-title').innerText(),/analysis quality/);await page.locator('#close-modal').click();
  await page.locator('[data-action="analysis-import"]').click();await page.locator('#analysis-file').setInputFiles({name:'qa-analysis.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify([{id:sourceId,sentiment:'Negative',evidence:raw}]))});await page.locator('[data-action="apply-analysis"]').click();
  await nav(page,'feedback');await page.locator('#search').fill(sourceId);await page.locator('[data-feedback="'+sourceId+'"]').click();assert.equal(await page.locator('#review-sentiment').inputValue(),'Unclear','manual import cannot erase human review');await page.locator('#close-modal').click();
  await nav(page,'issues');await page.locator('[data-issue="fraud"]').click();await page.locator('#issue-owner').fill('QA owner — browser-local');await page.locator('[data-action="track"]').click();await page.locator('[data-status="fraud"]').selectOption('In progress');await page.reload();await ready(page);assert.equal(await page.locator('[data-status="fraud"]').inputValue(),'In progress');assert.match(await page.locator('.ticket').first().innerText(),/QA owner/);
  await nav(page,'reports');const downloading=page.waitForEvent('download');await page.locator('[data-action="report-export"]').click();const file=await downloading;const target=path.join(out,'verified-brief-'+width+'.md');await file.saveAs(target);const brief=await readFile(target,'utf8');assert.match(brief,/QA owner/);assert.match(brief,/In progress/);assert.match(brief,/Calculation: round/);assert.match(brief,/dataset-fd968ec1/);assert.match(brief,/not provider endorsements/);
  if(width<700){await page.locator('[data-action="menu"]').click();await page.keyboard.press('Escape');assert.equal(await page.locator('[data-action="menu"]').getAttribute('aria-expanded'),'false');assert.equal(await page.evaluate(()=>document.activeElement?.dataset.action),'menu')}
  report.checks.push({width,sourceId,sourceUnchanged:true,lineageRetained:true,reviewSurvivesReload:true,manualImportProtected:true,disagreementLinked:true,ownerStatusPersisted:true,download:target,modalAxeViolations:0});await context.close();
 }
 assert.deepEqual(report.errors,[]);console.log(JSON.stringify(report,null,2));
}catch(error){report.failure=error.stack;console.error(error);process.exitCode=1}finally{await browser.close();await writeFile(path.join(out,'audit.json'),JSON.stringify(report,null,2))}
