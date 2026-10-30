'use client';
import {EditorialHeading,EditorialText} from '@/components/editorial-heading';

import {createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode} from 'react';
import Link from 'next/link';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {ArrowRight, ArrowUpRight, Heart, X, Share2, Scale, Clock, Plus, Check} from 'lucide-react';
import {toast} from 'sonner';
import {Sheet, SheetContent, SheetTitle, SheetDescription} from '@/components/ui/sheet';
import {properties} from '@/app/data';
import {configurationSummary, propertyHref, propertyPriceSummary, projectLandArea, projectUnitCount, type Property} from '@/lib/catalog';
import {possessionDisplay} from '@/lib/catalog';
import {trackEngagement} from '@/lib/engagement';
import {areaRange, validSelection, comparisonUnitRates, type DecisionFilters} from '@/lib/buyer-tools';

const ids = properties.map(p => p.id);
type Tools = {saved: string[]; toggleSaved: (id: string) => void; compare: string[]; toggleCompare: (id: string) => void; recent: string[]; notes: Record<string, string>; setNote: (id: string, note: string) => void; openShortlist: () => void; ready: boolean};
const BuyerContext = createContext<Tools>({saved: [], toggleSaved: () => {}, compare: [], toggleCompare: () => {}, recent: [], notes: {}, setNote: () => {}, openShortlist: () => {}, ready: false});
export const useBuyerTools = () => useContext(BuyerContext);

