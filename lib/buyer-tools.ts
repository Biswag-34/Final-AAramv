import type {Property} from './catalog';

export function validSelection(raw: string | null, validIds: readonly string[], limit = 4): string[] {
  try {
    const parsed: unknown = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? [...new Set(parsed.filter((id): id is string => typeof id === 'string' && validIds.includes(id)))].slice(0, limit) : [];
  } catch { return []; }
}

export function areaRange(p: Pick<Property, 'configurations'>) {
  const options = p.configurations.filter(c => c.availability !== 'sold-out' && c.areaSqFt !== null);
  const bases = [...new Set(options.map(c => c.areaBasis))];
  const values = options.flatMap(c => [c.areaSqFt!, c.areaMaxSqFt ?? c.areaSqFt!]);
  if (!values.length) return 'Size on request';
  const min = Math.min(...values), max = Math.max(...values);
  return `${min.toLocaleString('en-IN')}${min === max ? '' : `–${max.toLocaleString('en-IN')}`} sq ft · ${bases.length === 1 && bases[0] !== 'unspecified' ? bases[0].replaceAll('-', ' ') : 'across layouts'}`;
}

export function projectTag(p: Pick<Property, 'type' | 'status' | 'configurations'>) {
  if (p.status === 'Ready to move') return 'Ready for your next chapter';
  if (p.type === 'Plot') return 'Plan your own home';
  if (p.type === 'Villa') return 'Room for family life';
  if (p.configurations.some(c => c.bedrooms !== null && c.bedrooms <= 1)) return 'Compact home options';
  return 'Family home options';
}

export type DecisionFilters = {area: string; timeline: string; corridor: string; intent: string};
export const emptyDecisionFilters: DecisionFilters = {area: '', timeline: '', corridor: '', intent: ''};
export function filterUnitChoices(items: Property[], filters: DecisionFilters): Property[] {
  if (!filters.area && !['family', 'compact'].includes(filters.intent)) return items;
  return items.flatMap(p => {
    const configurations = p.configurations.filter(c => c.availability !== 'sold-out' && (!filters.area || c.areaSqFt !== null && (filters.area === 'compact' ? c.areaSqFt < 1200 : filters.area === 'medium' ? (c.areaMaxSqFt ?? c.areaSqFt) >= 1200 && c.areaSqFt <= 1800 : (c.areaMaxSqFt ?? c.areaSqFt) > 1800)) && (filters.intent !== 'family' || (c.bedrooms ?? 0) >= 2) && (filters.intent !== 'compact' || c.bedrooms !== null && c.bedrooms <= 1));
    if (!configurations.length) return [];
    return [{...p, configurations, primary: configurations.find(c => c.id === p.primary.id) || configurations[0]}];
  });
}
export function applyDecisionFilters(items: Property[], filters: DecisionFilters, now = new Date()) {
  return items.filter(p => {
    if (filters.area && !p.configurations.some(c => c.availability !== 'sold-out' && c.areaSqFt !== null && (filters.area === 'compact' ? c.areaSqFt < 1200 : filters.area === 'medium' ? (c.areaMaxSqFt ?? c.areaSqFt) >= 1200 && c.areaSqFt <= 1800 : (c.areaMaxSqFt ?? c.areaSqFt) > 1800))) return false;
    if (filters.timeline) {
      if (filters.timeline === 'ready') {if (p.status !== 'Ready to move') return false;}
      else if (p.status !== 'Ready to move') {
        // Use the end of the supplied precision; a year-only promise is not a specific month.
        const end = p.possession.date ? new Date(`${p.possession.date}T23:59:59`) : p.possession.year ? new Date(p.possession.year, p.possession.month ?? 12, 0, 23, 59, 59) : null;
        const cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() + Number(filters.timeline));
        if (!end || end > cutoff || end < now) return false;
      }
    }
    if (filters.corridor && ![...p.nearbyPlaces.map(place => place.name), ...p.searchKeywords, p.address || ''].join(' ').toLowerCase().includes(filters.corridor.toLowerCase())) return false;
    if (filters.intent === 'family' && !p.configurations.some(c => (c.bedrooms ?? 0) >= 2 && c.availability !== 'sold-out')) return false;
    if (filters.intent === 'compact' && !p.configurations.some(c => c.bedrooms !== null && c.bedrooms <= 1 && c.availability !== 'sold-out')) return false;
    if (filters.intent === 'land' && p.type !== 'Plot') return false;
    return true;
  });
}
