'use client';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight, Check, Compass, Heart, Search, Footprints, ShieldCheck, Handshake, KeyRound, CalendarDays, MessageCircle, Building2} from 'lucide-react';
import {img} from '@/app/data';
import {NeighbourhoodCollection} from '@/components/locality-discovery';
import {AaramvDifference} from '@/components/aaramv-difference';

export function BuyerComparison({onEnquire}:{onEnquire?:()=>void}) {
  return <AaramvDifference onEnquire={onEnquire}/>;
}

export function ServiceSupport() {
  return <section className="contact-process" aria-labelledby="contact-process-title"><div className="experience-wrap"><div className="contact-process-heading"><h2 id="contact-process-title">What happens when you get in touch?</h2><p>A simple path from your first conversation to a planned site visit.</p></div><ol>{[[MessageCircle,'Share your brief','Tell us your preferred area, budget and home type.'],[Search,'Get a focused shortlist','Review homes that match your priorities.'],[Building2,'Compare the details','Look at layouts, costs and project information.'],[CalendarDays,'Plan your visit','Agree a time and see your shortlisted homes.']].map(([Icon,title,body],i)=>{const I=Icon as typeof Search;return <li key={String(title)}><div className="contact-process-node"><span>{i+1}</span><I size={22}/></div><h3>{String(title)}</h3><p>{String(body)}</p></li>;})}</ol></div></section>;
}

export function NeighbourhoodAlbum() {return <NeighbourhoodCollection/>;}

const routeSteps = [
  {title:'Search & shortlist',icon:Search,heading:'Find the homes that fit your life.',body:'Start with your preferred neighbourhood, budget and space needs. Compare a focused selection of projects and configurations.',detail:'Your priorities shape the search.'},
  {title:'Visit & experience',icon:Footprints,heading:'See the space. Experience the surroundings.',body:'Walk through your shortlisted homes and explore the approach roads and everyday services. We help coordinate the visit and your questions.',detail:'Look beyond the brochure.'},
  {title:'Finance & paperwork',icon:ShieldCheck,heading:'Bring the costs and documents into focus.',body:'Request a complete cost sheet, discuss finance with your lender and review project documents with your legal advisor. We coordinate information and next steps.',detail:'Make the details part of the decision.'},
  {title:'Book & possession',icon:KeyRound,heading:'Plan your booking and your next beginning.',body:'Review terms, payment milestones and possession commitments before booking. We help coordinate updates and handover with the project team.',detail:'Your property partner through the final steps.'},
];
export function BuyingJourney() {
  const [active,setActive]=useState(0);
  return <section className="buyer-route-section" id="journey" aria-labelledby="buying-journey-title"><div className="buyer-route-photo"><img src={img('villa')} alt="Illustrative contemporary home" loading="lazy" width={1440} height={960}/></div><div className="experience-wrap buyer-route-wrap"><div className="buyer-route-intro"><h2 id="buying-journey-title">One journey.<br/><em>A partner at every turn.</em></h2><p>From the first shortlist<br/>to your new keys.</p></div><div className="buyer-route-map"><svg className="buyer-route-line" viewBox="0 0 1200 350" preserveAspectRatio="none" aria-hidden="true"><path d="M0 260 C100 100 180 80 290 160 S450 300 570 190 S760 30 870 130 S1080 310 1200 210"/></svg><div className="buyer-route-stops" role="tablist" aria-label="Buying journey" onKeyDown={event=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?routeSteps.length-1:(active+(event.key==='ArrowRight'?1:-1)+routeSteps.length)%routeSteps.length;setActive(next);event.currentTarget.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();}}}>{routeSteps.map((step,i)=>{const Icon=step.icon;return <button id={`buyer-route-step-${i}`} key={step.title} type="button" role="tab" aria-selected={active===i} aria-controls="buyer-route-panel" tabIndex={active===i?0:-1} className={`buyer-route-stop route-stop-${i}${active===i?' is-active':''}`} onClick={()=>setActive(i)}><span className="buyer-route-node"><Icon size={26}/></span><span className="buyer-route-stop-label">{step.title}</span></button>;})}</div></div><div className="buyer-route-bottom"><Link href="/contact" className="btn lime">Talk to your property partner <ArrowUpRight size={17}/></Link><div id="buyer-route-panel" className="buyer-route-panel" role="tabpanel" aria-labelledby={`buyer-route-step-${active}`} tabIndex={0}><h3>{routeSteps[active].heading}</h3><p>{routeSteps[active].body}</p><span><Check size={16}/>{routeSteps[active].detail}</span></div></div><span className="buyer-route-photo-note">Illustrative residential photograph</span></div></section>;
}

export function AdvisorPartnership() {
  return <section className="advisor-partnership" aria-labelledby="advisor-partnership-title"><h2 id="advisor-partnership-title">Not just a channel partner. Your property partner.</h2><div className="partnership-intro"><p>A clearer path. A more personal experience. We start with your brief and stay with the questions that matter.</p><div className="partnership-principles">{[[Heart,'Listen before listing','Your routines, budget, commute and comfort shape the shortlist.'],[ShieldCheck,'Compare with context','Understand the developer, locality, costs and trade-offs together.'],[Handshake,'Stay beside you','One advisor keeps the questions and next steps clear.']].map(([I,title,body],i)=>{const Icon=I as typeof Heart;return <article key={String(title)}><span>0{i+1}<Icon size={20}/></span><div><h3>{String(title)}</h3><p>{String(body)}</p></div></article>;})}</div><Link href="/contact" className="experience-link">Meet your advisor <ArrowUpRight size={18}/></Link></div><div className="partnership-story"><img src={img('villa')} alt="Contemporary home surrounded by greenery" loading="lazy" width={900} height={700}/></div></section>;
}
