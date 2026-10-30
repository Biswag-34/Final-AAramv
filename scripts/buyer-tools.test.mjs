import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createCatalog, filterProperties} from '../lib/catalog.ts';
import {validSelection, applyDecisionFilters, filterUnitChoices, areaRange, comparisonUnitRates} from '../lib/buyer-tools.ts';
const read = async file => JSON.parse(await readFile(new URL(file, import.meta.url), 'utf8'));
const {properties} = createCatalog({properties: await read('../data/properties.json'), localities: await read('../data/localities.json')});
const empty = {area:'', timeline:'', corridor:'', intent:''};
test('shared and stored selections reject unknown, duplicate, malformed and excess IDs', () => {
  assert.deepEqual(validSelection('["a","a","bad","b","c","d","e"]', ['a','b','c','d','e']), ['a','b','c','d']);
  for (const input of ['oops','null','{}','[3,true]']) assert.deepEqual(validSelection(input, ['a']), []);
});
test('size ranges use real configuration bounds and identify different area bases', () => {
  const p = properties[0];
  assert.match(areaRange(p), /sq ft/);
  assert.equal(areaRange({configurations: []}), 'Size on request');
  assert.match(areaRange({configurations:[{availability:'available',areaSqFt:1000,areaMaxSqFt:1200,areaBasis:'carpet'},{availability:'available',areaSqFt:1400,areaBasis:'super-built-up'}]}), /1,000–1,400 sq ft · across layouts/);
});

test('comparison averages unique exact price-size pairs within each area basis',()=>{
  const base={availability:'available',areaSqFt:1000,areaBasis:'built-up',startingPriceInr:8000000};
  assert.deepEqual(comparisonUnitRates({configurations:[base,{...base},{...base,areaSqFt:2000,startingPriceInr:20000000},{...base,areaBasis:'carpet'}]}),[
    {basis:'built-up',amount:9000,count:2},{basis:'carpet',amount:8000,count:1},
  ]);
});

test('comparison does not infer rates for missing prices, ambiguous sizes or sold-out layouts',()=>{
  const base={availability:'available',areaSqFt:1000,areaBasis:'built-up',startingPriceInr:8000000};
  assert.deepEqual(comparisonUnitRates({configurations:[
    {...base,startingPriceInr:null},{...base,areaSqFt:null},{...base,areaSqFt:0},
    {...base,availability:'sold-out'},{...base,areaBasis:'unspecified'},
    {...base,areaMaxSqFt:1200},{...base,startingPriceInr:Infinity},
  ]}),[]);
  const earthsong=properties.find(p=>p.id==='earthsong-by-manyata');
  assert.deepEqual(comparisonUnitRates(earthsong),[{basis:'plot',amount:11000,count:2}]);
  assert.deepEqual(comparisonUnitRates(properties.find(p=>p.id==='brigade-el-dorado')),[]);
});
test('timeline filters do not treat expired historical targets as upcoming possession', () => {
  const base = properties[0];
  const rows = [
    {...base,id:'ready',status:'Ready to move'},
    {...base,id:'old',status:'Under construction',possession:{label:'old',date:'2025-12-31'}},
    {...base,id:'future',status:'Under construction',possession:{label:'future',date:'2027-05-01'}},
    {...base,id:'year-only',status:'Under construction',possession:{label:'year',date:null,year:2027}},
  ];
  assert.deepEqual(applyDecisionFilters(rows,{...empty,timeline:'12'},new Date('2026-10-30')).map(p=>p.id),['ready','future']);
  assert.deepEqual(applyDecisionFilters(rows,{...empty,timeline:'ready'}).map(p=>p.id),['ready']);
});
test('buying priorities match actual home formats and corridor matches supplied landmarks', () => {
  assert.equal(applyDecisionFilters(properties,empty).length,properties.length);
  assert.ok(applyDecisionFilters(properties,{...empty,intent:'land'}).every(p=>p.type==='Plot'));
  assert.ok(applyDecisionFilters(properties,{...empty,corridor:'not-a-recorded-place'}).length===0);
  assert.ok(applyDecisionFilters(properties,{...empty,intent:'compact'}).every(p=>p.configurations.some(c=>c.bedrooms!==null&&c.bedrooms<=1&&c.availability!=='sold-out')));
});
test('size, buying priority, bedrooms and price must match the same available layout', () => {
  const base = properties[0];
  const small = {...base.primary,id:'small',bedrooms:1,areaSqFt:1000,areaMaxSqFt:undefined,startingPriceInr:8000000,availability:'available'};
  const large = {...base.primary,id:'large',bedrooms:3,areaSqFt:2000,areaMaxSqFt:undefined,startingPriceInr:20000000,availability:'available'};
  const p = {...base,primary:small,configurations:[small,large]};
  assert.equal(filterProperties(filterUnitChoices([p],{...empty,area:'large'}),{maxPriceInr:10000000}).length,0);
  assert.equal(filterProperties(filterUnitChoices([p],{...empty,intent:'family'}),{bedrooms:1}).length,0);
  assert.equal(filterProperties(filterUnitChoices([p],{...empty,area:'large'}),{bedrooms:3})[0].primary.id,'large');
});
