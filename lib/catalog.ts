import type { LocalityRecord, PropertyRecord } from './catalog-schema';

export const formatArea = (area: number | null) => area === null ? 'Area on request' : `${area.toLocaleString('en-IN')} sq ft`;
export const formatPrice = (crores: number | null) => crores === null ? 'Price on request' : crores < 1 ? `₹${Number((crores * 100).toFixed(2))} L` : `₹${crores.toFixed(2)} Cr`;
export const formatInr = (rupees: number | null) => formatPrice(rupees === null ? null : rupees / 10000000);
export const bedroomLabel = (bedrooms: number | null, type: string) => type === 'Plot' ? 'Plot' : bedrooms === null ? 'On request' : bedrooms === 0 ? 'Studio' : `${bedrooms} BHK`;
export const normalizeSearch = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

export function createCatalog(records: { properties: PropertyRecord[]; localities: LocalityRecord[] }) {
  const localities = records.localities.filter(l => l.published).map(l => {
    const cover = l.images.find(image => image.id === l.coverImageId)!;
    return { ...l, cover, slug: l.id, image: cover.src, imageNote: cover.caption, label: l.tagline, text: l.description };
  });
  const properties = records.properties.filter(p => p.published).map(p => {
    const locality = localities.find(l => l.id === p.localityId)!;
    const primary = p.configurations.find(c => c.id === p.primaryConfigurationId)!;
    const cover = p.images.find(image => image.id === p.coverImageId)!;
    const searchText = normalizeSearch([p.name, p.developerName, p.phaseName, p.address, p.postalCode, p.type, p.status, ...p.searchKeywords, ...p.configurations.map(c => bedroomLabel(c.bedrooms, p.type)), locality.name, locality.zone, locality.city, ...locality.tags, ...locality.searchKeywords].filter(Boolean).join(' '));
    return { ...p, primary, cover, locality: locality.name, zone: locality.zone, city: locality.city, image: cover.src, bhk: primary.bedrooms, area: primary.areaSqFt, price: primary.startingPriceInr === null ? null : primary.startingPriceInr / 10000000, searchText };
  });
  return { properties, localities };
}
export type Property = ReturnType<typeof createCatalog>['properties'][number];
export type Locality = ReturnType<typeof createCatalog>['localities'][number];
export type PropertyFilters = { query?: string; type?: string; status?: string; localityId?: string; bedrooms?: number; minPriceInr?: number; maxPriceInr?: number; savedIds?: string[]; sort?: string };

export function filterProperties(properties: Property[], filters: PropertyFilters = {}) {
  const words = normalizeSearch(filters.query || '').split(' ').filter(Boolean);
  const budgetActive = filters.minPriceInr !== undefined || filters.maxPriceInr !== undefined;
  const configActive = budgetActive || filters.bedrooms !== undefined;
  const matchesConfiguration = (c: Property['primary']) => c.availability !== 'sold-out' && (filters.bedrooms === undefined || c.bedrooms === filters.bedrooms) && (!budgetActive || c.startingPriceInr !== null && c.startingPriceInr >= (filters.minPriceInr ?? 0) && c.startingPriceInr <= (filters.maxPriceInr ?? Infinity));
  const results = properties.filter(p => words.every(word => p.searchText.includes(word)) && (!filters.type || p.type === filters.type) && (!filters.status || p.status === filters.status) && (!filters.localityId || p.localityId === filters.localityId) && (!filters.savedIds || filters.savedIds.includes(p.id)) && (!configActive || p.configurations.some(matchesConfiguration)));
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
