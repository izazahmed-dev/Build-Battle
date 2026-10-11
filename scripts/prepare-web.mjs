import {mkdir,copyFile} from 'node:fs/promises';
const files=['style.css','app.mjs','engine.mjs','adaption-client.mjs','data.json','ARCHITECTURE.md'];
await mkdir('public',{recursive:true});
for(const f of files) await copyFile('web/'+f,'public/'+f);
console.log('Website assets prepared.');
