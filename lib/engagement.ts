export type EngagementEvent = 'search' | 'results_view' | 'project_view' | 'save' | 'compare_select' | 'compare_view' | 'enquiry_recorded' | 'return_visit';
// Browser-local measurements only. No queries, contact details, messages or notes.
export function trackEngagement(event: EngagementEvent, projectId?: string) {
  if (typeof window === 'undefined') return;
  try {
    const key = 'aaramv-engagement';
    const raw: unknown = JSON.parse(localStorage.getItem(key) || '[]');
    const previous = Array.isArray(raw) ? raw.filter(value => value && typeof value === 'object' && typeof value.at === 'number' && value.at > Date.now() - 30 * 86400000) : [];
    localStorage.setItem(key, JSON.stringify([...previous.slice(-1999), {event, ...(projectId ? {projectId} : {}), at: Date.now()}]));
  } catch {}
}
