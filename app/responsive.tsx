'use client';

import {useEffect, useId, useState} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import {Brand} from '@/components/brand';
import {useHeaderSurface} from '@/hooks/use-header-surface';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {ArrowRight, ArrowUpRight, Building2, Check, ChevronDown, ChevronLeft, ChevronRight, Compass, Heart, MapPin, Menu, Search, ShieldCheck, SlidersHorizontal, X, Images, Phone} from 'lucide-react';
import {Sheet, SheetContent, SheetDescription, SheetTitle} from '@/components/ui/sheet';
import {MapLink} from '@/components/catalog-content';
export {useResponsiveLayout} from '@/hooks/use-responsive-layout';
import {properties, localities, img} from './data';
import {bedroomLabel, filterProperties, formatArea, formatInr, normalizeSearch, propertyType, configurationSummary, propertyHref, possessionDate, type Property} from '@/lib/catalog';

import {BuyerComparison,ServiceSupport,NeighbourhoodAlbum,BuyingJourney} from '@/components/experience-sections';
import {EnquiryForm,type EnquiryFormProps} from '@/components/enquiry-form';
import {DeveloperCarousel} from '@/components/developer-carousel';
import {CataloguePropertyCard} from '@/components/property-card';
import {HeroSearch} from '@/components/hero-search';
import {FooterBusinessDetails} from '@/components/company-details';

export type ResponsiveActions = {saved: string[]; toggle: (id: string) => void; enquire: (context: string, project?: string) => void};

