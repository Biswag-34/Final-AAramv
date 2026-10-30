'use client';
import {EditorialHeading} from '@/components/editorial-heading';

import {useId, useState} from 'react';
import {Check, Plus, ArrowUpRight, Plane, BriefcaseBusiness, TrainFront, GraduationCap, Hospital, ShoppingBag, MapPin} from 'lucide-react';
import {DataIcon} from '@/components/catalog-content';
import {propertyFaqs, type Property} from '@/lib/catalog';
import type {Place} from '@/lib/catalog-schema';

export function ProjectOverview({p}: {p:Property}) {
  const highlights=p.overview?.highlights.length?p.overview.highlights:p.highlights.map(item=>item.title);
  return <section className="detail-section project-overview-panel" id="overview"><div className="overview-intro"><span className="overview-kicker">THE PROJECT AT A GLANCE</span><EditorialHeading preserve as="h2">{p.overview?.title||p.content.overviewTitle}</EditorialHeading><p>{p.overview?.summary||p.description}</p></div><div className="overview-highlights">{highlights.map(item=><span key={item}><Check size={15}/>{item}</span>)}</div>{p.facts.length>0&&<dl className="overview-fact-grid">{p.facts.map((fact,i)=><div key={i} className={/floor/i.test(fact.label)?'overview-floor-fact':''}><dt><span className="overview-fact-icon"><DataIcon name={fact.icon} size={20} label={fact.label}/></span>{fact.label.replace('Residential towers / blocks','Towers / blocks').replace('Documented layout range','Home sizes')}</dt><dd>{typeof fact.value==='number'?fact.value.toLocaleString('en-IN'):fact.value}{fact.unit&&<small> {fact.unit}</small>}</dd></div>)}</dl>}</section>;
}

export function NearbyLocationBars({items}: {items:Place[]}) {
  return <div className="nearby-location-bars">{items.map((place,i)=>{
    const label=`${place.category} ${place.name}`;
    const Icon=/airport/i.test(label)?Plane:/work|office|tech park|business|employment/i.test(label)?BriefcaseBusiness:/metro|rail|station|transport|bus/i.test(label)?TrainFront:/school|education|vidya|college|university/i.test(label)?GraduationCap:/hospital|health|clinic/i.test(label)?Hospital:/mall|shop|retail/i.test(label)?ShoppingBag:MapPin;
    const body=<><span className="nearby-place-icon"><Icon size={20}/></span><strong>{place.name}</strong><span className="nearby-place-distance">{place.distanceKm!==null?`${place.distanceKm} km`:place.travelMinutes!==null?`${place.travelMinutes} min`:null}</span>{place.mapUrl&&<ArrowUpRight size={15}/>}</>;
    return place.mapUrl?<a key={`${place.name}-${i}`} href={place.mapUrl} target="_blank" rel="noreferrer" className="nearby-location-bar" aria-label={`${place.name}${place.distanceKm!==null?`, ${place.distanceKm} kilometres`:place.travelMinutes!==null?`, ${place.travelMinutes} minutes`:''}, open map`}>{body}</a>:<div className="nearby-location-bar" key={`${place.name}-${i}`}>{body}</div>;
  })}</div>;
}

export function ProjectFaq({p}: {p:Property}) {
  const [active,setActive]=useState<number|null>(null), id=useId();
  if(!p.faqs.length)return null;
  return <section className="detail-section project-faq" id="faqs"><span className="overview-kicker">A LITTLE MORE CLARITY</span><EditorialHeading as="h2">{p.content.faqsTitle}</EditorialHeading><div className="project-faq-items">{propertyFaqs(p).map((item,i)=>{
    const open=active===i;
    return <article className={`project-faq-item${open?' is-open':''}`} key={item.question}><EditorialHeading preserve={item.question.toLowerCase().includes(p.name.toLowerCase())} as="h3"><button type="button" id={`${id}-question-${i}`} aria-expanded={open} aria-controls={`${id}-answer-${i}`} onClick={()=>setActive(open?null:i)}><span className="faq-question-number">{String(i+1).padStart(2,'0')}</span><span>{item.question}</span><span className="faq-toggle"><Plus size={18}/></span></button></EditorialHeading><div id={`${id}-answer-${i}`} className="project-faq-answer" role="region" aria-labelledby={`${id}-question-${i}`} aria-hidden={!open}><div><p>{item.answer}</p></div></div></article>;
  })}</div></section>;
}
