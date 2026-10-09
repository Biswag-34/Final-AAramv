'use client';

import {useEffect, useId, useState} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {ArrowRight, ArrowUpRight, Building2, Check, ChevronDown, ChevronLeft, ChevronRight, Compass, Heart, MapPin, Menu, Search, ShieldCheck, SlidersHorizontal, X, Images, Phone} from 'lucide-react';
import {Sheet, SheetContent, SheetDescription, SheetTitle} from '@/components/ui/sheet';
import {MapLink} from '@/components/catalog-content';
export {useResponsiveLayout} from '@/hooks/use-responsive-layout';
import {properties, localities, img} from './data';
import {bedroomLabel, filterProperties, formatArea, formatInr, normalizeSearch, propertyType, configurationSummary, type Property} from '@/lib/catalog';

import {BuyerComparison,NeighbourhoodAlbum,BuyingJourney} from '@/components/experience-sections';
import {EnquiryForm,type EnquiryFormProps} from '@/components/enquiry-form';
import {DeveloperCarousel} from '@/components/developer-carousel';
import {PropertyPrice} from '@/components/property-summary';

export type ResponsiveActions = {saved: string[]; toggle: (id: string) => void; enquire: (context: string, project?: string) => void};

function ResponsiveBrand() {
  return <Link href="/" className="r-brand" aria-label="Aaramv Realty home"><Building2 size={27} strokeWidth={1.5}/><span>aaramv<span className="r-brand-dot">.</span><small>REALTY</small></span></Link>;
}
export function ResponsiveHeader({saved, enquire}: ResponsiveActions) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 16);
    update();
    window.addEventListener('scroll', update, {passive: true});
    return () => window.removeEventListener('scroll', update);
  }, []);
  const routes = [['/properties', 'Properties'], ['/localities', 'Neighbourhoods'], ['/properties?saved=true', `Saved homes (${saved.length})`], ['/about', 'Our story'], ['/contact', 'Contact']];
  return <><header className={`r-header${path === '/' ? ' is-home' : ''}${scrolled ? ' is-scrolled' : ''}`}><ResponsiveBrand/><nav className="r-header-nav" aria-label="Main navigation">{[['/properties', 'Properties'], ['/localities', 'Localities'], ['/about', 'About']].map(([href, label]) => <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>{label}</Link>)}</nav><div className="r-header-actions"><Link className="r-icon r-header-saved" href="/properties?saved=true" aria-label={`Saved homes (${saved.length})`} title={`Saved homes (${saved.length})`}><Heart size={18}/></Link><button className="r-button r-primary r-enquire" onClick={() => enquire('Find my home')}>Enquire <ArrowUpRight size={15}/></button><button className="r-icon r-mobile-menu" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={23}/></button></div></header><Sheet open={open} onOpenChange={setOpen}><SheetContent className="r-menu"><SheetTitle>Your next chapter.</SheetTitle><SheetDescription>Find your place in Bengaluru.</SheetDescription><nav aria-label="Main navigation"><Link href="/" aria-current={path === '/' ? 'page' : undefined} onClick={() => setOpen(false)}>Home <ArrowUpRight size={18}/></Link>{routes.map(([href, label]) => <Link href={href} key={href} aria-current={path === href ? 'page' : undefined} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={18}/></Link>)}</nav><div className="r-menu-note"><MapPin size={17}/><span>Bengaluru homes.<br/>Personal guidance, all the way.</span></div></SheetContent></Sheet></>;
}
export function ResponsiveFooter() {
  return <footer className="r-footer"><div className="r-wrap"><ResponsiveBrand/><p>Thoughtfully chosen homes.<br/>Personally guided journeys.</p><div className="r-footer-nav"><div><h2>Find your place</h2><Link href="/properties">All properties</Link><Link href="/properties?status=Ready%20to%20move">Ready to move</Link><Link href="/localities">Neighbourhoods</Link></div><div><h2>Meet Aaramv</h2><Link href="/about">Our story</Link><Link href="/contact">Speak to an advisor</Link><Link href="/properties?saved=true">Saved homes</Link></div></div><div className="r-footer-bottom"><span>© 2026 Aaramv Realty · Bengaluru</span><div><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms & conditions</Link></div></div></div></footer>;
}

