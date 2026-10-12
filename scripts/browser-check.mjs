import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(process.env.QA_PACKAGE_ROOT?path.join(process.env.QA_PACKAGE_ROOT,'package.json'):import.meta.url);
const {chromium}=require('playwright');
const {default:AxeBuilder}=require('@axe-core/playwright');
const base=process.env.QA_BASE_URL||'http://127.0.0.1:5173';
const out=path.resolve('artifacts/browser');await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const report={base,checkedAt:new Date().toISOString(),checks:[],errors:[],requests:[]};
try{
 for(const width of [1440,1024,768,390,320]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push({width,message:e.message}));
  page.on('requestfailed',r=>report.requests.push({width,url:r.url(),error:r.failure()?.errorText}));
  await page.goto(base+'/?demo=1#overview');await page.waitForSelector('.quality-strip');
  await page.waitForFunction(()=>document.querySelector('.status')?.textContent.includes('browser only'));
  await page.waitForFunction(()=>document.body.innerText.includes('320 / 320')&&document.body.innerText.includes('texts with Adaption analysis')&&document.body.innerText.includes('1,429 rows match seller trust'));
  await page.evaluate(()=>document.fonts.ready);
  for(const view of ['overview','feedback','issues','reports','lab','architecture']){
   await page.evaluate(v=>{location.hash=v},view);await page.waitForFunction(v=>document.querySelector('.nav [aria-current="page"]')?.dataset.nav===v,view);
   const layout=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,title:document.querySelector('h1')?.textContent,fonts:document.fonts.check('500 16px "DM Sans"')&&document.fonts.check('600 16px Manrope'),overflow:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1&&r.width>0&&!e.closest('.table-wrap,.trend-bars')}).slice(0,8).map(e=>({tag:e.tagName,class:e.className}))}));
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   const violations=axe.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));
   report.checks.push({width,view,layout,violations});
   if((width===1440||width===390)&&['overview','feedback','issues','lab'].includes(view))await page.screenshot({path:path.join(out,`${view}-${width}.png`),fullPage:true});
   console.log(JSON.stringify({width,view,overflow:layout.document>layout.viewport,violations:violations.map(v=>`${v.id}:${v.nodes.length}`)}));
  }
  await context.close();
 }
}finally{await browser.close();await writeFile(path.join(out,'audit.json'),JSON.stringify(report,null,2));}
const failures=report.checks.filter(c=>c.violations.length||c.layout.document>c.layout.viewport);
console.log(JSON.stringify({checks:report.checks.length,failures:failures.length,pageErrors:report.errors.length,requestFailures:report.requests.length,report:path.join(out,'audit.json')},null,2));
process.exitCode=failures.length||report.errors.length?1:0;
