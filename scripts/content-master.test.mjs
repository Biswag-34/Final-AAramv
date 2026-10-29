import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {catalogSchema} from '../lib/catalog-schema.ts';
import {createCatalog,filterProperties,selectPropertyLayout} from '../lib/catalog.ts';
const json=async path=>JSON.parse(await readFile(new URL('../'+path,import.meta.url),'utf8'));
const master=await json('docs/content-refresh/master-records.json');
const records={properties:await json('data/properties.json'),localities:await json('data/localities.json')};
const catalog=createCatalog(catalogSchema.parse(records));
test('master maps all 27 project and 17 locality slugs without duplicates or missing relationships',()=>{
 assert.equal(records.properties.length,27);assert.equal(records.localities.length,17);
 assert.deepEqual(records.properties.map(p=>p.id).sort(),master.projects.map(p=>p.slug).sort());
 assert.deepEqual(records.localities.map(l=>l.id).sort(),master.localities.map(l=>l.slug).sort());
 for(const p of records.properties){const approved=master.projects.find(r=>r.slug===p.id);assert.equal(p.description,approved.description);assert.deepEqual(p.highlights.map(h=>h.title),approved.highlights);assert.ok(p.highlights.length>=3&&p.highlights.length<=4);}
 for(const l of records.localities)assert.equal(l.description,master.localities.find(r=>r.slug===l.id).description);
});
test('research references cannot silently become verified registration badges or current quotations',()=>{
 for(const p of records.properties){
  assert.ok(p.sources.length);assert.equal(p.possession.date,null);
  assert.ok(!p.documents.some(d=>/PRM\/KA|verified/i.test(d.value)));
  for(const c of p.configurations)assert.equal(c.startingPriceInr,null,'No layout has a complete current cost sheet yet');
  for(const source of p.sources){assert.ok(master.projects.find(r=>r.slug===p.id).sourceIds.some(id=>master.sources[id]===source.url));assert.equal(source.checkedAt,'2026-10-28');}
 }
});
test('parent and child project references stay related without duplicating one offered unit',()=>{
 const parent=catalog.properties.find(p=>p.id==='brigade-el-dorado');const child=catalog.properties.find(p=>p.id==='jasper-at-brigade-el-dorado');
 assert.ok(parent.relatedPropertyIds.includes(child.id));assert.ok(child.relatedPropertyIds.includes(parent.id));
 assert.ok(parent.configurations.every(c=>c.startingPriceInr===null));assert.ok(child.configurations.every(c=>c.startingPriceInr===null));
});
test('row houses remain distinguishable from apartment inventory and unsupported villas are held',()=>{
 assert.equal(records.properties.find(p=>p.id==='assetz-soul-soil').type,'Row House');
 const garden=records.properties.find(p=>p.id==='bhartiya-garden-estate');assert.equal(garden.type,'Apartment');assert.ok(garden.configurations.every(c=>! /villa/i.test(c.label)));
});
test('layout selection, unknown-price filtering and developer aliases survive the content refresh',()=>{
 const p=catalog.properties[0];assert.equal(selectPropertyLayout(p,p.configurations[0].id).primary.id,p.configurations[0].id);
 assert.equal(filterProperties(catalog.properties,{maxPriceInr:10000000}).length,0);
 assert.equal(filterProperties(catalog.properties,{query:'Nikoo7'})[0].id,'bhartiya-garden-estate');
 for(const l of catalog.localities)for(const p of filterProperties(catalog.properties,{localityId:l.id}))assert.equal(p.localityId,l.id);
});
test('production photographs match the DOCX extraction hashes exactly',async()=>{
 for(const [file,hash] of [['aaramv-buyer-first-hero.png','9a17f7432dbcc50ffadb3679dc1df36c2ffde5cd05c463d02039e5b46b088d51'],['aaramv-support-through-move-in.png','268e0f922caee7c02c42e391ca4baf35b111a179206fb21e9e9eb463e0dc0eef']])assert.equal(createHash('sha256').update(await readFile(new URL('../public/images/'+file,import.meta.url))).digest('hex'),hash);
});
