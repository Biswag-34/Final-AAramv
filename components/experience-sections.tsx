'use client';
import {EnquiryButton} from '@/components/enquiry-context';
import {EditorialHeading} from '@/components/editorial-heading';

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
  return <section className="contact-process" aria-labelledby="contact-process-title"><div className="experience-wrap"><div className="contact-process-heading"><EditorialHeading as="h2" id="contact-process-title">What happens when you get in touch?</EditorialHeading><p>A simple path from your first conversation to a planned site visit.</p></div><ol>{[[MessageCircle,'Share your brief','Tell us your preferred area, budget and home type.'],[Search,'Get a focused shortlist','Review homes that match your priorities.'],[Building2,'Compare the details','Look at layouts, costs and project information.'],[CalendarDays,'Plan your visit','Agree a time and see your shortlisted homes.']].map(([Icon,title,body],i)=>{const I=Icon as typeof Search;return <li key={String(title)}><div className="contact-process-node"><span>{i+1}</span><I size={22}/></div><EditorialHeading as="h3">{String(title)}</EditorialHeading><p>{String(body)}</p></li>;})}</ol></div></section>;
}

export function NeighbourhoodAlbum() {return <NeighbourhoodCollection/>;}

const routeSteps = [
  {title:'Your brief and shortlist',icon:Search,heading:'Your brief and shortlist',body:'We start with your budget, preferred areas, daily routes and must-haves. We research suitable options and explain why each home is worth considering.',detail:'You get: A shortlist with reasons, not just project names.'},
  {title:'Visits and comparison',icon:Footprints,heading:'Visits and comparison',body:'See the shortlisted options with the questions that matter to you. We help arrange access and bring layouts, current cost sheets and project details into the comparison.',detail:'You get: A clearer view of fit and trade-offs.'},
  {title:'EOI and booking',icon:ShieldCheck,heading:'EOI and booking',body:'Before you proceed, ask for the relevant cost sheet, payment schedule and written EOI or booking terms. We help coordinate your questions with the project team.',detail:'You get: The next steps and documents to review.'},
  {title:'Possession and move in',icon:KeyRound,heading:'Possession and move in',body:'After booking, we stay in touch and help coordinate project updates, document requests and possession-related next steps through move-in.',detail:'You get: Continued coordination after the booking milestone.'},
];
export function BuyingJourney() {
  const [active,setActive]=useState(0);
  return <section className="buyer-route-section" id="journey" aria-labelledby="buying-journey-title"><div className="buyer-route-photo"><img src="/images/aaramv-support-through-move-in.png" alt="Illustrative scene of a buyer and advisor reviewing a home during a walkthrough." loading="lazy" width={1536} height={1024}/></div><div className="experience-wrap buyer-route-wrap"><div className="buyer-route-intro"><EditorialHeading as="h2" id="buying-journey-title">The booking is done.<br/><em>Our support continues.</em></EditorialHeading><p>From project updates to possession-related next steps,<br/>we help you coordinate what comes next, through move-in.</p></div><div className="buyer-route-map"><svg className="buyer-route-line" viewBox="0 0 1200 350" preserveAspectRatio="none" aria-hidden="true"><path d="M0 260 C100 100 180 80 290 160 S450 300 570 190 S760 30 870 130 S1080 310 1200 210"/></svg><div className="buyer-route-stops" role="tablist" aria-label="Buying journey" onKeyDown={event=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?routeSteps.length-1:(active+(event.key==='ArrowRight'?1:-1)+routeSteps.length)%routeSteps.length;setActive(next);event.currentTarget.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();}}}>{routeSteps.map((step,i)=>{const Icon=step.icon;return <button id={`buyer-route-step-${i}`} key={step.title} type="button" role="tab" aria-selected={active===i} aria-controls="buyer-route-panel" tabIndex={active===i?0:-1} className={`buyer-route-stop route-stop-${i}${active===i?' is-active':''}`} onClick={()=>setActive(i)}><span className="buyer-route-node"><Icon size={26}/></span><span className="buyer-route-stop-label">{step.title}</span></button>;})}</div></div><div className="buyer-route-bottom"><Link href="/contact" className="btn lime">Talk about your next step <ArrowUpRight size={17}/></Link><div id="buyer-route-panel" className="buyer-route-panel" role="tabpanel" aria-labelledby={`buyer-route-step-${active}`} tabIndex={0}><EditorialHeading as="h3">{routeSteps[active].heading}</EditorialHeading><p>{routeSteps[active].body}</p><span><Check size={16}/>{routeSteps[active].detail}</span></div></div></div></section>;
}

export function AdvisorPartnership() {
  return <section className="advisor-partnership" aria-labelledby="advisor-partnership-title"><EditorialHeading as="h2" id="advisor-partnership-title">Your priorities shape <em className="heading-accent">the recommendation.</em></EditorialHeading><div className="partnership-intro"><p>A useful recommendation begins with your brief. We bring together the location, layout, cost and project information relevant to your decision, explain the trade-offs and help you take the next step with clarity.</p><div className="partnership-principles">{[[Heart,'Your brief leads','Recommendations begin with what matters to you.'],[ShieldCheck,'Research has a reason','We compare the layout, location, cost and project details relevant to your decision.'],[Handshake,'Support continues','We help coordinate the questions and next steps after booking.']].map(([I,title,body],i)=>{const Icon=I as typeof Heart;return <article key={String(title)}><span>0{i+1}<Icon size={20}/></span><div><EditorialHeading as="h3">{String(title)}</EditorialHeading><p>{String(body)}</p></div></article>;})}</div><EnquiryButton context="Tell us what you need" className="experience-link">Tell us what you need <ArrowUpRight size={18}/></EnquiryButton></div><div className="partnership-story"><img src={img('villa')} alt="Contemporary home surrounded by greenery" loading="lazy" width={900} height={700}/></div></section>;
}
