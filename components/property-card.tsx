'use client';
import {EditorialHeading} from '@/components/editorial-heading';


import Link from 'next/link';
import {useState} from 'react';
import {ArrowUpRight, BedDouble, Building2, CalendarDays, Heart, MapPin, LandPlot} from 'lucide-react';
import {possessionDisplay, cardConfigurationSummary, projectUnitCount, projectLandArea, propertyPriceSummary, propertyHref, type Property} from '@/lib/catalog';
import {trackEngagement} from '@/lib/engagement';
import {CompareControl} from '@/components/buyer-tools';

export function CataloguePropertyCard({p,saved,onSave,onEnquire,responsive=false,home=false}: {
  p:Property; saved:boolean; onSave:()=>void; onEnquire:(context:string,project:string)=>void; responsive?:boolean; home?:boolean;
}) {
  const [message,setMessage] = useState('');
  const units = projectUnitCount(p);
  const pricing = propertyPriceSummary(p);
  const configurations = cardConfigurationSummary(p);
  const summary=p.highlights.filter(item=>p.type==='Plot'||!/(?:sq\.?\s*ft|sqft|square feet)/i.test(item.title)).slice(0,2).map(item=>item.title.replace(/[.!]$/, '')).join('. ') || p.overview?.summary || p.description;
  function rememberResults() {
    if (window.location.pathname === '/properties') {
      try {sessionStorage.setItem(`aaramv-results:${window.location.search}`,String(window.scrollY));} catch {}
      try {sessionStorage.setItem('aaramv-last-results', `/properties${window.location.search}`);} catch {}
    }
  }
  return <article className={`catalogue-project-card ${responsive?'r-property':'property-card'}${home?' is-home-card':''}`}>
    <div className="catalogue-card-image"><Link href={propertyHref(p)} onClick={rememberResults} aria-label={`View ${p.name}`}><img src={p.cover.src} alt={p.cover.alt} loading="lazy" width={720} height={440}/></Link><span className={`catalogue-card-status${p.status==='Ready to move'?' is-ready':''}`}>{p.status}</span><button type="button" className={`catalogue-card-save${saved?' is-saved':''}`} aria-label={`${saved?'Unsave':'Save'} ${p.name}`} aria-pressed={saved} onClick={()=>{if(!saved)trackEngagement('save',p.id);onSave();setMessage(saved?'Removed from saved homes':'Added to saved homes');}}><Heart size={18} fill={saved?'currentColor':'none'}/></button></div>
    <div className="catalogue-card-content"><EditorialHeading preserve as="h3"><Link href={propertyHref(p)} onClick={rememberResults}>{p.name}</Link></EditorialHeading><p className="catalogue-card-address"><MapPin size={13}/><span title={p.address||p.locality}>{p.locality}, {p.city}</span></p>
      <dl className="catalogue-card-facts"><div><dt>{p.type==='Plot'?<LandPlot size={15}/>:<BedDouble size={15}/>}{p.type==='Plot'?'Plot sizes':'Config'}</dt><dd title={configurations}>{configurations}</dd></div><div><dt>{p.type==='Plot'?<LandPlot size={15}/>:<Building2 size={15}/>}{p.type==='Plot'?'Total area':'Units'}</dt><dd>{p.type==='Plot'?projectLandArea(p):units===null?'On request':units.toLocaleString('en-IN')}</dd></div><div><dt><CalendarDays size={15}/>Possession</dt><dd title={possessionDisplay(p)}>{possessionDisplay(p)}</dd></div></dl>
      <p className="catalogue-card-summary" title={summary}>{summary.replace(/[.!]$/, '')}.</p>
      <div className="catalogue-card-price" title={pricing.note}><p><strong>{pricing.label}</strong>{pricing.min!==null&&!p.pricing&&<span>Onward*</span>}</p></div>
      <CompareControl p={p}/>
      <div className="catalogue-card-actions"><Link className={`catalogue-view-more ${responsive?'r-details':'card-details-link'}`} href={propertyHref(p)} onClick={rememberResults}>View project details <ArrowUpRight size={15}/></Link><button className="catalogue-enquiry" type="button" aria-label={`Enquiry for ${p.name}`} onClick={()=>onEnquire(`Ask about this project: ${p.name} · ${p.primary.label}`,p.name)}>Ask about this project <ArrowUpRight size={15}/></button></div>
    </div><span className="sr-only" role="status">{message}</span>
  </article>;
}