function SearchForm({initial = '', onSearch, hero = false}: {initial?: string; onSearch?: (query: string) => void; hero?: boolean}) {
  const router = useRouter();
  const [query, setQuery] = useState(initial);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const id = useId();
  useEffect(() => setQuery(initial), [initial]);
  const term = normalizeSearch(query);
  const options = term.length < 2 ? [] : [
    ...localities.filter(l => normalizeSearch(l.name).includes(term)).slice(0, 3).map(l => ({name: l.name, group: 'Neighbourhood'})),
    ...properties.filter(p => normalizeSearch(p.name).includes(term)).slice(0, 3).map(p => ({name: p.name, group: 'Project'})),
  ];
  function search(value: string) {
    setQuery(value); setFocused(false); setActive(-1);
    if (onSearch) onSearch(value);
    else router.push(`/properties${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  }
  return <form className={`r-search${hero ? ' r-search-hero' : ''}`} role="search" onSubmit={e => {e.preventDefault(); search(active >= 0 && options[active] ? options[active].name : query);}}>
    <div className="r-search-input"><MapPin size={18}/><input aria-label="Locality or project" placeholder="Locality or project" value={query} autoComplete="off" role="combobox" aria-autocomplete="list" aria-expanded={focused && options.length > 0} aria-controls={id} aria-activedescendant={active >= 0 ? `${id}-${active}` : undefined} onChange={e => {setQuery(e.target.value); setActive(-1);}} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onKeyDown={e => {if (e.key === 'ArrowDown' && options.length) {e.preventDefault(); setActive(i => (i + 1) % options.length);} if (e.key === 'ArrowUp' && options.length) {e.preventDefault(); setActive(i => (i + options.length - 1) % options.length);} if (e.key === 'Escape') {setFocused(false); setActive(-1);}}}/>{query && <button type="button" className="r-icon" aria-label="Clear search" onClick={() => {setQuery(''); setActive(-1);}}><X size={16}/></button>}</div>
    <button className="r-button r-primary"><Search size={17}/>{hero ? 'Search homes' : 'Search'}</button>
    {focused && options.length > 0 && <ul id={id} className="r-suggestions" role="listbox">{options.map((option, i) => <li id={`${id}-${i}`} key={`${option.group}-${option.name}`} role="option" aria-selected={i === active} onMouseDown={e => e.preventDefault()} onClick={() => search(option.name)}><span>{option.name}</span><small>{option.group}</small></li>)}</ul>}
  </form>;
}

export function configurationRange(p: Property) {return configurationSummary(p);}
function areaLabel(p: Property) {
  if (p.primary.areaSqFt === null) return 'Area on request';
  return `${formatArea(p.primary.areaSqFt)}${p.primary.areaBasis === 'unspecified' ? ' · area basis on request' : ` ${p.primary.areaBasis.replaceAll('-', ' ')} area`}`;
}
export function ResponsivePropertyCard({p, saved, toggle}: {p: Property} & Pick<ResponsiveActions, 'saved' | 'toggle'>) {
  const [message, setMessage] = useState('');
  const selected = saved.includes(p.id);
  function rememberResults() {
    if (window.location.pathname === '/properties') {
      try {sessionStorage.setItem(`aaramv-results:${window.location.search}`, String(window.scrollY));} catch {}
    }
  }
  return <article className="r-property"><div className="r-property-image"><Link href={`/properties/${p.id}`} onClick={rememberResults} aria-label={`View ${p.name}`}><img src={p.cover.src} alt={p.cover.alt} loading="lazy" width={640} height={400}/></Link><span className={`r-status${p.status === 'Ready to move' ? ' r-ready' : ''}`}>{p.status === 'Ready to move' && <Check size={13}/>} {p.status}</span><button className={`r-icon r-save${selected ? ' is-saved' : ''}`} aria-label={`${selected ? 'Unsave' : 'Save'} ${p.name}`} aria-pressed={selected} onClick={() => {toggle(p.id); setMessage(selected ? 'Removed from saved homes' : 'Added to saved homes');}}><Heart size={19} fill={selected ? 'currentColor' : 'none'}/></button></div><div className="r-property-body"><p className="r-location"><MapPin size={13}/>{p.locality}</p><Link href={`/properties/${p.id}`} onClick={rememberResults}><h3>{p.name}</h3></Link>{p.developerName && <p className="r-developer">By {p.developerName}</p>}<div className="r-property-specs"><strong title={configurationRange(p)}>{configurationRange(p)}</strong><span title={`${areaLabel(p)}${p.type !== 'Plot' ? ' · starting layout' : ''}`}>{formatArea(p.primary.areaSqFt)}</span></div><div className="r-property-price"><PropertyPrice p={p}/><Link href={`/properties/${p.id}`} onClick={rememberResults} className="r-details">View details <ArrowUpRight size={16}/></Link></div><span className="sr-only" role="status">{message}</span></div></article>;
}

function HomePropertyCarousel({homes, actions}: {homes: Property[]; actions: ResponsiveActions}) {
  const [viewport, api] = useEmblaCarousel({
    align: 'center', loop: homes.length > 1, containScroll: false,
    breakpoints: {'(min-width: 600px)': {active: false}},
  });
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!api) return;
    const select = () => setIndex(api.selectedScrollSnap());
    select();
    api.on('select', select).on('reInit', select);
    return () => {api.off('select', select).off('reInit', select);};
  }, [api]);

  if (!homes.length) return <p>No properties are currently listed in this collection.</p>;
  return <div className="r-home-carousel" role="region" aria-label="Homes worth a closer look">
    <div className="r-home-carousel-viewport" ref={viewport}>
      <div className="r-home-carousel-track">{homes.map((p, i) => <div className={`r-home-carousel-slide${i === index ? ' is-active' : ''}`} key={p.id} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${homes.length}`} onFocusCapture={() => api?.scrollTo(i)}><ResponsivePropertyCard p={p} {...actions}/></div>)}</div>
    </div>
    <div className="r-home-carousel-controls">
      <button className="r-icon" aria-label="Previous home" title="Previous home" disabled={homes.length < 2} onClick={() => api?.scrollPrev()}><ChevronLeft size={20}/></button>
      <span role="status" aria-live="polite">{index + 1} / {homes.length}</span>
      <button className="r-icon" aria-label="Next home" title="Next home" disabled={homes.length < 2} onClick={() => api?.scrollNext()}><ChevronRight size={20}/></button>
    </div>
  </div>;
}

