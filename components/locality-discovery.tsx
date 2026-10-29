'use client';

import {useState, type ReactNode} from 'react';
import Link from 'next/link';
import {ArrowUpRight, ArrowRight, Search, MapPin, Building2, House, X, TrainFront, SlidersHorizontal} from 'lucide-react';
import {localities, properties, img} from '@/app/data';
import {configurationLabel, formatInr, normalizeSearch, type Locality} from '@/lib/catalog';

export function localitySummary(l: Locality) {
  const homes = properties.filter(p => p.localityId === l.id);
  const layouts = homes.flatMap(p => p.configurations.filter(c => c.availability !== 'sold-out').map(c => ({...c, type:p.type})));
  const prices = layouts.flatMap(c => c.startingPriceInr === null ? [] : [c.startingPriceInr]);
  const types = [...new Set(homes.map(p => p.type))];
  const configurations = [...new Set(layouts.map(c => configurationLabel(c,c.type)))].sort((a,b) => (Number.parseFloat(a)||0)-(Number.parseFloat(b)||0));
  return {homes, types, configurations, from:prices.length ? Math.min(...prices) : null};
}

export function LocalityPreviewCard({locality:l}: {locality:Locality}) {
  const summary = localitySummary(l);
  const project = properties.find(p => p.images.some(image => image.src === l.cover.src));
  return <article className="neighbourhood-guide-card compact-neighbourhood-card">
    <Link href={`/localities/${l.id}`} className="neighbourhood-guide-image" aria-label={`Explore ${l.name}`}><img src={l.cover.src} alt={project ? `${project.name} project reference` : l.cover.alt} loading="lazy" width={720} height={440}/><span className="neighbourhood-image-note">{project ? `Project reference · ${project.name}` : 'Reference image'}</span><span className="neighbourhood-project-count"><Building2 size={15}/><strong>{summary.homes.length}</strong> {summary.homes.length===1?'project':'projects'}</span></Link>
    <div className="neighbourhood-guide-copy"><h3><Link href={`/localities/${l.id}`}>{l.name}</Link></h3><div className="neighbourhood-card-types"><House size={16}/><div><span>Home types</span><p>{summary.types.join(' · ') || 'On request'}</p></div></div><Link href={`/localities/${l.id}`} className="neighbourhood-explore">Explore area <ArrowUpRight size={16}/></Link></div>
  </article>;
}

export function NeighbourhoodCollection() {
  // A cross-section of the actual catalogue: apartments, plots and villas in both zones.
  const picks = ['thanisandra','devanahalli','hennur-road','bagalur','ivc-road-devanahalli','chikkagubbi'].map(id => localities.find(l => l.id === id)).filter((l):l is Locality => !!l);
  return <section className="experience-section neighbourhood-collection" aria-labelledby="neighbourhood-album-title"><div className="experience-wrap"><div className="experience-heading"><div><p className="discovery-eyebrow">Find a neighbourhood. Then find your home.</p><h2 id="neighbourhood-album-title">Choose the area around your everyday.</h2><p>Compare the places in our catalogue, then check the routes and local essentials you will use most.</p></div><Link href="/localities" className="experience-link">Explore neighbourhoods <ArrowUpRight size={18}/></Link></div><div className="neighbourhood-guide-grid">{picks.map(l => <LocalityPreviewCard locality={l} key={l.id}/>)}</div><p className="neighbourhood-data-note">Counts cover Aaramv’s published catalogue. They do not represent the whole locality market.</p></div></section>;
}

export function LocalityDiscovery({closing}: {closing:ReactNode}) {
  const [query,setQuery] = useState(''), [zone,setZone] = useState(''), [type,setType] = useState('');
  const matches = localities.filter(l => (!zone || l.zone === zone) && (!type || localitySummary(l).types.includes(type as 'Apartment'|'Villa'|'Plot')) && normalizeSearch(`${l.name} ${l.zone} ${localitySummary(l).homes.map(p => p.name).join(' ')}`).includes(normalizeSearch(query)));
  return <main className="inner locality-discovery-page"><div className="wrap"><nav className="discovery-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Localities</span></nav><section className="discovery-hero"><div><p className="eyebrow">Bengaluru neighbourhood guides</p><h1>Find the neigh­bourhood that <em>fits your day.</em></h1><p>Start with the places Aaramv lists. Compare home types and projects, then check your routes, everyday essentials and the surroundings on a visit.</p><div className="discovery-totals"><span><strong>{localities.length}</strong> neighbourhoods</span><span><strong>{properties.length}</strong> listed projects</span><span>Apartments · Villas · Plots</span></div><a href="#neighbourhoods" className="btn primary">Explore neighbourhoods <ArrowRight size={17}/></a></div><div className="discovery-city-image"><img src={img('bengaluru-skyline')} alt="Bengaluru skyline" width={900} height={650}/><span>Bengaluru, Karnataka</span></div></section>
    <section className="discovery-directory" id="neighbourhoods" aria-labelledby="locality-directory-title"><div className="discovery-directory-heading"><div><p className="discovery-eyebrow">Explore the catalogue by area</p><h2 id="locality-directory-title">Where would you like to live?</h2></div><Link href="/properties" className="text-link">Compare all properties <SlidersHorizontal size={16}/></Link></div><div className="discovery-search-row"><label className="discovery-search"><Search size={19}/><input type="search" aria-label="Search neighbourhoods" placeholder="Search a neighbourhood or project" value={query} onChange={e => setQuery(e.target.value)}/></label><label className="discovery-type">Home type<select aria-label="Neighbourhood home type" value={type} onChange={e => setType(e.target.value)}><option value="">All home types</option><option>Apartment</option><option>Villa</option><option>Plot</option></select></label></div><div className="discovery-zone-filters" aria-label="Neighbourhood region"><button type="button" aria-pressed={!zone} onClick={() => setZone('')}>All neighbourhoods</button>{[...new Set(localities.map(l => l.zone))].map(value => <button type="button" key={value} aria-pressed={zone === value} onClick={() => setZone(value)}>{value}</button>)}</div><div className="discovery-result-row"><p role="status" aria-live="polite">{matches.length} {matches.length === 1 ? 'neighbourhood' : 'neighbourhoods'} · {matches.reduce((sum,l) => sum + localitySummary(l).homes.length,0)} listed projects</p>{(query||zone||type) && <button type="button" onClick={() => {setQuery('');setZone('');setType('');}}>Clear filters <X size={14}/></button>}</div>{matches.length ? <div className="neighbourhood-guide-grid">{matches.map(l => <LocalityPreviewCard locality={l} key={l.id}/>)}</div> : <div className="discovery-empty"><h3>No matching areas in our current catalogue.</h3><p>Reset the filters or tell us where you would like to look.</p><button type="button" className="btn outline" onClick={() => {setQuery('');setZone('');setType('');}}>Reset search</button></div>}<p className="neighbourhood-data-note">Counts cover Aaramv’s published catalogue. They do not represent the whole locality market.</p></section>
    <section className="discovery-checks"><h2>One city. Many ways to live.</h2><div>{[[TrainFront,'Your daily routes','Open the guide’s map links and check the trip from the exact project entrance.'],[House,'Your everyday essentials','Look at the schools, shops and services you actually use when you visit.'],[Building2,'Your home shortlist','Compare the layout, area basis, complete cost and project phase together.']].map(([Icon,title,copy]) => {const I=Icon as typeof House;return <article key={String(title)}><I size={24}/><h3>{String(title)}</h3><p>{String(copy)}</p></article>;})}</div></section></div>{closing}</main>;
}
