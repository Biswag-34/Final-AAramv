export const savedHomesKey = 'aaramv-saved';

export function parseSavedHomes(raw: string | null, validIds: readonly string[]): string[] {
  try {
    const data: unknown = JSON.parse(raw || 'null');
    const ids = Array.isArray(data) ? data : data && typeof data === 'object' && 'version' in data && data.version === 1 && 'ids' in data ? data.ids : [];
    if (!Array.isArray(ids)) return [];
    const valid = new Set(validIds);
    return [...new Set(ids.filter((id): id is string => typeof id === 'string' && valid.has(id)))];
  } catch { return []; }
}

export function serializeSavedHomes(ids: readonly string[]) {
  return JSON.stringify({version: 1, ids: [...new Set(ids)]});
}
