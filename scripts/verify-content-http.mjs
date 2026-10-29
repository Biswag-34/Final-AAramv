import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const properties=JSON.parse(await readFile('data/properties.json','utf8'));
const localities=JSON.parse(await readFile('data/localities.json','utf8'));
const base='http://127.0.0.1:3000';
const routes=['/','/properties','/localities','/about','/contact','/privacy','/terms','/coming-soon',...properties.map(p=>'/properties/'+p.id),...localities.map(l=>'/localities/'+l.id)];
const titles=new Set(),results=[];
for(const route of routes){const r=await fetch(base+route);const html=await r.text();assert.equal(r.status,200,route);const title=html.match(/<title>(.*?)<\/title>/s)?.[1];assert.ok(title,route);assert.ok(!titles.has(title),'Duplicate title: '+title);titles.add(title);const canonical=html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];assert.ok(canonical,'Missing canonical: '+route);assert.equal(new URL(canonical).pathname,route,'Wrong canonical: '+route);results.push({route,status:r.status,title});}
await mkdir('tmp/content-refresh',{recursive:true});await writeFile('tmp/content-refresh/http-checks.json',JSON.stringify(results,null,2));console.log(`Passed ${routes.length} published routes with unique metadata and canonical URLs.`);