function NeighbourhoodCard({l}: {l: typeof localities[number]}) {
  const matches = properties.filter(p => p.localityId === l.id);
  const projectImage = l.cover.kind !== 'locality' || properties.some(p => p.images.some(image => image.src === l.cover.src));
  return <Link className="r-neighbourhood" href={`/localities/${l.id}`}><div className="r-neighbourhood-photo"><img src={l.cover.src} alt={l.cover.alt} loading="lazy" width={480} height={320}/>{projectImage && <span>Project view</span>}</div><div className="r-neighbourhood-copy"><small>{l.zone}</small><h3>{l.name}</h3><p>{matches.length} listed {matches.length === 1 ? 'project' : 'projects'}</p><ArrowUpRight size={20}/></div></Link>;
}
export function ResponsiveHome(actions: ResponsiveActions) {
  const [type, setType] = useState('');
  const types = [['', 'All Prop.'], ['Apartment', 'Apartment'], ['Plot', 'Plots'], ['Villa', 'Villa']];
  const homes = filterProperties(properties, {type: type || undefined}).slice(0, 4);
  return <main className="r-home">
    <section className="r-hero"><img className="r-hero-image" src={img('villa')} alt="Contemporary home surrounded by greenery" fetchPriority="high" width={1440} height={960}/><div className="r-wrap r-hero-copy"><p className="r-kicker">BENGALURU HOMES. PERSONAL GUIDANCE.</p><h1>Find your<span className="heading-break"> </span><em>Bengaluru home.</em></h1><p>Thoughtfully chosen homes.<br/>A property partner who puts you first.</p><SearchForm hero/><div className="r-popular"><Link href="/properties?status=Ready%20to%20move">Ready to move <ArrowUpRight size={13}/></Link><Link href="/properties?q=Thanisandra">Thanisandra</Link><Link href="/properties?q=Bagalur">Bagalur</Link></div><button className="r-button advisor-call r-advisor-action" onClick={() => actions.enquire('Help me find my home')}><Phone size={17}/>Talk to an advisor</button></div></section>
    <section className="r-section r-collection"><div className="r-wrap"><div className="r-section-head"><div><p className="r-kicker">A PLACE FOR YOUR NEXT CHAPTER</p><h2>Homes worth a closer look.</h2></div><Link className="r-inline-link" href="/properties">View all <ArrowUpRight size={16}/></Link></div><div className="r-chips" aria-label="Property type">{types.map(([value, label]) => <button key={label} aria-pressed={type === value} onClick={() => setType(value)}>{label}</button>)}</div><HomePropertyCarousel key={type} homes={homes} actions={actions}/></div></section>
    <NeighbourhoodAlbum/>
    <BuyerComparison/>
    <section className="r-section r-developers"><div className="r-wrap"><div className="r-section-head"><div><p className="r-kicker">EXPLORE THE COLLECTION</p><h2>Find homes by developer.</h2></div></div><DeveloperCarousel/></div></section>
    <BuyingJourney/>
    <ResponsiveEnquirySection/>
  </main>;
}

