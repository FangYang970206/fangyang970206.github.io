import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
const root = path.resolve('dist');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.xml':'application/xml; charset=utf-8'};
http.createServer((req,res)=>{try{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}if(existsSync(file)&&statSync(file).isDirectory())file=path.join(file,'index.html');if(!existsSync(file)){res.writeHead(404,{'Content-Type':types['.html']});res.end(readFileSync(path.join(root,'404.html')));return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(readFileSync(file));}catch{res.writeHead(400);res.end('Bad request');}}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
