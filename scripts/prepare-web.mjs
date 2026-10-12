import {mkdir,copyFile,cp,rm} from 'node:fs/promises';
import {build} from 'esbuild';
const files=['style.css','app.mjs','engine.mjs','adaption-client.mjs','workspace-client.mjs','data.json','ARCHITECTURE.md','site-config.mjs','site-client.mjs','privacy.mjs','decision-brief.mjs','review-policy.mjs','motion-loader.mjs'];
await mkdir('public',{recursive:true});
for(const f of files) await copyFile('web/'+f,'public/'+f);
await cp('web/fonts','public/fonts',{recursive:true});
await cp('web/assets','public/assets',{recursive:true});
await copyFile('web/assets/favicon.ico','public/favicon.ico');
// Only this owned generated directory is cleared; running previews serve isolated snapshots.
await rm('public/motion',{recursive:true,force:true});
await build({entryPoints:{'motion-entry':'web/motion-entry.mjs'},outdir:'public/motion',bundle:true,splitting:true,format:'esm',minify:true,target:'es2022',chunkNames:'chunk-[hash]',legalComments:'eof'});
console.log('Website assets and optional motion bundles prepared.');
