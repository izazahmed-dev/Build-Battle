import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {snapshotBuild} from '../scripts/preview-release.mjs';
test('running preview snapshot retains its assets when a subsequent build replaces dist',async()=>{
 const root=await mkdtemp(path.join(process.env.TMPDIR||os.tmpdir(),'preview-isolation-'));
 try{
  const dist=path.join(root,'dist');await mkdir(path.join(dist,'server'),{recursive:true});await mkdir(path.join(dist,'client'),{recursive:true});
  await writeFile(path.join(dist,'server/wrangler.json'),JSON.stringify({main:'index.js',assets:{directory:'../client'}}));
  await writeFile(path.join(dist,'server/index.js'),'// synthetic worker fixture');
  for(const file of ['style.css','app.mjs','engine.mjs','privacy.mjs','site-config.mjs'])await writeFile(path.join(dist,'client',file),'first build');
  const first=await snapshotBuild(dist,path.join(root,'releases'));
  await writeFile(path.join(dist,'client/style.css'),'second build');await writeFile(path.join(dist,'client/app.mjs'),'second build');
  const second=await snapshotBuild(dist,path.join(root,'releases'));
  assert.notEqual(first.release,second.release);
  assert.equal(await readFile(path.join(first.release,'client/style.css'),'utf8'),'first build');
  assert.equal(await readFile(path.join(first.release,'client/app.mjs'),'utf8'),'first build');
  assert.equal(await readFile(path.join(second.release,'client/style.css'),'utf8'),'second build');
  const config=JSON.parse(await readFile(first.config,'utf8'));assert.equal(path.resolve(path.dirname(first.config),config.assets.directory),path.join(first.release,'client'));
 }finally{await rm(root,{recursive:true,force:true})}
});
