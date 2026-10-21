import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
function walk(dir){return readdirSync(dir).flatMap(n=>statSync(path.join(dir,n)).isDirectory()?walk(path.join(dir,n)):[path.join(dir,n)]);}
let count=0;const errors=[];
for(const file of walk('dist').filter(f=>f.endsWith('.html'))){const html=readFileSync(file,'utf8');if(!html.includes('lang="zh-CN"')||!html.includes('<title>'))errors.push(`Missing document metadata: ${file}`);for(const m of html.matchAll(/(?:href|src)="([^"#]+)"/g)){if(/^(?:https?:|mailto:|data:)/.test(m[1]))continue;const target=decodeURIComponent(m[1].split(/[?#]/)[0]);if(!target)continue;count++;if(!existsSync(target.startsWith('/') ? path.resolve('dist', '.'+target) : path.resolve(path.dirname(file),target)))errors.push(`${file}: broken link ${target}`);}}
const entries=JSON.parse(readFileSync('dist/search.json','utf8'));if(!entries.length)errors.push('Search index is empty');for(const p of entries)if(!existsSync(`dist/posts/${p.slug}/index.html`))errors.push(`Missing article: ${p.slug}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}console.log(`Verified ${count} local links, ${entries.length} searchable articles, and document metadata.`);
