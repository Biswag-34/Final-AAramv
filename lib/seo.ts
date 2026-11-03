import type { Metadata } from 'next';
import { properties, localities } from '../app/data';
import { configurationSummary } from './catalog';

export const SITE_URL = 'https://www.aaramvreality.com';
export const SITE_NAME = 'Aaramv Realty';
export type SearchParams = Record<string, string | string[] | undefined>;

// Keep local development and Vercel previews excluded. Self-hosted staging
// must set SITE_INDEXING_ENABLED=false; public production is indexable.
export function indexingEnabled() {
  if (process.env.SITE_INDEXING_ENABLED === 'false') return false;
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') return false;
  return process.env.NODE_ENV === 'production';
}

export const publicPages: Record<string, { title: string; description: string; label: string }> = {
  '/': { title: 'Bengaluru Homes & Property Guidance | Aaramv Realty', description: 'Compare Bengaluru apartments, villas and plots with Aaramv Realty. Explore North Bengaluru projects, neighbourhood guides and buyer-first property guidance.', label: 'Home' },
  '/properties': { title: 'Bengaluru Apartments, Villas & Plots | Aaramv Realty', description: 'Explore Bengaluru apartments, villas and plots by locality, home type and budget. Compare layouts and project details, then request current availability and costs.', label: 'Properties' },
  '/localities': { title: 'Bengaluru Neighbourhood & Locality Guides | Aaramv Realty', description: 'Explore Bengaluru neighbourhoods including Bagalur, Thanisandra and Devanahalli. Compare listed projects, local context and everyday routes to check on a visit.', label: 'Localities' },
  '/about': { title: 'About Aaramv Realty | Bengaluru Property Consultants', description: 'Meet Aaramv Realty, a Bengaluru property consulting team and real estate channel partner. Learn about requirement-led research, developer coordination and buyer support.', label: 'About' },
  '/contact': { title: 'Contact Aaramv Realty | Bengaluru Property Guidance', description: 'Contact Aaramv Realty about Bengaluru homes. Share your budget, preferred areas and priorities, request a cost sheet or arrange a separately confirmed site visit.', label: 'Contact' },
  '/guides': { title: 'Bengaluru Home Buying Guides & Checklists | Aaramv Realty', description: 'Build a focused property shortlist, understand a home cost sheet and prepare for a site visit. Practical checklists for your Bengaluru home search.', label: 'Buyer guides' },
  '/tools': { title: 'EMI, Purchase Cost & Rental Yield Calculators | Aaramv Realty', description: 'Estimate your home loan EMI, total purchase cost and rental yield using your own assumptions. Plan a Bengaluru home purchase with Aaramv Realty buyer tools.', label: 'Buyer tools' },
  '/privacy': { title: 'Privacy Policy | Aaramv Realty', description: 'Learn how Aaramv Realty handles enquiry details, browser-saved homes and personal notes, and how to contact the team about your information.', label: 'Privacy policy' },
  '/terms': { title: 'Terms & Conditions | Aaramv Realty', description: 'Read the terms for using the Aaramv Realty website, its role as a real estate channel partner and the project information to confirm before a transaction.', label: 'Terms and conditions' },
};

const privatePages: typeof publicPages = {
  '/compare': { title: 'Compare Your Shortlisted Homes | Aaramv Realty', description: 'Compare up to four Bengaluru projects by home type, stated starting price, size, possession and location.', label: 'Compare homes' },
  '/shortlist': { title: 'Your Saved Homes & Notes | Aaramv Realty', description: 'Keep favourite Bengaluru homes, private notes and comparison selections together in this browser.', label: 'Saved homes' },
  '/thank-you': { title: 'Thank You | Aaramv Realty', description: 'View the next steps for your property enquiry.', label: 'Thank you' },
  '/coming-soon': { title: 'This Page Is Being Prepared | Aaramv Realty', description: 'Explore our current catalogue while we finish this page.', label: 'Coming soon' },
};

export function pageDetails(path: string) {
  if (publicPages[path]) return { ...publicPages[path], indexable: true, image: '/images/aaramv-buyer-first-hero.png', imageAlt: 'Illustrative scene of a buyer and advisor reviewing home layouts' };
  if (privatePages[path]) return { ...privatePages[path], indexable: false, image: '/images/aaramv-buyer-first-hero.png', imageAlt: 'Aaramv Realty buyer guidance' };
  const parts = path.split('/').filter(Boolean);
  if (parts.length !== 2) return null;
  if (parts[0] === 'properties') {
    const p = properties.find(p => p.id === parts[1] && !p.isDemo);
    if (!p) return null;
    return { title: `${p.name}, ${p.locality} | Aaramv Realty`, description: `Explore ${p.name} by ${p.developerName} in ${p.locality}, Bengaluru. Compare ${configurationSummary(p)} layouts and project details; request current costs and availability.`, label: p.name, indexable: true, image: p.cover.src, imageAlt: p.cover.alt };
  }
  if (parts[0] === 'localities') {
    const l = localities.find(l => l.id === parts[1] && !l.isDemo);
    if (!l) return null;
    return { title: `${l.name}, Bengaluru: Homes & Area Guide | Aaramv Realty`, description: `Explore homes in ${l.name}, Bengaluru. Compare Aaramv's listed projects, neighbourhood highlights and everyday routes before arranging a site visit.`, label: l.name, indexable: true, image: l.cover.src, imageAlt: l.cover.alt };
  }
  return null;
}

// Tracking does not change content. Exclude filter/search combinations and
// calculator input states while keeping their clean hubs indexable.
export function hasPrivateQuery(path: string, params: SearchParams) {
  const keys = Object.keys(params).filter(key => params[key] !== undefined);
  const tracking = (key: string) => /^utm_/i.test(key) || ['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid'].includes(key);
  if (path === '/properties') return keys.some(key => !tracking(key));
  if (path === '/tools') return keys.some(key => key !== 'tool' && !tracking(key));
  return false;
}

export function pageMetadata(path: string, params: SearchParams = {}): Metadata {
  const page = pageDetails(path);
  if (!page) return { title: 'Page Not Found | Aaramv Realty', description: 'Explore our current homes or return to the homepage.', robots: { index: false, follow: true }, alternates: { canonical: null } };
  const index = indexingEnabled() && page.indexable && !hasPrivateQuery(path, params);
  return {
    title: page.title, description: page.description, alternates: { canonical: path },
    robots: { index, follow: true, ...(index ? { googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } } : {}) },
    openGraph: { type: 'website', locale: 'en_IN', siteName: SITE_NAME, url: path, title: page.title, description: page.description, images: [{ url: page.image, alt: page.imageAlt }] },
    twitter: { card: 'summary_large_image', title: page.title, description: page.description, images: [{ url: page.image, alt: page.imageAlt }] },
  };
}

export function canonicalPages() {
  return [
    ...Object.keys(publicPages).map(path => ({ path, updatedAt: null as string | null })),
    ...properties.filter(p => !p.isDemo).map(p => ({ path: `/properties/${p.id}`, updatedAt: p.updatedAt })),
    ...localities.filter(l => !l.isDemo).map(l => ({ path: `/localities/${l.id}`, updatedAt: l.updatedAt })),
  ];
}

export function breadcrumbItems(path: string) {
  const page = pageDetails(path);
  if (!page || path === '/') return [];
  const items = [{ name: 'Home', path: '/' }];
  if (path.startsWith('/properties/')) items.push({ name: 'Properties', path: '/properties' });
  if (path.startsWith('/localities/')) items.push({ name: 'Localities', path: '/localities' });
  return [...items, { name: page.label, path }];
}
