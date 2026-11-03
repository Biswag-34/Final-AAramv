import { properties, localities } from '../app/data';
import { businessDetails } from '../lib/business-details';
import { SITE_URL, SITE_NAME, pageDetails, breadcrumbItems } from '../lib/seo';

type Entity = Record<string, unknown>;
const url = (path: string) => new URL(path, SITE_URL).href;
const organizationId = `${SITE_URL}/#organization`;
const websiteId = `${SITE_URL}/#website`;

export function SeoStructuredData({ path }: { path: string }) {
  const page = pageDetails(path);
  if (!page?.indexable) return null;
  // No verified street address is available for LocalBusiness/RealEstateAgent.
  const organization: Entity = {
    '@type': 'Organization', '@id': organizationId, name: SITE_NAME,
    url: `${SITE_URL}/`, logo: url('/images/aaramv-realty-logo.png'),
    description: 'Bengaluru property consulting team and real estate channel partner.',
    areaServed: { '@type': 'City', name: 'Bengaluru' },
    ...(businessDetails.phone ? { telephone: `+91${businessDetails.phone}` } : {}),
    ...(businessDetails.email ? { email: businessDetails.email } : {}),
    ...(businessDetails.socialProfiles.length ? { sameAs: businessDetails.socialProfiles.map(p => p.url) } : {}),
  };
  const graph: Entity[] = [organization, {
    '@type': 'WebSite', '@id': websiteId, name: SITE_NAME,
    url: `${SITE_URL}/`, publisher: { '@id': organizationId }, inLanguage: 'en-IN',
  }];
  const webPage: Entity = {
    '@type': path === '/about' ? 'AboutPage' : path === '/contact' ? 'ContactPage' : ['/properties', '/localities', '/guides'].includes(path) ? 'CollectionPage' : 'WebPage',
    '@id': `${url(path)}#webpage`, url: url(path), name: page.title,
    description: page.description, isPartOf: { '@id': websiteId },
    publisher: { '@id': organizationId }, inLanguage: 'en-IN',
  };
  const p = properties.find(p => path === `/properties/${p.id}`);
  const l = localities.find(l => path === `/localities/${l.id}`);
  const record = p || l;
  if (record?.updatedAt) webPage.dateModified = record.updatedAt;
  if (record) {
    const place: Entity = { '@type': 'Place', '@id': `${url(path)}#place`, name: record.name, url: url(path), image: url(record.cover.src) };
    if (record.coordinates) place.geo = { '@type': 'GeoCoordinates', latitude: record.coordinates.latitude, longitude: record.coordinates.longitude };
    webPage.about = place;
    const sources = record.sources.filter(s => s.url && !s.url.startsWith(SITE_URL));
    if (sources.length) webPage.citation = [...new Set(sources.map(s => s.url))];
  }
  const crumbs = record ? breadcrumbItems(path) : [];
  if (crumbs.length) {
    webPage.breadcrumb = { '@id': `${url(path)}#breadcrumb` };
    graph.push({ '@type': 'BreadcrumbList', '@id': `${url(path)}#breadcrumb`, itemListElement: crumbs.map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, name: crumb.name, item: url(crumb.path) })) });
  }
  const entries = path === '/properties' ? properties.filter(p => !p.isDemo) : path === '/localities' ? localities.filter(l => !l.isDemo) : l ? properties.filter(p => p.localityId === l.id && !p.isDemo) : [];
  if (entries.length) webPage.mainEntity = {
    '@type': 'ItemList', numberOfItems: entries.length,
    itemListElement: entries.map((entry, i) => ({ '@type': 'ListItem', position: i + 1, name: entry.name, url: url(`${path === '/localities' ? '/localities' : '/properties'}/${entry.id}`) })),
  };
  graph.push(webPage);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c') }} />;
}
