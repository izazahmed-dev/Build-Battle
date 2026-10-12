import {cp,mkdir,mkdtemp,readFile,access} from 'node:fs/promises';
import path from 'node:path';

// Wrangler indexes static assets when it starts. Never serve an output directory
// that another build can replace: worker HTML and its asset manifest must agree.
export async function snapshotBuild(buildRoot,releasesRoot){
 const source=path.resolve(buildRoot);
 const config=JSON.parse(await readFile(path.join(source,'server/wrangler.json'),'utf8'));
 if(config.assets?.directory!=='../client')throw Error('Expected a server/client build with assets directory ../client.');
 for(const file of ['client/style.css','client/app.mjs','client/engine.mjs','client/privacy.mjs','client/site-config.mjs','server/index.js'])await access(path.join(source,file));
 await mkdir(releasesRoot,{recursive:true});
 const release=await mkdtemp(path.join(path.resolve(releasesRoot),'release-'));
 await cp(path.join(source,'server'),path.join(release,'server'),{recursive:true});
 await cp(path.join(source,'client'),path.join(release,'client'),{recursive:true});
 return {release,config:path.join(release,'server/wrangler.json')};
}
