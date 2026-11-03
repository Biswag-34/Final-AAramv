import type { MetadataRoute } from 'next';
import { indexingEnabled, SITE_URL } from '../lib/seo';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  if (!indexingEnabled()) return { rules: { userAgent: '*', disallow: '/' } };
  // Utility pages stay crawlable so bots see noindex. The wildcard permits
  // search crawlers including OAI-SearchBot. No training preference is changed.
  return { rules: { userAgent: '*', allow: '/', disallow: '/api/' }, sitemap: `${SITE_URL}/sitemap.xml` };
}
