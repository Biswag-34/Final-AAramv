'use client';

import Link from 'next/link';
import {useState} from 'react';
import {ArrowUpRight, BedDouble, Building2, CalendarDays, Heart, MapPin, LandPlot} from 'lucide-react';
import {cardConfigurationSummary, projectUnitCount, propertyPriceSummary, propertyHref, recordDate, type Property} from '@/lib/catalog';

export function CataloguePropertyCard({p,saved,onSave,onEnquire,responsive=false,home=false}: {
  p:Property; saved:boolean; onSave:()=>void; onEnquire:(context:string,project:string)=>void; responsive?:boolean; home?:boolean;
}) {
  const [message,setMessage] = useState('');
  const units = projectUnitCount(p);
  const pricing = propertyPriceSummary(p);
  const configurations = cardConfigurationSummary(p);
  const land=p.facts.find(f=>/^(?:marketed master development|developer land area|development land area|total land area|land area|township land area)$/i.test(f.label.trim()));
  const totalArea=land?`${Number.isFinite(Number(land.value))?Number(land.value).toLocaleString('en-IN'):land.value}${land.unit?` ${land.unit}`:''}`:'On request';
  function rememberResults() {
    if (window.location.pathname === '/properties') {
      try {sessionStorage.setItem(`aaramv-results:${window.location.search}`,String(window.scrollY));} catch {}
    }
  }
  return <article className={`catalogue-project-card ${responsive?'r-property':'property-card'}${home?' is-home-card':''}`}>
    <div className="catalogue-card-image"><Link href={propertyHref(p)} onClick={rememberResults} aria-label={`View ${p.name}`}><img src={p.cover.src} alt={p.cover.alt} loading="lazy" width={720} height={440}/></Link><span className={`catalogue-card-status${p.status==='Ready to move'?' is-ready':''}`}>{p.status}</span><button type="button" className={`catalogue-card-save${saved?' is-saved':''}`} aria-label={`${saved?'Unsave':'Save'} ${p.name}`} aria-pressed={saved} onClick={()=>{onSave();setMessage(saved?'Removed from saved homes':'Added to saved homes');}}><Heart size={18} fill={saved?'currentColor':'none'}/></button></div>
    <div className="catalogue-card-content"><h3><Link href={propertyHref(p)} onClick={rememberResults}>{p.name}</Link></h3><p className="catalogue-card-address"><MapPin size={13}/><span>{p.address || `${p.locality}, ${p.zone}`}</span></p>
      <dl className="catalogue-card-facts"><div><dt>{p.type==='Plot'?<LandPlot size={15}/>:<BedDouble size={15}/>}{p.type==='Plot'?'Total area':'Config'}</dt><dd title={p.type==='Plot'?totalArea:configurations}>{p.type==='Plot'?totalArea:configurations}</dd></div><div><dt><Building2 size={15}/>Units</dt><dd>{units===null?'On request':units.toLocaleString('en-IN')}</dd></div><div><dt><CalendarDays size={15}/>Possession</dt><dd title={p.status==='Ready to move'?'Ready to move':p.possession.date?recordDate(p.possession.date):p.possession.year?`${p.possession.month?new Date(2000,p.possession.month-1).toLocaleString('en-IN',{month:'short'})+' ':''}${p.possession.year}`:p.possession.label}>{p.status==='Ready to move'?'Ready to move':p.possession.date?recordDate(p.possession.date):p.possession.year?`${p.possession.month?new Date(2000,p.possession.month-1).toLocaleString('en-IN',{month:'short'})+' ':''}${p.possession.year}`:p.possession.label}</dd></div></dl>
      <div className="catalogue-card-price" title={pricing.note}><p><strong>{pricing.label}</strong>{pricing.min!==null&&!p.pricing&&<span>Onward*</span>}</p></div>
      <div className="catalogue-card-actions"><Link className={`catalogue-view-more ${responsive?'r-details':'card-details-link'}`} href={propertyHref(p)} onClick={rememberResults}>View project details <ArrowUpRight size={15}/></Link><button className="catalogue-enquiry" type="button" aria-label={`Enquiry for ${p.name}`} onClick={()=>onEnquire(`Ask about this project: ${p.name} · ${p.primary.label}`,p.name)}>Ask about this project <ArrowUpRight size={15}/></button></div>
    </div><span className="sr-only" role="status">{message}</span>
  </article>;
}
