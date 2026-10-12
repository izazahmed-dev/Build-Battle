import {createRequire} from 'node:module';
import {mkdir,writeFile,stat,readFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(path.join(process.env.QA_PACKAGE_ROOT,'package.json'));
const {chromium}=require('playwright');const {default:AxeBuilder}=require('@axe-core/playwright');
const base=process.env.QA_BASE_URL||'http://127.0.0.1:8787',out=path.resolve('artifacts/motion');await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={base,checkedAt:new Date().toISOString(),renderer:'software Chromium WebGL; not real-device FPS certification',checks:[],errors:[]};
async function load(page){page.on('pageerror',e=>report.errors.push(e.message));await page.goto(base+'/?demo=1');await page.waitForFunction(()=>document.querySelector('.hero')?.textContent.includes('1,429'));await page.locator('[data-consent="reject"]').click()}
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'}),page=await context.newPage();await load(page);
 await page.locator('.evidence-scene.scene-ready canvas').waitFor({timeout:30000});
 await page.waitForFunction(()=>Number(document.querySelector('.evidence-scene')?.dataset.frames)>2);
 assert.equal(await page.locator('.evidence-scene canvas').count(),1);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.waitForTimeout(700);await page.screenshot({path:path.join(out,'overview-1440.png')});
 await page.locator('[data-motion-toggle]').click();const before=await page.locator('.evidence-scene').getAttribute('data-frames');await page.waitForTimeout(250);assert.equal(await page.locator('.evidence-scene').getAttribute('data-frames'),before,'pause stops GPU frames');
 await page.locator('[data-motion-toggle]').click();await page.waitForFunction(b=>document.querySelector('.evidence-scene')?.dataset.frames!==b,before);
 // Rendering refreshes and normal route changes must clean up canvases/triggers.
 for(let i=0;i<3;i++){await page.locator('[data-nav="feedback"]').first().click();assert.equal(await page.locator('canvas').count(),0);await page.locator('[data-nav="overview"]').first().click();await page.locator('.scene-ready canvas').waitFor();assert.equal(await page.locator('canvas').count(),1)}
 await page.evaluate(()=>document.querySelector('.evidence-scene canvas').dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
 assert.equal(await page.locator('.evidence-scene canvas').count(),0);assert.equal(await page.locator('.evidence-scene.scene-ready').count(),0);
 assert.equal(await page.locator('.hero [data-issue="fraud"]').isVisible(),true);
 report.checks.push('real Three.js canvas rendered; pause/resume; repeated navigation cleanup; context-loss static fallback');
 await context.close();
 for(const [width,reduce,saveData,disableGPU] of [[1440,'reduce',false,false],[1440,'no-preference',true,false],[390,'no-preference',false,false],[320,'no-preference',false,false],[1440,'no-preference',false,true]]){
  const c=await browser.newContext({viewport:{width,height:900},reducedMotion:reduce}),p=await c.newPage();let lensRequests=0,motionRequests=0;
  p.on('request',r=>{if(r.url().includes('/motion/')){motionRequests++;if(!r.url().endsWith('/motion-entry.js'))lensRequests++}});
  if(saveData)await p.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true}));
  if(disableGPU)await p.addInitScript(()=>{const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'||type==='webgl'?null:old.call(this,type,...args)}});
  await load(p);await p.waitForTimeout(1600);
  assert.equal(await p.locator('.evidence-scene.scene-ready').count(),0);
  if(reduce==='reduce'||saveData)assert.equal(motionRequests,0,'reduced/saveData downloads no motion');
  if(width<1000)assert.equal(lensRequests,0,'mobile downloads no Three.js chunk');
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const violations=(await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>v.id);assert.deepEqual(violations,[]);
  if(width<1000)await p.screenshot({path:path.join(out,'overview-'+width+'.png'),fullPage:true});
  report.checks.push({width,reduce,saveData,disableGPU,motionRequests,lensRequests,violations});await c.close();
 }
 assert.deepEqual(report.errors,[]);
 const sizes=[];const {readdir}=await import('node:fs/promises');for(const f of await readdir('public/motion')){const b=await readFile('public/motion/'+f);sizes.push({file:f,bytes:(await stat('public/motion/'+f)).size,gzipBytes:gzipSync(b).length})}report.bundles=sizes;
 console.log(JSON.stringify(report,null,2));
}catch(e){report.failure=e.stack;console.error(e);process.exitCode=1}finally{await browser.close();await writeFile(path.join(out,'audit.json'),JSON.stringify(report,null,2))}
