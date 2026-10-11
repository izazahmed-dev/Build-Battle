import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
http.createServer(async(req,res)=>{try{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname==='/ '?'/index.html':new URL(req.url,'http://localhost').pathname));const target=file===root?path.join(root,'index.html'):file;if(!target.startsWith(root+path.sep))throw Error();const body=await readFile(target);res.writeHead(200,{'Content-Type':({'html':'text/html; charset=utf-8','css':'text/css','mjs':'text/javascript','js':'text/javascript','json':'application/json','md':'text/markdown'})[target.split('.').pop()]||'application/octet-stream'});res.end(body)}catch{res.writeHead(404);res.end('Not found')}}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
