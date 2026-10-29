import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { catalogSchema, propertySchema, localitySchema } from '../lib/catalog-schema.ts';
import { createCatalog, filterProperties, budgetBounds, formatArea, formatInr, bedroomLabel, configurationSummary, propertyPriceSummary, mapEmbedUrl, propertyHref, selectPropertyLayout, possessionDate, projectUnitCount, cardConfigurationSummary } from '../lib/catalog.ts';
import { parseSavedHomes, serializeSavedHomes } from '../lib/saved-homes.ts';

const read = async file => JSON.parse(await readFile(new URL(`../${file}`, import.meta.url), 'utf8'));
const input = { properties: await read('data/properties.json'), localities: await read('data/localities.json') };
const catalog = createCatalog(catalogSchema.parse(input));
const clone = value => structuredClone(value);
const mutate = change => { const data = clone(input); change(data); return catalogSchema.safeParse(data); };

test('configuration summaries list exact options rather than implying missing BHKs', () => {
  const p = clone(catalog.properties[0]);
  p.configurations = [0, 1, 3, 3].map((bedrooms, i) => ({...p.primary, id: `layout-${i}`, bedrooms, availability: 'available'}));
  assert.equal(configurationSummary(p), 'Studio / 1, 3 BHK');
  p.configurations[2].availability = 'sold-out';
  assert.equal(configurationSummary(p), 'Studio / 1, 3 BHK');
  p.configurations[3].availability = 'sold-out';
  assert.equal(configurationSummary(p), 'Studio / 1 BHK');
  assert.equal(configurationSummary({...p, type: 'Plot'}), 'Residential plots');
  p.configurations = [{...p.primary, bedrooms: 2, label: '2.5 BHK (with flexible room)', availability: 'available'}];
  assert.equal(configurationSummary(p), '2.5 BHK');
  p.configurations.push({...p.primary, bedrooms: null, label: 'Loft / duplex', availability: 'available'});
  assert.equal(configurationSummary(p), '2.5 BHK / Loft / duplex');
});

test('property prices show a real range and disclose missing prices', () => {
  const p = clone(catalog.properties[0]); delete p.pricing;
  p.configurations = [8000000, 16000000, null].map((startingPriceInr, i) => ({...p.primary, id: `price-${i}`, startingPriceInr, availability: 'available'}));
  assert.deepEqual(propertyPriceSummary(p), {label: '₹80 L - ₹1.60 Cr', note: 'Listed prices; other layouts on request', min: 8000000, max: 16000000});
  p.configurations[1].availability = 'sold-out';
  assert.equal(propertyPriceSummary(p).label, '₹80 L');
  p.configurations[0].startingPriceInr = null;
  assert.equal(propertyPriceSummary(p).label, 'Price on request');
});