export function ResponsiveLeadForm(props: EnquiryFormProps) {return <EnquiryForm {...props}/>;}
function ResponsiveEnquirySection() {
  return <section className="r-section r-enquiry-section"><div className="r-wrap r-enquiry-layout"><div className="cta-copy"><p className="r-kicker">YOUR NEXT CHAPTER STARTS HERE</p><h2>Good homes begin<br/>with a conversation.</h2><p>Tell us what matters to you.<br/>We’ll help you take the next step with clarity.</p></div><ResponsiveLeadForm/></div></section>;
}

type Filters = {locality: string; type: string; status: string; bedrooms: string; min: string; max: string};
const emptyFilters: Filters = {locality: '', type: '', status: '', bedrooms: '', min: '', max: ''};
function toFilters(f: Filters, query: string, savedIds?: string[], sort?: string) {
  return {query, type: f.type || undefined, status: f.status || undefined, localityId: f.locality || undefined, bedrooms: f.bedrooms === '' ? undefined : Number(f.bedrooms), minPriceInr: f.min === '' ? undefined : Number(f.min) * 10000000, maxPriceInr: f.max === '' ? undefined : Number(f.max) * 10000000, savedIds, sort};
}
export function ResponsiveListings(actions: ResponsiveActions) {
  const params = useSearchParams(), router = useRouter();
  const query = params.get('q') || '', onlySaved = params.get('saved') === 'true';
  const applied: Filters = {locality: params.get('locality') || '', type: propertyType(params.get('type') || ''), status: params.get('status') || '', bedrooms: params.get('bhk') || '', min: params.get('min') || '', max: params.get('budget') || ''};
  const [draft, setDraft] = useState(applied), [open, setOpen] = useState(false), [budgetError, setBudgetError] = useState('');
  const [sort, setSort] = useState(params.get('sort') || 'Recommended');
  const limit = Math.max(6, Math.min(properties.length, Number(params.get('limit')) || 6));
  const results = filterProperties(properties, toFilters(applied, query, onlySaved ? actions.saved : undefined, sort));
  const pending = filterProperties(properties, toFilters(draft, query, onlySaved ? actions.saved : undefined));
  const count = Object.values(applied).filter(v => v !== '').length;
  useEffect(() => setSort(params.get('sort') || 'Recommended'), [params]);
  useEffect(() => {
    if (!window.matchMedia('(max-width: 1199px)').matches) return;
    const key = `aaramv-results:${window.location.search}`;
    try {
      const position = sessionStorage.getItem(key);
      if (position === null) return;
      const frame = requestAnimationFrame(() => window.scrollTo({top: Number(position) || 0, behavior: 'instant'}));
      sessionStorage.removeItem(key);
      return () => cancelAnimationFrame(frame);
    } catch {}
  }, []);
  function update(filters: Filters, search = query, options: {sort?: string; limit?: number} = {}) {
    const next = new URLSearchParams();
    if (search) next.set('q', search);
    if (onlySaved) next.set('saved', 'true');
    if ((options.sort || sort) !== 'Recommended') next.set('sort', options.sort || sort);
    if (options.limit && options.limit > 6) next.set('limit', String(options.limit));
    const keys: Record<keyof Filters, string> = {locality: 'locality', type: 'type', status: 'status', bedrooms: 'bhk', min: 'min', max: 'budget'};
    (Object.keys(keys) as (keyof Filters)[]).forEach(key => {if (filters[key] !== '') next.set(keys[key], filters[key]);});
    router.replace(`/properties${next.size ? `?${next}` : ''}`, {scroll: false});
  }
  function applyFilters() {if (Number(draft.min) < 0 || Number(draft.max) < 0 || draft.min !== '' && draft.max !== '' && Number(draft.min) > Number(draft.max)) {setBudgetError('Enter a maximum budget above your minimum.'); return;} update(draft); setOpen(false);}
  useEffect(() => {if (!open) setDraft(applied);}, [params, open]);
  function setField(key: keyof Filters, value: string) {setDraft(f => ({...f, [key]: value, ...(key === 'type' && value === 'Plot' ? {bedrooms: ''} : {})})); setBudgetError('');}
  const filterFields = <div className="r-filter-fields"><label>Neighbourhood<select aria-label="Neighbourhood" value={draft.locality} onChange={e => setField('locality', e.target.value)}><option value="">All Bengaluru</option>{localities.map(l => <option value={l.id} key={l.id}>{l.name}</option>)}</select></label><fieldset><legend>Budget</legend><div className="r-budget-presets">{[['Under ₹1 Cr', '', '1'], ['₹1–2 Cr', '1', '2'], ['₹2–3 Cr', '2', '3'], ['₹3 Cr+', '3', '']].map(([label, min, max]) => <button type="button" key={label} aria-pressed={draft.min === min && draft.max === max} onClick={() => {setDraft(f => ({...f, min, max})); setBudgetError('');}}>{label}</button>)}</div><div className="r-budget-inputs"><label>Min (₹ Cr)<input type="number" inputMode="decimal" min="0" step="0.05" placeholder="No minimum" value={draft.min} onChange={e => setField('min', e.target.value)}/></label><label>Max (₹ Cr)<input type="number" inputMode="decimal" min="0" step="0.05" placeholder="No maximum" value={draft.max} onChange={e => setField('max', e.target.value)}/></label></div><p>Only projects with a matching priced layout appear when a budget is selected.</p>{budgetError && <p className="r-error" role="alert">{budgetError}</p>}</fieldset><label>Property type<select aria-label="Property type" value={draft.type} onChange={e => setField('type', e.target.value)}><option value="">All homes</option>{[...new Set(properties.map(p => p.type))].map(t => <option key={t}>{t}</option>)}</select></label>{draft.type !== 'Plot' && <label>Bedrooms<select aria-label="Bedrooms" value={draft.bedrooms} onChange={e => setField('bedrooms', e.target.value)}><option value="">Any configuration</option>{[...new Set(properties.flatMap(p => p.configurations.flatMap(c => c.bedrooms === null ? [] : [c.bedrooms])))].sort((a, b) => a - b).map(n => <option key={n} value={n}>{bedroomLabel(n, 'Apartment')}</option>)}</select><small>Matches any available layout in a project.</small></label>}<label>Project status<select aria-label="Project status" value={draft.status} onChange={e => setField('status', e.target.value)}><option value="">Any status</option>{[...new Set(properties.map(p => p.status))].map(t => <option key={t}>{t}</option>)}</select></label></div>;
  const labels: Record<keyof Filters, string> = {locality: localities.find(l => l.id === applied.locality)?.name || applied.locality, type: applied.type, status: applied.status, bedrooms: `${applied.bedrooms} BHK`, min: `From ${formatInr(Number(applied.min) * 10000000)}`, max: `Up to ${formatInr(Number(applied.max) * 10000000)}`};
  return <main className="r-page"><div className="r-wrap"><div className="r-page-head"><p className="r-kicker">YOUR BENGALURU SHORTLIST</p><h1>{onlySaved ? 'Your saved homes.' : 'Find a place to call home.'}</h1><p>{onlySaved ? 'A little closer to your next chapter.' : 'Explore homes around your life, budget and priorities.'}</p></div><SearchForm initial={query} onSearch={q => update(applied, q)}/><div className="r-results-layout"><aside className="r-filter-sidebar"><div className="r-filter-sidebar-head"><h3>Find your fit</h3><button type="button" onClick={() => {setDraft(emptyFilters); update(emptyFilters, query);}}>Reset all</button></div>{filterFields}<button className="r-button r-primary" type="button" onClick={applyFilters}>Show {pending.length} projects <ArrowRight size={16}/></button></aside><div className="r-results-body"><div className="r-results-controls"><button className="r-button r-secondary" onClick={() => {setDraft(applied); setBudgetError(''); setOpen(true);}}><SlidersHorizontal size={17}/>Filters{count > 0 && <span className="r-count">{count}</span>}</button><label>Sort<select aria-label="Sort" value={sort} onChange={e => {setSort(e.target.value); update(applied, query, {sort: e.target.value});}}><option>Recommended</option><option>Price: low to high</option><option>Price: high to low</option></select></label></div><div className="r-active-filters">{query && <button onClick={() => update(applied, '')}>“{query}” <X size={14}/></button>}{(Object.keys(applied) as (keyof Filters)[]).filter(k => applied[k] !== '').map(k => <button key={k} onClick={() => update({...applied, [k]: ''})} aria-label={`Remove ${labels[k]}`}>{labels[k]}<X size={14}/></button>)}{count > 0 && <button onClick={() => update(emptyFilters, '')}>Clear all</button>}</div><p className="r-result-count" role="status" aria-live="polite">{results.length} {results.length === 1 ? 'project' : 'projects'}{onlySaved ? ' saved' : ' to explore'}</p>{results.length ? <><div className="r-property-grid">{results.slice(0, limit).map(p => <ResponsivePropertyCard key={p.id} p={p} {...actions}/>)}</div>{limit < results.length && <button className="r-button r-secondary r-load-more" onClick={() => update(applied, query, {limit: limit + 6})}>Show more homes <ChevronDown size={17}/></button>}</> : <div className="r-empty"><Heart size={30}/><h2>{onlySaved && !actions.saved.length ? 'Your shortlist starts here.' : 'Let’s widen the search.'}</h2><p>{onlySaved && !actions.saved.length ? 'Save a home that catches your eye and find it here.' : 'Try another neighbourhood or a wider budget.'}</p>{onlySaved && !actions.saved.length ? <Link className="r-button r-primary" href="/properties">Explore homes <ArrowRight size={16}/></Link> : <button className="r-button r-primary" onClick={() => update(emptyFilters, '')}>Reset search <ArrowRight size={16}/></button>}</div>}</div></div></div>
    <Sheet open={open} onOpenChange={setOpen}><SheetContent side="right" className="r-filter-sheet"><div className="r-filter-head"><SheetTitle>Find your fit.</SheetTitle><SheetDescription>Refine your shortlist.</SheetDescription></div>{filterFields}<div className="r-filter-apply"><button className="r-button r-secondary" onClick={() => {setDraft(emptyFilters); setBudgetError('');}}>Reset</button><button className="r-button r-primary" onClick={applyFilters}>Show {pending.length} projects <ArrowRight size={16}/></button></div></SheetContent></Sheet>
    <ResponsiveEnquirySection/>
  </main>;
}

