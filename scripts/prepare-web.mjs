import {mkdir,copyFile,cp} from 'node:fs/promises';
const files=['style.css','app.mjs','engine.mjs','adaption-client.mjs','workspace-client.mjs','data.json','ARCHITECTURE.md','site-config.mjs','site-client.mjs','privacy.mjs','decision-brief.mjs','review-policy.mjs'];
await mkdir('public',{recursive:true});
for(const f of files) await copyFile('web/'+f,'public/'+f);
await cp('web/fonts','public/fonts',{recursive:true});
await cp('web/assets','public/assets',{recursive:true});
await copyFile('web/assets/favicon.ico','public/favicon.ico');
console.log('Website assets prepared.');
