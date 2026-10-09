import type { LocalityRecord, PropertyRecord } from './catalog-schema';

export const formatArea = (area: number | null) => area === null ? 'Area on request' : `${area.toLocaleString('en-IN')} sq ft`;
export const formatPrice = (crores: number | null) => crores === null ? 'Price on request' : crores < 1 ? `₹${Number((crores * 100).toFixed(2))} L` : `₹${crores.toFixed(2)} Cr`;
export const formatInr = (rupees: number | null) => formatPrice(rupees === null ? null : rupees / 10000000);
export const bedroomLabel = (bedrooms: number | null, type: string) => type === 'Plot' ? 'Plot' : bedrooms === null ? 'On request' : bedrooms === 0 ? 'Studio' : `${bedrooms} BHK`;
export const normalizeSearch = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
export const propertyType = (type: string) => type === 'Row House' || type === 'Apartment and Villa' ? 'Villa' : type;

export function createCatalog(records: { properties: PropertyRecord[]; localities: LocalityRecord[] }) {
  const localities = records.localities.filter(l => l.published).map(l => {
    const cover = l.images.find(image => image.id === l.coverImageId)!;
    return { ...l, cover, slug: l.id, image: cover.src, imageNote: cover.caption, label: l.tagline, text: l.description };
  });
  const properties = records.properties.filter(p => p.published).map(p => {
    const locality = localities.find(l => l.id === p.localityId)!;
    const primary = p.configurations.find(c => c.id === p.primaryConfigurationId)!;
    const cover = p.images.find(image => image.id === p.coverImageId)!;
    const type = propertyType(p.type) as 'Apartment' | 'Villa' | 'Plot';
    const searchText = normalizeSearch([p.name, p.developerName, p.phaseName, p.address, p.postalCode, p.type, type, p.status, ...p.searchKeywords, ...p.configurations.map(c => bedroomLabel(c.bedrooms, type)), locality.name, locality.zone, locality.city, ...locality.tags, ...locality.searchKeywords].filter(Boolean).join(' '));
    return { ...p, type, primary, cover, locality: locality.name, zone: locality.zone, city: locality.city, image: cover.src, bhk: primary.bedrooms, area: primary.areaSqFt, price: primary.startingPriceInr === null ? null : primary.startingPriceInr / 10000000, searchText };
  });
  return { properties, localities };
}
export type Property = ReturnType<typeof createCatalog>['properties'][number];
export type Locality = ReturnType<typeof createCatalog>['localities'][number];
export function configurationLabel(c: PropertyRecord['configurations'][number], type: string) {
  if (type === 'Plot') return 'Plots';
  if (c.bedrooms === null) return c.label.split(/\s+[\u2014\u2013-]\s+/)[0];
  if (c.bedrooms === 0) return 'Studio';
  // Preserve marketed half-BHK flex-room options without changing the bedroom filter data.
  const marketed = c.label.match(/^(\d+(?:\.5)?)\s*BHK\b/i);
  return marketed && Math.floor(Number(marketed[1])) === c.bedrooms ? `${marketed[1]} BHK` : bedroomLabel(c.bedrooms, type);
}
export function configurationSummary(p: Pick<Property, 'type' | 'configurations'>) {
  if (p.type === 'Plot') return 'Residential plots';
  const layouts = p.configurations.filter(c => c.availability !== 'sold-out');
  const values = [...new Set(layouts.filter(c => c.bedrooms !== null && c.bedrooms > 0).map(c => Number(configurationLabel(c, p.type).split(' ')[0])))].sort((a, b) => a - b);
  const other = [...new Set(layouts.filter(c => c.bedrooms === null).map(c => configurationLabel(c, p.type)))];
  return [layouts.some(c => c.bedrooms === 0) ? 'Studio' : '', values.length ? `${values.join(', ')} BHK` : '', ...other].filter(Boolean).join(' / ') || 'Configuration on request';
}
export function propertyPriceSummary(p: Pick<Property, 'configurations'>) {
  const configurations = p.configurations.filter(c => c.availability !== 'sold-out');
  const prices = configurations.flatMap(c => c.startingPriceInr === null ? [] : [c.startingPriceInr]);
  if (!prices.length) return {label: 'Price on request', note: 'Contact us for the current cost sheet', min: null, max: null};
  const min = Math.min(...prices), max = Math.max(...prices);
  const partial = prices.length < configurations.length;
  return {label: min === max ? formatInr(min) : `${formatInr(min)} - ${formatInr(max)}`, note: partial ? 'Listed prices; other layouts on request' : 'Across listed layouts; availability on request', min, max};
}
export function mapEmbedUrl(record: Pick<PropertyRecord, 'coordinates' | 'mapUrl'>) {
  let query = record.coordinates ? `${record.coordinates.latitude},${record.coordinates.longitude}` : null;
  if (!query && record.mapUrl) {
    try {
      const url = new URL(record.mapUrl);
      if (url.hostname === 'www.google.com' || url.hostname === 'maps.google.com' || url.hostname === 'google.com') query = url.searchParams.get('query') || url.searchParams.get('q');
    } catch { return null; }
  }
  return query ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed` : null;
}
export type PropertyFilters = { query?: string; type?: string; status?: string; localityId?: string; bedrooms?: number; minPriceInr?: number; maxPriceInr?: number; savedIds?: string[]; sort?: string };

export function filterProperties(properties: Property[], filters: PropertyFilters = {}) {
  const words = normalizeSearch(filters.query || '').split(' ').filter(Boolean);
  const budgetActive = filters.minPriceInr !== undefined || filters.maxPriceInr !== undefined;
  const configActive = budgetActive || filters.bedrooms !== undefined;
  const matchesConfiguration = (c: Property['primary']) => c.availability !== 'sold-out' && (filters.bedrooms === undefined || c.bedrooms === filters.bedrooms) && (!budgetActive || c.startingPriceInr !== null && c.startingPriceInr >= (filters.minPriceInr ?? 0) && c.startingPriceInr <= (filters.maxPriceInr ?? Infinity));
  const results = properties.filter(p => words.every(word => p.searchText.includes(word)) && (!filters.type || p.type === propertyType(filters.type)) && (!filters.status || p.status === filters.status) && (!filters.localityId || p.localityId === filters.localityId) && (!filters.savedIds || filters.savedIds.includes(p.id)) && (!configActive || p.configurations.some(matchesConfiguration)));
  // The matching configuration drives the result card and sort, not an unrelated base unit.
  const cards = results.map(p => {
    const configurations = p.configurations.filter(c => configActive ? matchesConfiguration(c) : c.availability !== 'sold-out');
    const primary = configurations.toSorted((a, b) => (a.startingPriceInr ?? Infinity) - (b.startingPriceInr ?? Infinity))[0] ?? p.primary;
    return { ...p, primary, bhk: primary.bedrooms, area: primary.areaSqFt, price: primary.startingPriceInr === null ? null : primary.startingPriceInr / 10000000 };
  });
  if (filters.sort?.startsWith('Price:')) cards.sort((a, b) => a.price === null ? b.price === null ? 0 : 1 : b.price === null ? -1 : filters.sort === 'Price: high to low' ? b.price - a.price : a.price - b.price);
  return cards;
}
export function budgetBounds(properties: Property[]): [number, number] {
  const prices = properties.flatMap(p => p.configurations.flatMap(c => c.startingPriceInr === null ? [] : [c.startingPriceInr / 10000000]));
  return [0, Math.max(5, Math.ceil(Math.max(0, ...prices) * 20) / 20)];
}