export function ResponsiveLocalities() {
  const [query, setQuery] = useState(''), [zone, setZone] = useState('');
  const matches = localities.filter(l => (!zone || l.zone === zone) && normalizeSearch(`${l.name} ${l.zone}`).includes(normalizeSearch(query)));
  return <main className="r-page"><div className="r-wrap"><div className="r-page-head r-localities-head"><p className="r-kicker">A CITY OF MANY BEGINNINGS</p><h1>Find your kind<span className="heading-break"> </span>of <em>Bengaluru.</em></h1><p>Close to work. Closer to what matters.<br/>Get to know the places behind the homes.</p><img src={img('bengaluru-skyline')} alt="Bengaluru skyline" width={1200} height={500}/></div><label className="r-locality-search"><Search size={18}/><input aria-label="Search neighbourhoods" placeholder="Find a neighbourhood" value={query} onChange={e => setQuery(e.target.value)}/></label><div className="r-chips"><button aria-pressed={!zone} onClick={() => setZone('')}>All Bengaluru</button>{[...new Set(localities.map(l => l.zone))].map(z => <button key={z} aria-pressed={zone === z} onClick={() => setZone(z)}>{z}</button>)}</div><p className="r-result-count" role="status">{matches.length} neighbourhoods</p><div className="r-neighbourhood-grid">{matches.map(l => <NeighbourhoodCard l={l} key={l.id}/>)}</div>{!matches.length && <div className="r-empty"><h2>No neighbourhoods found.</h2><button className="r-button r-secondary" onClick={() => {setQuery(''); setZone('');}}>Reset search</button></div>}</div><ResponsiveEnquirySection/></main>;
}

export function ResponsiveProjectSummary({p}: {p: Property}) {
  return <div className="r-project-summary"><div><span>Project configurations</span><strong>{configurationRange(p)}</strong></div><div><span>Starting layout</span><strong>{areaLabel(p)}</strong></div><div><span>Project status</span><strong>{p.status}</strong></div><div><span>Possession</span><strong>{p.possession.label}</strong></div>{p.primary.priceNote && <p>{p.primary.label}: {p.primary.priceNote}</p>}{p.updatedAt && <p>Information updated <time dateTime={p.updatedAt}>{new Date(`${p.updatedAt}T00:00:00`).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}</time></p>}<MapLink record={p}/></div>;
}
export function ResponsiveVisitAction({p, enquire}: {p: Property; enquire: ResponsiveActions['enquire']}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 440);
    update(); window.addEventListener('scroll', update, {passive: true});
    return () => window.removeEventListener('scroll', update);
  }, []);
  return visible ? <div className="r-visit-bar"><span>{p.name}</span><button className="r-button r-primary" onClick={() => enquire(`Plan a site visit: ${p.name}`, p.name)}>Plan a site visit <ArrowUpRight size={16}/></button></div> : null;
}
