import type { MetadataRoute } from 'next';
import { canonicalPages, indexingEnabled, SITE_URL } from '../lib/seo';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexingEnabled()) return [];
  return canonicalPages().map(page => ({
    url: new URL(page.path, SITE_URL).href,
    // Recorded content dates, never today's build date.
    ...(page.updatedAt ? { lastModified: page.updatedAt } : {}),
  }));
}