function ResponsiveBrand() {
  return <Brand className="r-brand"/>;
}
export function ResponsiveHeader({saved, enquire}: ResponsiveActions) {
  const path = usePathname();
  const onHero=useHeaderSurface(path);
  const [open, setOpen] = useState(false);
  const routes = [['/properties', 'Properties'], ['/localities', 'Neighbourhoods'], ['/properties?saved=true', `Saved homes (${saved.length})`], ['/about', 'Our story'], ['/contact', 'Contact']];
  return <><header className={`r-header${path === '/' ? ' is-home' : ''}${onHero?' is-over-hero':' is-scrolled surface-solid'}`}><ResponsiveBrand/><nav className="r-header-nav" aria-label="Main navigation">{[['/properties', 'Properties'], ['/localities', 'Localities'], ['/about', 'About']].map(([href, label]) => <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>{label}</Link>)}</nav><div className="r-header-actions"><Link className="r-icon r-header-saved" href="/properties?saved=true" aria-label={`Saved homes (${saved.length})`} title={`Saved homes (${saved.length})`}><Heart size={18}/></Link><button className="r-button r-primary r-enquire" onClick={() => enquire('Build my shortlist')}>Build my shortlist <ArrowUpRight size={15}/></button><button className="r-icon r-mobile-menu" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={23}/></button></div></header><Sheet open={open} onOpenChange={setOpen}><SheetContent className="r-menu"><SheetTitle>Your next chapter.</SheetTitle><SheetDescription>Find your place in Bengaluru.</SheetDescription><nav aria-label="Main navigation"><Link href="/" aria-current={path === '/' ? 'page' : undefined} onClick={() => setOpen(false)}>Home <ArrowUpRight size={18}/></Link>{routes.map(([href, label]) => <Link href={href} key={href} aria-current={path === href ? 'page' : undefined} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={18}/></Link>)}</nav><div className="r-menu-note"><MapPin size={17}/><span>Bengaluru homes.<br/>Personal guidance, all the way.</span></div></SheetContent></Sheet></>;
}
export function ResponsiveFooter() {
  return <footer className="r-footer"><div className="r-wrap"><ResponsiveBrand/><p>Buyer-first property guidance in Bengaluru.<br/>A researched shortlist and support through move-in.</p><FooterBusinessDetails/><div className="r-footer-nav"><div><h2>Find your place</h2><Link href="/properties">All properties</Link><Link href="/properties?status=Ready%20to%20move">Ready to move</Link><Link href="/localities">Neighbourhoods</Link></div><div><h2>Meet Aaramv</h2><Link href="/about">Our story</Link><Link href="/contact">Speak to an advisor</Link><Link href="/properties?saved=true">Saved homes</Link></div></div><div className="r-footer-bottom"><span>© 2026 Aaramv Realty · Bengaluru</span><div><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms & conditions</Link></div></div></div></footer>;
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

export function ResponsivePropertyCard({p,saved,toggle,enquire,home=false}: {p:Property;home?:boolean;enquire?:ResponsiveActions['enquire']}&Pick<ResponsiveActions,'saved'|'toggle'>) {
  return <CataloguePropertyCard p={p} home={home} responsive saved={saved.includes(p.id)} onSave={()=>toggle(p.id)} onEnquire={(context,project)=>enquire?.(context,project)}/>;
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

export function ResponsiveHome(actions:ResponsiveActions) {
  const [type,setType]=useState('');
  const types=[['','All homes'],['Apartment','Apartments'],['Plot','Plots'],['Villa','Villas']];
  const homes=filterProperties(properties,{type:type||undefined}).slice(0,3);
  return <main className="r-home"><section className="r-hero"><img className="r-hero-image" src="/images/aaramv-buyer-first-hero.png" alt="Illustrative scene of a homebuyer and advisor comparing apartment layouts at a table." fetchPriority="high" width={1774} height={887}/><div className="r-wrap r-hero-copy"><p className="r-kicker">BENGALURU REAL ESTATE CHANNEL PARTNER</p><h1>Your next home should<span className="heading-break"> </span><em>fit your life.</em></h1><p>Share your budget, everyday routes and must-haves. We research suitable options, explain the trade-offs and support you through move-in.</p><HeroSearch/><div className="hero-actions r-hero-actions"><Link className="btn lime" href="/properties">Browse homes<ArrowUpRight size={16}/></Link><button className="r-button advisor-call" onClick={()=>actions.enquire('Build my shortlist')}><Phone size={17}/>Build my shortlist</button></div><div className="r-popular"><Link href="/properties?status=Ready%20to%20move">Ready to move<ArrowUpRight size={13}/></Link><Link href="/properties?q=Thanisandra">Thanisandra</Link><Link href="/properties?q=Bagalur">Bagalur</Link></div></div></section><BuyerComparison onEnquire={()=>actions.enquire('Tell us what you need')}/><ServiceSupport/><section className="r-section r-collection"><div className="r-wrap"><div className="r-section-head"><div><p className="r-kicker">A PLACE FOR YOUR NEXT CHAPTER</p><h2>Homes to compare. Reasons to look closer.</h2></div><Link className="r-inline-link" href="/properties">View all properties<ArrowUpRight size={16}/></Link></div><div className="r-chips" aria-label="Property type">{types.map(([value,label])=><button key={label} aria-pressed={type===value} onClick={()=>setType(value)}>{label}</button>)}</div><div className="r-property-grid">{homes.map(p=><ResponsivePropertyCard key={p.id} p={p} home {...actions}/>)}</div></div></section><NeighbourhoodAlbum/><BuyingJourney/><section className="r-section r-developers"><div className="r-wrap"><div className="r-section-head"><h2>Browse projects by developer.</h2></div><p className="developer-disclosure">Explore the developers represented in our current catalogue.</p><DeveloperCarousel/></div></section><ResponsiveEnquirySection/></main>;
}
export function ResponsiveLeadForm(props: EnquiryFormProps) {return <EnquiryForm {...props}/>;}
function ResponsiveEnquirySection() {
  return <section className="r-section r-enquiry-section"><div className="r-wrap r-enquiry-layout"><div className="cta-copy"><p className="r-kicker">YOUR NEXT CHAPTER STARTS HERE</p><h2>Tell us what your next home<br/>needs to do.</h2><p>Your budget, preferred area and must-haves<br/>give us a useful place to start.</p></div><ResponsiveLeadForm/></div></section>;
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
  const filterFields = <div className="r-filter-fields"><label>Neighbourhood<select aria-label="Neighbourhood" value={draft.locality} onChange={e => setField('locality', e.target.value)}><option value="">Any locality</option>{localities.map(l => <option value={l.id} key={l.id}>{l.name}</option>)}</select></label><fieldset><legend>Budget</legend><div className="r-budget-presets">{[['Under ₹1 Cr', '', '1'], ['₹1–2 Cr', '1', '2'], ['₹2–3 Cr', '2', '3'], ['₹3 Cr+', '3', '']].map(([label, min, max]) => <button type="button" key={label} aria-pressed={draft.min === min && draft.max === max} onClick={() => {setDraft(f => ({...f, min, max})); setBudgetError('');}}>{label}</button>)}</div><div className="r-budget-inputs"><label>Min (₹ Cr)<input type="number" inputMode="decimal" min="0" step="0.05" placeholder="No minimum" value={draft.min} onChange={e => setField('min', e.target.value)}/></label><label>Max (₹ Cr)<input type="number" inputMode="decimal" min="0" step="0.05" placeholder="No maximum" value={draft.max} onChange={e => setField('max', e.target.value)}/></label></div><p>Only projects with a matching priced layout appear when a budget is selected.</p>{budgetError && <p className="r-error" role="alert">{budgetError}</p>}</fieldset><label>Property type<select aria-label="Property type" value={draft.type} onChange={e => setField('type', e.target.value)}><option value="">All homes</option>{[...new Set(properties.map(p => p.type))].map(t => <option key={t}>{t}</option>)}</select></label>{draft.type !== 'Plot' && <label>Bedrooms<select aria-label="Bedrooms" value={draft.bedrooms} onChange={e => setField('bedrooms', e.target.value)}><option value="">Any configuration</option>{[...new Set(properties.flatMap(p => p.configurations.flatMap(c => c.bedrooms === null ? [] : [c.bedrooms])))].sort((a, b) => a - b).map(n => <option key={n} value={n}>{bedroomLabel(n, 'Apartment')}</option>)}</select><small>Matches any available layout in a project.</small></label>}<label>Project status<select aria-label="Project status" value={draft.status} onChange={e => setField('status', e.target.value)}><option value="">Any status</option>{[...new Set(properties.map(p => p.status))].map(t => <option key={t}>{t}</option>)}</select></label></div>;
  const labels: Record<keyof Filters, string> = {locality: localities.find(l => l.id === applied.locality)?.name || applied.locality, type: applied.type, status: applied.status, bedrooms: `${applied.bedrooms} BHK`, min: `From ${formatInr(Number(applied.min) * 10000000)}`, max: `Up to ${formatInr(Number(applied.max) * 10000000)}`};
  return <main className="r-page"><div className="r-wrap"><div className="r-page-head"><p className="r-kicker">YOUR BENGALURU SHORTLIST</p><h1>{onlySaved ? 'Your saved homes' : 'Compare homes around your priorities.'}</h1><p>{onlySaved ? 'Saved on this browser and device.' : 'Filter the catalogue by area, home type and budget. Review each option, then ask for the current details that matter to your shortlist.'}</p></div><SearchForm initial={query} onSearch={q => update(applied, q)}/><div className="r-results-layout"><aside className="r-filter-sidebar"><div className="r-filter-sidebar-head"><h3>Find your fit</h3><button type="button" onClick={() => {setDraft(emptyFilters); update(emptyFilters, query);}}>Reset filters</button></div>{filterFields}<button className="r-button r-primary" type="button" onClick={applyFilters}>Show {pending.length} projects <ArrowRight size={16}/></button></aside><div className="r-results-body"><div className="catalogue-results-toolbar"><div className="r-results-controls"><button className="r-button r-secondary" onClick={() => {setDraft(applied); setBudgetError(''); setOpen(true);}}><SlidersHorizontal size={17}/>Filters{count > 0 && <span className="r-count">{count}</span>}</button><label>Sort<select aria-label="Sort" value={sort} onChange={e => {setSort(e.target.value); update(applied, query, {sort: e.target.value});}}><option>Recommended</option><option>Price: low to high</option><option>Price: high to low</option></select></label></div><div className="r-active-filters">{query && <button onClick={() => update(applied, '')}>“{query}” <X size={14}/></button>}{(Object.keys(applied) as (keyof Filters)[]).filter(k => applied[k] !== '').map(k => <button key={k} onClick={() => update({...applied, [k]: ''})} aria-label={`Remove ${labels[k]}`}>{labels[k]}<X size={14}/></button>)}{count > 0 && <button onClick={() => update(emptyFilters, '')}>Clear all</button>}</div><p className="r-result-count" role="status" aria-live="polite">{results.length} matching catalogue entries</p></div>{results.length ? <><div className="r-property-grid">{results.slice(0, limit).map(p => <ResponsivePropertyCard key={p.id} p={p} {...actions}/>)}</div>{limit < results.length && <button className="r-button r-secondary r-load-more" onClick={() => update(applied, query, {limit: limit + 6})}>Show more homes <ChevronDown size={17}/></button>}</> : <div className="r-empty"><Heart size={30}/><h2>{onlySaved && !actions.saved.length ? 'Your saved homes' : 'No matching homes'}</h2><p>{onlySaved && !actions.saved.length ? 'Save homes with the heart icon to compare them later.' : 'No matching homes in our current catalogue. Try a nearby area or share your brief with us.'}</p>{onlySaved && !actions.saved.length ? <Link className="r-button r-primary" href="/properties">Browse homes <ArrowRight size={16}/></Link> : <button className="r-button r-primary" onClick={() => update(emptyFilters, '')}>Reset filters <ArrowRight size={16}/></button>}</div>}</div></div></div>
    <Sheet open={open} onOpenChange={setOpen}><SheetContent side="right" className="r-filter-sheet"><div className="r-filter-head"><SheetTitle>Find your fit.</SheetTitle><SheetDescription>Refine your shortlist.</SheetDescription></div>{filterFields}<div className="r-filter-apply"><button className="r-button r-secondary" onClick={() => {setDraft(emptyFilters); setBudgetError('');}}>Reset</button><button className="r-button r-primary" onClick={applyFilters}>Show {pending.length} projects <ArrowRight size={16}/></button></div></SheetContent></Sheet>
    <ResponsiveEnquirySection/>
  </main>;
}

export function ResponsiveProjectSummary({p}: {p: Property}) {
  return <div className="r-project-summary"><div><span>Configuration</span><strong>{configurationRange(p)}</strong></div><div><span>Area</span><strong>{areaLabel(p)}</strong></div><div><span>Project status</span><strong>{p.status}</strong></div><div><span>Possession</span><strong>{p.possession.label}</strong></div></div>;
}
export function ResponsiveVisitAction({p, enquire}: {p: Property; enquire: ResponsiveActions['enquire']}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 440);
    update(); window.addEventListener('scroll', update, {passive: true});
    return () => window.removeEventListener('scroll', update);
  }, []);
  return visible ? <div className="r-visit-bar"><span>{p.name}</span><button className="r-button r-primary" onClick={() => enquire(`Request a site visit: ${p.name}`, p.name)}>Request a site visit <ArrowUpRight size={16}/></button></div> : null;
}
