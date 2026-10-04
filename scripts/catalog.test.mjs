import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { catalogSchema, propertySchema, localitySchema } from '../lib/catalog-schema.ts';
import { createCatalog, filterProperties, budgetBounds, formatArea, formatInr, bedroomLabel } from '../lib/catalog.ts';

const read = async file => JSON.parse(await readFile(new URL(`../${file}`, import.meta.url), 'utf8'));
const input = { properties: await read('data/properties.json'), localities: await read('data/localities.json') };
const catalog = createCatalog(catalogSchema.parse(input));
const clone = value => structuredClone(value);
const mutate = change => { const data = clone(input); change(data); return catalogSchema.safeParse(data); };

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
test('sold-out units do not match configuration filters', () => {
  const p = clone(catalog.properties[0]); p.configurations.forEach(c => c.availability = 'sold-out');
  assert.equal(filterProperties([p], { bedrooms: 3 }).length, 0);
  assert.equal(filterProperties([p]).length, 1);
});
test('unknown prices are visible unfiltered, excluded by budget, sorted last', () => {
  const p = clone(catalog.properties[0]); p.id = 'unknown-price'; p.configurations.forEach(c => c.startingPriceInr = null);
  const priced = catalog.properties.find(property => property.configurations.some(c => c.startingPriceInr !== null));
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
test('market minimum cannot exceed maximum', () => {
  assert.equal(mutate(d => d.localities[0].market = { summary: 'test', minPricePerSqFtInr: 9000, maxPricePerSqFtInr: 8000, rentalYieldPercent: null, asOf: null, sourceUrl: null }).success, false);
});