export function BuyerToolsProvider({children, saved, toggleSaved}: {children: ReactNode; saved: string[]; toggleSaved: (id: string) => void}) {
  const path = usePathname();
  const [compare, setCompare] = useState<string[]>([]), [recent, setRecent] = useState<string[]>([]), [notes, setNotes] = useState<Record<string, string>>({}), [open, setOpen] = useState(false), [ready, setReady] = useState(false);
  const compareRef = useRef<string[]>([]);
  useEffect(() => {
    const sync = () => {
      try {
        compareRef.current = validSelection(localStorage.getItem('aaramv-compare'), ids);
        setCompare(compareRef.current);
        setRecent(validSelection(localStorage.getItem('aaramv-recent'), ids, 8));
        const raw: unknown = JSON.parse(localStorage.getItem('aaramv-notes') || '{}');
        if (raw && typeof raw === 'object' && !Array.isArray(raw)) setNotes(Object.fromEntries(Object.entries(raw).filter(([id, value]) => ids.includes(id) && typeof value === 'string').map(([id, value]) => [id, String(value).slice(0, 1000)])));
      } catch {}
      setReady(true);
    };
    sync();
    try {const last = Number(localStorage.getItem('aaramv-last-visit') || 0);if (last && Date.now() - last > 30 * 60 * 1000 && Date.now() - last < 30 * 86400000) trackEngagement('return_visit');localStorage.setItem('aaramv-last-visit', String(Date.now()));} catch {}
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  useEffect(() => {
    setOpen(false);
    const id = path.split('/')[1] === 'properties' ? path.split('/')[2] : '';
    if (!ready) return;
    if (path === '/properties') trackEngagement('results_view');
    if (path === '/compare') trackEngagement('compare_view');
    if (!ids.includes(id)) return;
    trackEngagement('project_view', id);
    setRecent(previous => {
      const next = [id, ...previous.filter(value => value !== id)].slice(0, 8);
      try {localStorage.setItem('aaramv-recent', JSON.stringify(next));} catch {}
      return next;
    });
  }, [path, ready]);
  useEffect(() => {document.body.classList.toggle('has-compare-tray',compare.length > 0 && path !== '/compare');return () => document.body.classList.remove('has-compare-tray');},[compare.length,path]);
  const toggleCompare = useCallback((id: string) => {
    if (!ids.includes(id)) return;
    const current = compareRef.current;
    if (!current.includes(id) && current.length === 4) {toast.info('Compare up to four homes', {description: 'Remove a home from the comparison bar to add another.'}); return;}
    const next = current.includes(id) ? current.filter(value => value !== id) : [...current, id];
    compareRef.current = next; setCompare(next);if (next.includes(id)) trackEngagement('compare_select', id);
    try {localStorage.setItem('aaramv-compare', JSON.stringify(next));} catch {}
  }, []);
  function setNote(id: string, note: string) {
    if (!ids.includes(id)) return;
    setNotes(previous => {const next = {...previous, [id]: note.slice(0, 1000)}; try {localStorage.setItem('aaramv-notes', JSON.stringify(next));} catch {} return next;});
  }
  const saveAndTrack = (id: string) => {if (!saved.includes(id)) trackEngagement('save', id);toggleSaved(id);};
  const value = {saved, toggleSaved: saveAndTrack, compare, toggleCompare, recent, notes, setNote, openShortlist: () => setOpen(true), ready};
  return <BuyerContext.Provider value={value}>{children}<Sheet open={open} onOpenChange={setOpen}><SheetContent className="shortlist-drawer"><SheetTitle><EditorialText>Saved homes ({saved.length})</EditorialText></SheetTitle><SheetDescription>Your favourites and notes stay in this browser on this device.</SheetDescription><div className="shortlist-drawer-body">{saved.length ? saved.map(id => <ShortlistItem key={id} p={properties.find(p => p.id === id)!}/>) : <div className="buyer-empty"><Heart size={32}/><EditorialHeading as="h3">Make room for your favourites.</EditorialHeading><p>Use the heart on any project to save it here.</p><Link className="btn primary" href="/properties" onClick={() => setOpen(false)}>Explore homes <ArrowRight size={16}/></Link></div>}</div><div className="shortlist-drawer-foot"><Link className="btn primary full" href="/shortlist" onClick={() => setOpen(false)}>View saved homes & notes <ArrowRight size={16}/></Link>{compare.length > 0 && <Link className="btn outline full" href="/compare" onClick={() => setOpen(false)}>Compare selected ({compare.length})</Link>}</div></SheetContent></Sheet>{compare.length > 0 && path !== '/compare' && <div className="buyer-compare-bar" role="region" aria-label="Selected properties for comparison"><div className="compare-bar-homes">{compare.map(id => {const p = properties.find(p => p.id === id)!;return <div key={id}><img src={p.cover.src} alt={p.name}/><button type="button" aria-label={`Remove ${p.name} from comparison`} onClick={() => toggleCompare(id)}><X size={12}/></button></div>;})}</div><span><strong>{compare.length} of 4 selected</strong><small>Compare your possibilities</small></span><Link href="/compare" className="btn primary">Compare <ArrowRight size={17}/></Link><button type="button" className="compare-clear" onClick={() => {compareRef.current = [];setCompare([]);try {localStorage.setItem('aaramv-compare', '[]');} catch {}}} aria-label="Clear comparison"><X size={17}/></button></div>}</BuyerContext.Provider>;
}

export function ShortlistButton({className}: {className?: string}) {const tools=useBuyerTools();return <button type="button" className={`${className||'circle header-saved'} saved-icon-button`} aria-label={`Open saved homes (${tools.saved.length})`} title={`Saved homes (${tools.saved.length})`} onClick={tools.openShortlist}><Heart size={20}/>{tools.saved.length>0&&<span className="saved-icon-count">{tools.saved.length}</span>}</button>;}
export function BackToResults() {
  const [href, setHref] = useState('/properties');
  useEffect(() => {try {const previous = sessionStorage.getItem('aaramv-last-results');if (previous && /^\/properties(?:\?|$)/.test(previous)) setHref(previous);} catch {}}, []);
  return <Link href={href} className="text-link back-to-results">← Back to results</Link>;
}
export function CompareControl({p}: {p: Property}) {const tools = useBuyerTools();return <label className="project-compare-control"><input type="checkbox" checked={tools.compare.includes(p.id)} onChange={() => tools.toggleCompare(p.id)} aria-label={`Compare ${p.name}`}/><Scale size={14}/>Compare</label>;}

function ShortlistItem({p, withNotes = false}: {p: Property; withNotes?: boolean}) {
  const tools = useBuyerTools();
  return <article className="shortlist-item"><div className="shortlist-item-top"><Link href={propertyHref(p)}><img src={p.cover.src} alt={p.cover.alt}/></Link><div><EditorialHeading preserve as="h3"><Link href={propertyHref(p)}>{p.name}</Link></EditorialHeading><p>{p.locality}</p><strong>{propertyPriceSummary(p).label}</strong></div><button type="button" className="circle" aria-label={`Unsave ${p.name}`} onClick={() => tools.toggleSaved(p.id)}><Heart size={17} fill="currentColor"/></button></div><CompareControl p={p}/>{withNotes && <label className="buyer-note">My notes<textarea maxLength={1000} rows={3} placeholder="What you liked, questions to ask, details to revisit…" value={tools.notes[p.id] || ''} onChange={e => tools.setNote(p.id, e.target.value)}/><small>Private to this browser. Notes are excluded from shared links.</small></label>}</article>;
}

async function shareSelection(route: string, selection: string[]) {
  if (!selection.length) return;
  const url = new URL(route, window.location.origin);url.searchParams.set('ids', selection.join(','));
  try {await navigator.clipboard.writeText(url.toString());toast.success('Link copied', {description: 'Only the selected projects are shared. Your notes stay private.'});}
  catch {toast.info('Copy this link to share', {description: url.toString(), duration: 20000});}
}

export function ShortlistPage() {
  const tools = useBuyerTools(), params = useSearchParams();
  const shared = params.has('ids');
  const selection = shared ? validSelection(JSON.stringify((params.get('ids') || '').split(',')), ids, ids.length) : tools.saved;
  return <main className="inner buyer-page"><div className="wrap"><div className="inner-head"><div className="eyebrow">Your research, kept together</div><EditorialHeading as="h1">{shared ? 'A shortlist to explore together.' : 'Your next home, one shortlist.'}</EditorialHeading><p>{shared ? 'Explore these projects and save the homes you like to your own shortlist.' : 'Keep favourites, add personal notes and compare the details before your next visit.'}</p></div><div className="buyer-toolbar"><Link className="text-link" href="/properties"><Plus size={17}/>Explore more homes</Link>{selection.length > 0 && <button className="btn outline small" onClick={() => shareSelection('/shortlist', selection)}><Share2 size={16}/>Share shortlist</button>}<Link className="btn primary small" href="/compare"><Scale size={17}/>Compare ({tools.compare.length})</Link></div>{!tools.ready && !shared ? <p role="status">Loading your shortlist…</p> : selection.length ? <div className="shortlist-grid">{selection.map(id => {const p = properties.find(p => p.id === id)!;return shared ? <article className="shortlist-item" key={id}><img className="shared-project-image" src={p.cover.src} alt={p.cover.alt}/><EditorialHeading preserve as="h2"><Link href={propertyHref(p)}>{p.name}</Link></EditorialHeading><p>{p.locality} · {propertyPriceSummary(p).label}</p><div className="buyer-toolbar"><button className="btn outline small" onClick={() => tools.toggleSaved(id)}>{tools.saved.includes(id) ? <Check size={16}/> : <Heart size={16}/>} {tools.saved.includes(id) ? 'Saved' : 'Save home'}</button><CompareControl p={p}/><Link href={propertyHref(p)} className="text-link">View project <ArrowUpRight size={15}/></Link></div></article> : <ShortlistItem key={id} p={p} withNotes/>;})}</div> : <div className="buyer-empty"><Heart size={36}/><EditorialHeading as="h2">Your favourites belong here.</EditorialHeading><p>Save a project using its heart icon, then return to add notes and compare.</p><Link className="btn primary" href="/properties">Find a home to save <ArrowRight size={16}/></Link></div>}<RecentlyViewed/></div></main>;
}

export function ComparePage({onEnquire}: {onEnquire: (context: string, project?: string) => void}) {
  const tools = useBuyerTools(), params = useSearchParams(), router = useRouter();
  const shared = params.has('ids');
  const selection = shared ? validSelection(JSON.stringify((params.get('ids') || '').split(',')), ids) : tools.compare;
  const projects = selection.map(id => properties.find(p => p.id === id)!);
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  function remove(id: string) {if (shared) router.replace(`/compare?ids=${selection.filter(value => value !== id).join(',')}`, {scroll: false});else tools.toggleCompare(id);}
  function buildingData(p:Property){
    const count=projectUnitCount(p);
    const tower=p.projectScale?.towerCount??p.facts.find(f=>/^(?:residential towers|towers|tower count|total towers|blocks)/i.test(f.label))?.value;
    return [
      ['Towers / blocks',p.type==='Plot'?'Not applicable':tower==null?'On request':typeof tower==='number'?tower.toLocaleString('en-IN'):String(tower)],
      ['Floors',p.projectScale?.floorArrangement||String(p.facts.find(f=>/floor/i.test(f.label))?.value||'On request')],
      [p.type==='Plot'?'Plots':'Homes',count==null?'On request':count.toLocaleString('en-IN')],
      ['Land area',projectLandArea(p)],
    ];
  }
  const rows:{label:string;values:string[];render?:(p:Property)=>ReactNode}[]=[
    {label:'Name',values:projects.map(p=>p.name)},
    {label:'Developer',values:projects.map(p=>p.developerName||'On request')},
    {label:'Address (neighbourhood)',values:projects.map(p=>[p.address,p.postalCode,p.locality,p.zone,p.city].filter(Boolean).join(', ')),render:p=><div className="comparison-address"><span>{p.address||'Address on request'}{p.postalCode&&` · ${p.postalCode}`}</span><small>{[p.locality,p.zone,p.city].filter(Boolean).join(' · ')}</small></div>},
    {label:'Avg. price per sq ft',values:projects.map(p=>comparisonUnitRates(p).map(r=>`${r.amount}:${r.basis}`).join('|')||'On request'),render:p=>{const rates=comparisonUnitRates(p);return rates.length?<div className="comparison-unit-rates">{rates.map(rate=><div className="comparison-unit-rate" key={rate.basis}><strong>₹{rate.amount.toLocaleString('en-IN')} / sq ft</strong><small>{rate.basis.replaceAll('-',' ')} · {rate.count} priced {rate.count===1?'layout':'layouts'}</small></div>)}</div>:'On request';}},
    {label:'Configurations available',values:projects.map(configurationSummary)},
    {label:'Floor & building data',values:projects.map(p=>buildingData(p).map(([key,value])=>`${key}: ${value}`).join(' · ')),render:p=><dl className="comparison-building-data">{buildingData(p).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>},
    {label:'Status',values:projects.map(p=>p.status)},
    {label:'Top 5 amenities',values:projects.map(p=>p.amenities.map(a=>a.title).join(' · ')),render:p=><>{p.amenities.length?<><ul className="comparison-amenities">{p.amenities.slice(0,5).map((amenity,index)=><li key={index}><Check size={13}/><span>{amenity.title}</span></li>)}</ul>{p.amenities.length>5&&<Link className="comparison-more-amenities" href={`${propertyHref(p)}#amenities`}>+{p.amenities.length-5} more</Link>}<span className="comparison-amenities-total">{p.amenities.length} listed in total</span></>:'On request'}</>},
  ];
  return <main className="inner buyer-page"><div className="wrap"><div className="inner-head"><div className="eyebrow">Clarity beside every choice</div><EditorialHeading as="h1">Compare homes.</EditorialHeading><p>Bring up to four projects into one view. Compare prices, layouts, location and lifestyle together.</p></div><div className="buyer-toolbar"><Link className="text-link" href="/properties"><Plus size={17}/>Add a property</Link><Link className="text-link" href="/shortlist">My shortlist <Heart size={16}/></Link>{projects.length > 0 && <button className="btn outline small" onClick={() => shareSelection('/compare', selection)}><Share2 size={16}/>Share comparison</button>}<label className="project-compare-control"><input type="checkbox" checked={onlyDifferences} onChange={e => setOnlyDifferences(e.target.checked)}/>Show differences only</label></div>{!tools.ready && !shared ? <p role="status">Loading your comparison…</p> : projects.length ? <><p className="comparison-qualification">Average rates use listed starting prices and exact layout sizes. Different area bases are shown separately; layouts without a matched price and size are excluded.</p><p className="buyer-table-help">{projects.length} of 4 homes · {projects.length < 2 ? 'Add another home for a side-by-side comparison.' : 'Scroll across to see every selected home.'}</p><div className="comparison-scroll" tabIndex={0} role="region" aria-label="Property comparison"><table className="project-comparison-table" data-project-count={projects.length}><caption className="sr-only">Compare {projects.map(p => p.name).join(', ')}</caption><thead><tr><th scope="col">Your priorities</th>{projects.map(p => <th key={p.id} scope="col"><div className="comparison-home"><button className="circle" aria-label={`Remove ${p.name} from table`} onClick={() => remove(p.id)}><X size={15}/></button><Link href={propertyHref(p)}><img src={p.cover.src} alt={p.cover.alt}/><strong>{p.name}</strong></Link><span>{p.locality}</span></div></th>)}</tr></thead><tbody>{rows.filter(row => !onlyDifferences || new Set(row.values).size > 1).map(row => <tr key={row.label}><th scope="row">{row.label}</th>{row.values.map((value, i) => <td key={projects[i].id}>{row.render?row.render(projects[i]):value}</td>)}</tr>)}<tr><th scope="row">Next step</th>{projects.map(p => <td key={p.id}><Link className="text-link" href={propertyHref(p)}>View project <ArrowUpRight size={15}/></Link><button className="btn primary small" onClick={() => onEnquire(`Request cost sheet: ${p.name}`, p.name)}>Request cost sheet</button></td>)}</tr></tbody></table></div><div className="buyer-next-step"><EditorialHeading as="h2">Which home works for your day?</EditorialHeading><p>Bring your work route, preferred layout and budget into the conversation.</p><button className="btn primary" onClick={() => onEnquire(`Discuss my comparison: ${projects.map(p => p.name).join(', ')}`)}>Discuss this comparison <ArrowRight size={16}/></button></div></> : <div className="buyer-empty"><Scale size={36}/><EditorialHeading as="h2">A clearer decision starts with two homes.</EditorialHeading><p>Select “Compare” on a project card to build your comparison.</p><Link className="btn primary" href="/properties">Choose homes to compare <ArrowRight size={16}/></Link></div>}</div></main>;
}

export function RecentlyViewed({exclude}: {exclude?: string}) {
  const tools = useBuyerTools();
  const items = tools.recent.filter(id => id !== exclude).slice(0, 4).map(id => properties.find(p => p.id === id)!);
  return items.length ? <section className="recent-projects"><div className="section-head"><EditorialHeading as="h2"><Clock size={22}/>Recently viewed</EditorialHeading><Link href="/properties" className="text-link">Keep exploring <ArrowUpRight size={16}/></Link></div><div>{items.map(p => <Link href={propertyHref(p)} key={p.id}><img src={p.cover.src} alt={p.cover.alt} loading="lazy"/><span><strong>{p.name}</strong><small>{p.locality}</small></span></Link>)}</div></section> : null;
}

export function DecisionFilterFields({value, onChange}: {value: DecisionFilters; onChange: (value: DecisionFilters) => void}) {
  return <div className="decision-filters">{([
    ['area', 'Unit size', [['', 'Any size'], ['compact', 'Under 1,200 sq ft'], ['medium', '1,200–1,800 sq ft'], ['large', 'Above 1,800 sq ft']]],
    ['timeline', 'Possession timeline', [['', 'Any timeline'], ['ready', 'Ready to move'], ['12', 'Within 12 months'], ['24', 'Within 2 years']]],
    ['corridor', 'Commute connection', [['', 'Any connection'], ['Manyata', 'Manyata'], ['Airport', 'Airport'], ['KIADB', 'KIADB'], ['Metro', 'Metro']]],
    ['intent', 'Buying priorities', [['', 'All priorities'], ['family', 'Family home · 2+ bedrooms'], ['compact', 'Studio / 1 bedroom'], ['land', 'Build on a plot']]],
  ] as const).map(([key, label, options]) => <label key={key}>{label}<select value={value[key]} onChange={e => onChange({...value, [key]: e.target.value})}>{options.map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></label>)}<small>Size uses each layout’s stated area basis. Connections refer to listed landmarks, not a guaranteed travel time.</small></div>;
}