test('embedded maps use coordinates or recorded Google search data only', () => {
  assert.equal(mapEmbedUrl({coordinates: {latitude: 13, longitude: 77}, mapUrl: null}), 'https://www.google.com/maps?q=13%2C77&output=embed');
  assert.equal(mapEmbedUrl({coordinates: null, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Recorded%20address'}), 'https://www.google.com/maps?q=Recorded%20address&output=embed');
  assert.equal(mapEmbedUrl({coordinates: null, mapUrl: 'https://example.com/?query=Not-a-map'}), null);
  assert.equal(mapEmbedUrl({coordinates: null, mapUrl: null}), null);
});

test('saved homes validate IDs, migrate legacy arrays and tolerate corrupt storage', () => {
  const ids = ['one', 'two'];
  assert.deepEqual(parseSavedHomes('["one","one",null,12,"stale","two"]', ids), ids);
  assert.deepEqual(parseSavedHomes(serializeSavedHomes(ids), ids), ids);
  for (const raw of ['broken', 'null', '{}', '{"version":2,"ids":["one"]}', '{"version":1,"ids":"one"}']) assert.deepEqual(parseSavedHomes(raw, ids), []);
  assert.deepEqual(parseSavedHomes(null, ids), []);
  assert.deepEqual(parseSavedHomes(serializeSavedHomes(['one', 'one']), ids), ['one']);
});

test('live records and both fill-in templates validate', async () => {
  assert.ok(catalog.properties.length);
  const p = await read('docs/property-input/project.template.json');
  const l = await read('docs/locality-input/locality.template.json');
  catalogSchema.parse({ properties: [p], localities: [l] });
  propertySchema.parse(await read('docs/property-input/project.demo-example.json'));
  localitySchema.parse(await read('docs/locality-input/locality.demo-example.json'));
});
test('unknown fields, icons, unsafe URLs, invalid dates and invalid numbers fail', () => {
  for (const change of [
    d => d.properties[0].typo = 'value',
    d => d.properties[0].icons.area = 'UnknownIcon',
    d => d.properties[0].images[0].src = 'javascript:alert(1)',
    d => d.properties[0].images[0].src = '//external.example/image.jpg',
    d => d.properties[0].updatedAt = '2026-02-30',
    d => d.properties[0].configurations[0].startingPriceInr = -1,
    d => d.properties[0].configurations[0].startingPriceInr = 1.5,
    d => d.localities[0].coordinates = { latitude: 100, longitude: 0 },
  ]) assert.equal(mutate(change).success, false);
});
test('duplicate IDs and broken relations fail', () => {
  for (const change of [
    d => d.properties.push(clone(d.properties[0])),
    d => d.localities.push(clone(d.localities[0])),
    d => d.properties[0].localityId = 'missing',
    d => d.properties[0].coverImageId = 'missing',
    d => d.properties[0].images.push(clone(d.properties[0].images[0])),
    d => d.properties[0].primaryConfigurationId = 'missing',
    d => d.properties[0].configurations.push(clone(d.properties[0].configurations[0])),
    d => d.properties[0].configurations[0].floorPlanImageId = 'cover',
    d => d.properties[0].relatedPropertyIds = ['missing'],
    d => d.properties[0].relatedPropertyIds = [d.properties[0].id],
    d => d.localities[0].published = false,
  ]) assert.equal(mutate(change).success, false);
});
test('drafts stay out of views and plots cannot have bedrooms', () => {
  const d = clone(input); d.properties[0].published = false;
  assert.equal(createCatalog(catalogSchema.parse(d)).properties.some(p => p.id === d.properties[0].id), false);
  assert.equal(mutate(d => d.properties.find(p => p.type === 'Plot').configurations[0].bedrooms = 0).success, false);
});
test('search covers keywords, developer, locality aliases and normalization', () => {
  const d = clone(input);
  d.properties[0].developerName = 'Example Builder'; d.properties[0].searchKeywords = ['Canopée']; d.localities[0].searchKeywords = ['ITPL'];
  const ps = createCatalog(catalogSchema.parse(d)).properties;
  assert.equal(filterProperties(ps, { query: ' BUILDER canopee ITPL ' })[0].id, d.properties[0].id);
  assert.ok(filterProperties(ps, { query: 'bagalur apartment' }).length);
  assert.equal(filterProperties(ps, { query: 'no-such-project-anywhere' }).length, 0);
});
test('bedrooms and price must match the same configuration and cards use that unit', () => {
  const p = clone(catalog.properties[0]);
  p.configurations = [
    { ...p.primary, id: 'two', bedrooms: 2, startingPriceInr: 8000000, areaSqFt: 1100, availability: 'available' },
    { ...p.primary, id: 'three', bedrooms: 3, startingPriceInr: 20000000, areaSqFt: 1900, availability: 'available' },
  ];
  assert.equal(filterProperties([p], { bedrooms: 3, maxPriceInr: 10000000 }).length, 0);
  const match = filterProperties([p], { bedrooms: 2, maxPriceInr: 10000000 })[0];
  assert.equal(match.price, 0.8); assert.equal(match.area, 1100); assert.equal(match.bhk, 2);
});

test('unfiltered cards retain the canonical detail layout and filtered links preserve their selected offer', () => {
  const p = clone(catalog.properties[0]);
  p.configurations = [
    {...p.primary, id:'canonical', bedrooms:3, areaSqFt:1800, startingPriceInr:20000000, availability:'available'},
    {...p.primary, id:'smaller', bedrooms:2, areaSqFt:1100, startingPriceInr:8000000, availability:'available'},
  ];
  p.primary = p.configurations[0];
  assert.equal(filterProperties([p])[0].primary.id, 'canonical');
  const result = filterProperties([p], {bedrooms:2,maxPriceInr:10000000})[0];
  const url = new URL(propertyHref(result), 'http://localhost');
  const detail = selectPropertyLayout(p, url.searchParams.get('layout'));
  assert.equal(detail.primary.id, result.primary.id);
  assert.equal(detail.area, result.area);
  assert.equal(detail.price, result.price);
  assert.equal(selectPropertyLayout(p, 'missing-layout').primary.id, 'canonical');
});

test('possession tiles never substitute launch or construction labels for dates', () => {
  for (const label of ['New launch','Under construction','Ready to move']) assert.equal(possessionDate({possession:{label,date:null}}), 'Date not confirmed');
});

test('Bhartiya City links resolve all matching developer records', () => {
  const expected=catalog.properties.filter(p=>/bhartiya/i.test(p.developerName||'')).map(p=>p.id);
  for (const query of ['Bhartiya City','Bhartiya Urban']) assert.deepEqual(filterProperties(catalog.properties,{query}).map(p=>p.id),expected);
});
test('sold-out units do not match configuration filters', () => {
  const p = clone(catalog.properties[0]); p.configurations.forEach(c => c.availability = 'sold-out');
  assert.equal(filterProperties([p], { bedrooms: 3 }).length, 0);
  assert.equal(filterProperties([p]).length, 1);
});
test('unknown prices are visible unfiltered, excluded by budget, sorted last', () => {
  const p = clone(catalog.properties[0]); p.id = 'unknown-price'; p.configurations.forEach(c => c.startingPriceInr = null);
  const priced = clone(catalog.properties[0]); priced.id = 'priced-fixture'; priced.configurations[0].startingPriceInr = 8000000; priced.primary = priced.configurations[0]; priced.price = 0.8;
  assert.equal(filterProperties([p]).length, 1);
  assert.equal(filterProperties([p], { maxPriceInr: 50000000 }).length, 0);
  for (const sort of ['Price: low to high', 'Price: high to low']) assert.equal(filterProperties([p, priced], { sort }).at(-1).id, p.id);
});
test('budget includes cheap and expensive inventory without fixed limits', () => {
  const p = clone(catalog.properties[0]); p.configurations[0].startingPriceInr = 90000000; p.configurations[1].startingPriceInr = 1000000;
  assert.equal(filterProperties([p]).length, 1); assert.equal(budgetBounds([p])[1], 9);
  assert.equal(filterProperties([p], { minPriceInr: 80000000 })[0].price, 9);
});
test('exact locality ID, type, status, saved and studio filters work', () => {
  const p = clone(catalog.properties[0]); p.configurations[0].bedrooms = 0;
  assert.equal(filterProperties([p], { bedrooms: 0 }).length, 1);
  assert.equal(filterProperties([p], { localityId: p.localityId, type: p.type, status: p.status, savedIds: [p.id] }).length, 1);
  assert.equal(filterProperties([p], { localityId: 'not-the-locality' }).length, 0);
  assert.equal(filterProperties([p], { savedIds: [] }).length, 0);
});
test('renaming a locality preserves relationships', () => {
  const d = clone(input); d.localities[0].name = 'Renamed Locality';
  const ps = createCatalog(catalogSchema.parse(d)).properties;
  assert.equal(ps[0].locality, 'Renamed Locality'); assert.equal(ps[0].localityId, d.localities[0].id);
});
test('display formatting distinguishes studios, plots and unknowns', () => {
  assert.equal(bedroomLabel(0, 'Apartment'), 'Studio'); assert.equal(bedroomLabel(null, 'Plot'), 'Plot');
  assert.equal(formatArea(null), 'Area on request'); assert.equal(formatInr(null), 'Price on request');
  assert.equal(formatInr(16500000), '₹1.65 Cr'); assert.equal(formatInr(9500000), '₹95 L');
});
test('villa collection includes villas, row houses and mixed projects with legacy URL support', () => {
  const data = clone(input);
  const source = data.properties.find(p => p.type === 'Apartment');
  data.properties = ['Villa', 'Row House', 'Apartment and Villa', 'Apartment'].map((type, i) => ({
    ...clone(source), id: `villa-category-${i}`, type, relatedPropertyIds: [],
  }));
  const records = createCatalog(catalogSchema.parse(data)).properties;
  assert.deepEqual(records.map(p => p.type), ['Villa', 'Villa', 'Villa', 'Apartment']);
  for (const type of ['Villa', 'Row House', 'Apartment and Villa']) {
    assert.equal(filterProperties(records, {type}).length, 3);
  }
  assert.equal(filterProperties(records, {query: 'villa'}).length, 3);
  assert.equal(filterProperties(records, {query: 'row house'}).length, 1);
});
test('market minimum cannot exceed maximum', () => {
  assert.equal(mutate(d => d.localities[0].market = { summary: 'test', minPricePerSqFtInr: 9000, maxPricePerSqFtInr: 8000, rentalYieldPercent: null, asOf: null, sourceUrl: null }).success, false);
});


test('project unit totals prefer explicit data and never substitute phase counts or area values', () => {
  const p = clone(catalog.properties.find(p => p.id === 'sumadhura-epitome-i')); delete p.projectScale;
  assert.equal(projectUnitCount(p), 262);
  assert.equal(projectUnitCount({...p,totalUnits:300}),300);
  assert.equal(projectUnitCount({...p,facts:[{label:'Phase II Homes',value:'798'},{label:'Land Area',value:'18'}]}),null);
  assert.equal(projectUnitCount({...p,facts:[{label:'Total units',value:'1,250'}]}),1250);
  assert.equal(propertySchema.safeParse({...input.properties[0],totalUnits:-1}).success,false);
});

test('card configurations include the full project offer and actual plot sizes', () => {
  const p = catalog.properties.find(p => p.id === 'prestige-finsbury-park');
  assert.equal(cardConfigurationSummary(p),'1, 2, 3 BHK');
  const plot = catalog.properties.find(p => p.id === 'earthsong-by-manyata');
  assert.match(cardConfigurationSummary(plot),/1,200.*1,500.*2,400.*4,300 sq ft plots/);
});
