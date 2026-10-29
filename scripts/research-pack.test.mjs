import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {catalogSchema} from '../lib/catalog-schema.ts';
import {createCatalog,selectPropertyLayout,propertyPriceSummary} from '../lib/catalog.ts';
const read=async name=>JSON.parse(await readFile(new URL('../'+name,import.meta.url),'utf8'));
const records={properties:await read('data/properties.json'),localities:await read('data/localities.json')};
const catalog=createCatalog(catalogSchema.parse(records));
const sources=await read('data/research/sources.json');
test('the full supplied catalogue retains every new field and relationship',()=>{
 assert.equal(catalog.properties.length,27);assert.equal(catalog.localities.length,17);
 assert.equal(records.properties.reduce((n,p)=>n+p.configurations.length,0),259);
 assert.equal(records.properties.reduce((n,p)=>n+p.amenities.length,0),408);
 for(const p of catalog.properties){assert.equal(p.faqs.length,6);assert.ok(p.overview);assert.ok(p.projectScale);assert.ok(p.galleryImageIds.length>=3);assert.equal(propertyPriceSummary(p).label,p.pricing.displayText);}
 for(const l of catalog.localities){assert.ok(l.aaramvPerspective);assert.equal(l.usp.length,3);assert.deepEqual([...l.linkedPropertyIds].sort(),catalog.properties.filter(p=>p.localityId===l.id).map(p=>p.id).sort());}
});
test('all image bytes match their supplied hashes and plans retain valid references',async()=>{
 for(const r of [...records.properties,...records.localities]){
  for(const image of r.images){const bytes=await readFile(new URL('../public'+image.src,import.meta.url));if(image.sha256)assert.equal(createHash('sha256').update(bytes).digest('hex'),image.sha256);}
  if(!('configurations'in r))continue;
  for(const imageId of r.galleryImageIds)assert.ok(r.images.some(i=>i.id===imageId));
  for(const c of r.configurations)if(c.floorPlanImageId)assert.ok(r.images.some(i=>i.id===c.floorPlanImageId&&(i.kind==='floor-plan'||r.type==='Plot'&&i.kind==='master-plan')));
 }
});
test('legacy layout links resolve to their supplied corrected layouts',()=>{
 for(const p of catalog.properties)for(const [alias,target]of Object.entries(p.configurationIdAliases))assert.equal(selectPropertyLayout(p,alias).primary.id,target);
});
test('configuration and pricing source IDs remain traceable',()=>{
 const rows=Array.isArray(sources)?sources:Object.values(sources);const ids=new Set(rows.map(s=>s.id));
 for(const p of records.properties){for(const id of p.sourceIds)assert.ok(ids.has(id),id);for(const c of p.configurations)for(const id of [...(c.sourceIds||[]),...(c.priceSourceIds||[])])assert.ok(ids.has(id),id);for(const quote of p.pricing.quotes)assert.ok(ids.has(quote.sourceId));}
});
test('new reference arrays and aliases reject broken targets',()=>{
 for(const field of ['gallery','alias','plan']){const d=structuredClone(records);const p=d.properties[0];if(field==='gallery')p.galleryImageIds.push('missing');if(field==='alias')p.configurationIdAliases.bad='missing';if(field==='plan')p.configurations[0].floorPlanImageIds=['missing'];assert.equal(catalogSchema.safeParse(d).success,false);}
});
