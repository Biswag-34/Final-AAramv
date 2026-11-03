import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

// Run against a completed production build served locally on the fixed port.
// --staging checks the same build started with SITE_INDEXING_ENABLED=false.
const base = (process.env.SEO_TEST_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const staging = process.argv.includes('--staging');
const origin = 'https://www.aaramvreality.com';
const records = async name => JSON.parse(await readFile(new URL(`../data/${name}.json`, import.meta.url), 'utf8'));
const properties = (await records('properties')).filter(p => p.published && !p.isDemo);
const localities = (await records('localities')).filter(l => l.published && !l.isDemo);
const publicPaths = ['/', '/properties', '/localities', '/about', '/contact', '/guides', '/tools', '/privacy', '/terms', ...properties.map(p => `/properties/${p.id}`), ...localities.map(l => `/localities/${l.id}`)];
const decode = value => value?.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m => [m[1], decode(m[2])]));
}
function head(html) {
  const meta = [...html.matchAll(/<meta\b[^>]*>/g)].map(m => attributes(m[0]));
  const get = name => meta.filter(m => m.name === name || m.property === name).map(m => m.content);
  const canonical = [...html.matchAll(/<link\b[^>]*>/g)].map(m => attributes(m[0])).filter(m => m.rel === 'canonical').map(m => m.href);
  const graphs = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  return { get, canonical, graphs, title: decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]) };
}
async function fetchPage(path, indexable, userAgent) {
  const response = await fetch(base + path, { redirect: 'manual', headers: userAgent ? { 'User-Agent': userAgent } : {} });
  assert.equal(response.status, 200, path);
  const html = await response.text(), parsed = head(html);
  assert.equal(parsed.get('robots').length, 1, `One robots directive: ${path}`);
  assert.equal(parsed.get('robots')[0].includes('noindex'), !indexable, path);
  assert.ok(!parsed.get('robots')[0].includes('nofollow'), path);
  if (indexable) {
    assert.ok(!/noindex|none/i.test(response.headers.get('x-robots-tag') || ''), path);
    assert.ok(parsed.get('googlebot').every(value => !/noindex|nofollow/.test(value)), path);
  }
  assert.deepEqual(parsed.canonical.map(value => new URL(value).href), [new URL(path.split('?')[0], origin).href], path);
  assert.ok(parsed.title?.includes('Aaramv Realty'), path);
  assert.equal(parsed.get('description').length, 1, path);
  assert.deepEqual(parsed.get('og:url').map(value => new URL(value).href), parsed.canonical.map(value => new URL(value).href), path);
  assert.deepEqual(parsed.get('og:title'), [parsed.title], path);
  assert.deepEqual(parsed.get('twitter:title'), [parsed.title], path);
  assert.deepEqual(parsed.get('twitter:card'), ['summary_large_image'], path);
  assert.ok(parsed.get('og:image')[0]?.startsWith(origin + '/'), path);
  assert.ok(!/<link[^>]+rel="(?:icon|apple-touch-icon)"[^>]+href="\/images\/aaramv-realty-logo.png"/.test(html), path);
  return { html, ...parsed };
}

const titles = new Set(), descriptions = new Set();
for (const path of publicPaths) {
  const page = await fetchPage(path, !staging);
  assert.ok(!titles.has(page.title), `Unique title: ${path}`); titles.add(page.title);
  assert.ok(!descriptions.has(page.get('description')[0]), `Unique description: ${path}`); descriptions.add(page.get('description')[0]);
  assert.equal(page.graphs.length, 1, path);
  const graph = page.graphs[0]['@graph'];
  assert.ok(graph.some(item => item['@type'] === 'Organization'), path);
  assert.ok(graph.some(item => item['@type'] === 'WebSite'), path);
  assert.ok(!graph.some(item => item.aggregateRating || item.offers), `No unsupported ratings/offers: ${path}`);
  if (/^\/(properties|localities)\//.test(path)) {
    const crumbs = graph.find(item => item['@type'] === 'BreadcrumbList');
    assert.equal(crumbs.itemListElement.length, 3, path);
    assert.equal(crumbs.itemListElement[2].item, origin + path, path);
    assert.ok(page.html.includes('aria-label="Breadcrumb"'), `Visible breadcrumbs: ${path}`);
    assert.ok(page.html.includes('<h1'), `Server-rendered heading: ${path}`);
    assert.ok(page.html.includes('Sources &amp; catalogue notes'), `Visible source attribution: ${path}`);
  }
}
for (const path of ['/compare', '/shortlist', '/thank-you', '/coming-soon', '/properties?q=Bagalur', '/properties?type=Plot&budget=2', '/properties?saved=true', '/tools?tool=emi&price=9500000']) {
  const page = await fetchPage(path, false);
  assert.equal(page.graphs.length, 0, `No canonical collection schema on private/filtered states: ${path}`);
}
await fetchPage('/properties?utm_source=chatgpt.com', !staging);
await fetchPage(`/properties/${properties[0].id}?layout=${properties[0].primaryConfigurationId}`, !staging);
await fetchPage('/tools?tool=emi', !staging);
await fetchPage('/about', !staging, 'Googlebot');
for (const path of ['/this-page-does-not-exist', '/properties/missing-project', '/localities/missing-locality', '/property/godrej-vanantara', '/property/assetz-sora-and-saki']) {
  const response = await fetch(base + path);
  assert.equal(response.status, 404, path);
  const page = head(await response.text());
  assert.ok(page.get('robots').some(value => value.includes('noindex')), path);
  assert.deepEqual(page.canonical, [], path);
}
const robots = await fetch(base + '/robots.txt');
assert.equal(robots.status, 200); assert.ok(robots.headers.get('content-type')?.includes('text/plain'));
const robotsText = await robots.text();
assert.ok(robotsText.includes('User-Agent: *'));
assert.ok(staging ? /Disallow: \/\s*$/.test(robotsText) : robotsText.includes(`Sitemap: ${origin}/sitemap.xml`));
if (!staging) assert.ok(!/^Disallow: \/$/m.test(robotsText));
const sitemap = await fetch(base + '/sitemap.xml');
assert.equal(sitemap.status, 200); assert.ok(sitemap.headers.get('content-type')?.includes('xml'));
const urls = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
assert.deepEqual(urls.toSorted(), staging ? [] : publicPaths.map(path => origin + path).toSorted());
for (const size of [16, 32, 48, 64, 96, 180, 192, 512]) {
  const response = await fetch(base + (size === 180 ? '/apple-touch-icon.png' : `/favicon-${size}x${size}.png`));
  assert.equal(response.status, 200); assert.ok(response.headers.get('content-type')?.includes('image/png'));
  const metadata = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
  assert.equal(metadata.width, size); assert.equal(metadata.height, size);
}
const icoResponse = await fetch(base + '/favicon.ico');
assert.equal(icoResponse.status, 200); assert.ok(/image\//.test(icoResponse.headers.get('content-type')));
const ico = Buffer.from(await icoResponse.arrayBuffer());
assert.equal(ico.readUInt16LE(2), 1); assert.equal(ico.readUInt16LE(4), 4);
for (const [i, size] of [16, 32, 48, 64].entries()) { assert.equal(ico[6 + i * 16], size); assert.equal(ico[7 + i * 16], size); }
console.log(`SEO HTTP checks passed: ${publicPaths.length} public routes, private/query policies, real 404s, structured data, crawl files and nine icon assets (${staging ? 'staging' : 'production'}).`);
