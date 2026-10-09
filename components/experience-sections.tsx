'use client';
import {useEffect, useRef, useState, type CSSProperties} from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import {ArrowUpRight, Check, Compass, Heart, MapPin, Search, Footprints, Wallet, ShieldCheck, Handshake, BadgeCheck, KeyRound, ArrowLeft, ArrowRight, Clock, Pause, Play} from 'lucide-react';
import {localities, properties, steps, img} from '@/app/data';

const comparisons = [
  ['Your priorities', 'Focus on selling a property', 'Your needs, budget and preferences guide us'],
  ['Property recommendations', 'Promotes the properties available to sell', 'Recommends properties based on your requirements'],
  ['Information & guidance', 'Information focused on the sales pitch', 'Clear explanations tailored to your questions and needs'],
  ['Time to decide', 'Pushes the conversation towards booking', 'Gives you time to understand, compare and decide'],
  ['Continued support', 'Support focused on closing the sale', 'Stays with you from the first call through possession'],
];

const comparisonIcons = [Heart, Search, ShieldCheck, Clock, BadgeCheck];

export function BuyerComparison() {
  const [viewport, api] = useEmblaCarousel({align: 'center', loop: false, breakpoints: {'(min-width: 600px)': {active: false}}});
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!api) return;
    const select = () => setActive(api.selectedScrollSnap());
    api.on('select', select).on('reInit', select);
    return () => {api.off('select', select).off('reInit', select);};
  }, [api]);
  return <section className="experience-section buyer-comparison" aria-labelledby="buyer-comparison-title"><div className="experience-wrap">
    <div className="experience-heading"><div><h2 id="buyer-comparison-title">More than a property. <em>A decision that feels right.</em></h2><p>Your needs come first. We help you make an informed choice and stay with you from your first call to possession.</p></div><Link href="/about" className="experience-link">Meet your property partner <ArrowUpRight size={18}/></Link></div>
    <div className="comparison-desktop comparison-scene"><div className="comparison-board">
      <table className="comparison-table" role="table">
        <caption className="sr-only">Why choose Aaramv Realty: a comparison of property advisory approaches</caption>
        <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">What matters</th><th scope="col" role="columnheader">A sales-led approach</th><th scope="col" role="columnheader" className="comparison-benefit-cell comparison-benefit-header comparison-ghost">The Aaramv approach</th></tr></thead>
        <tbody role="rowgroup">{comparisons.map(([feature, usual, ours], i) => {const Icon = comparisonIcons[i]; return <tr key={feature} role="row"><th scope="row" role="rowheader" style={{gridRow: i + 2}}><span><small className="comparison-number">0{i + 1}</small>{feature}</span></th><td role="cell" style={{gridRow: i + 2}}>{usual}</td><td role="cell" style={{gridRow: i + 2}} className="comparison-benefit-cell comparison-ghost" data-priority={i}><span><Icon size={26}/>{ours}</span></td></tr>;})}</tbody>
      </table>
      <div className="comparison-raised" aria-hidden="true">
        <div className="comparison-benefit-cell comparison-benefit-header">The Aaramv approach</div>
        {comparisons.map(([feature, , ours], i) => {const Icon = comparisonIcons[i]; return <div className="comparison-benefit-cell" data-priority={i} key={feature}><span><Icon size={26}/>{ours}</span></div>;})}
      </div>
    </div></div>
    <div className="comparison-mobile"><div className="comparison-topic-nav" aria-label="What matters to you">{comparisons.map(([feature], i) => {const Icon = comparisonIcons[i]; return <button key={feature} type="button" aria-label={feature} title={feature} aria-pressed={i === active} onClick={() => api?.scrollTo(i)}><Icon size={20}/><span>0{i + 1}</span></button>;})}</div><div className="comparison-viewport" ref={viewport}><div className="comparison-track">{comparisons.map(([feature, usual, ours], i) => <article className="comparison-slide" key={feature} aria-label={feature} onFocusCapture={() => api?.scrollTo(i)}><h3>{feature}</h3><div className="comparison-pair"><div><span>A sales-led approach</span><p>{usual}</p></div><div><span>The Aaramv approach</span><p>{ours}</p></div></div></article>)}</div></div><div className="comparison-controls"><button className="circle" type="button" aria-label="Previous priority" title="Previous priority" disabled={active === 0} onClick={() => api?.scrollPrev()}><ArrowLeft size={18}/></button><span>{String(active + 1).padStart(2, '0')} / 05</span><button className="circle" type="button" aria-label="Next priority" title="Next priority" disabled={active === comparisons.length - 1} onClick={() => api?.scrollNext()}><ArrowRight size={18}/></button></div></div>
  </div></section>;
}

export function NeighbourhoodAlbum() {
  const [viewport, api] = useEmblaCarousel({align: 'center', loop: true, duration: 36, breakpoints: {'(min-width: 600px)': {active: false}}});
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(entries => setVisible(!!entries[0]?.isIntersecting), {threshold: .2});
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!api) return;
    const select = () => setActive(api.selectedScrollSnap());
    api.on('select', select).on('reInit', select);
    return () => {api.off('select', select).off('reInit', select);};
  }, [api]);
  useEffect(() => {
    if (!api || !visible || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {if (!document.hidden && window.matchMedia('(max-width: 599px)').matches) api.scrollNext();}, 3000);
    return () => window.clearInterval(timer);
  }, [api, visible, paused]);
  return <section ref={root} className="experience-section neighbourhood-album" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={e => {if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);}} aria-labelledby="neighbourhood-album-title"><div className="experience-wrap">
    <div className="experience-heading"><div><h2 id="neighbourhood-album-title">Bengaluru neighbourhoods.</h2><p>Close to work. Closer to nature. Find the corner of the city that fits your everyday.</p></div><Link href="/localities" className="experience-link">All neighbourhoods <ArrowUpRight size={18}/></Link></div>
    <div className="album-viewport" ref={viewport}><div className="album-grid">{localities.slice(0, 6).map((l, i) => {
      const matches = properties.filter(p => p.localityId === l.id);
      const isProject = l.cover.kind !== 'locality' || properties.some(p => p.images.some(image => image.src === l.cover.src));
      return <Link href={`/localities/${l.id}`} className="album-slide" key={l.id} onFocusCapture={() => api?.scrollTo(i)}><span className="album-wave" aria-hidden="true"><svg viewBox="0 0 360 100" preserveAspectRatio="none"><path d="M0 50 C90 -10 90 -10 180 50 S270 110 360 50" fill="none"/></svg></span><span className="album-image"><img src={l.cover.src} alt={l.cover.alt} loading="lazy" width={720} height={480}/><span className="album-index">{String(i + 1).padStart(2, '0')}</span>{isProject && <span className="album-caption">Project view</span>}<div className="album-copy"><span><MapPin size={14}/>{l.zone}</span><h3>{l.name}</h3><p>{matches.length} listed {matches.length === 1 ? 'project' : 'projects'}</p></div><ArrowUpRight className="album-arrow" size={24}/></span></Link>;
    })}</div></div><div className="album-controls"><button className="circle" type="button" aria-label="Previous neighbourhood" title="Previous neighbourhood" onClick={() => api?.scrollPrev()}><ArrowLeft size={19}/></button><span>{active + 1} / 6</span><button className="circle" type="button" aria-label="Next neighbourhood" title="Next neighbourhood" onClick={() => api?.scrollNext()}><ArrowRight size={19}/></button></div>
  </div></section>;
}

const journeyIcons = [Search, Footprints, Wallet, ShieldCheck, Handshake, KeyRound];
export function BuyingJourney() {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [engaged, setEngaged] = useState(false);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(entries => setVisible(!!entries[0]?.isIntersecting), {threshold: .15});
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!visible || paused || engaged || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {if (!document.hidden) setActive(i => (i + 1) % steps.length);}, 2600);
    return () => window.clearInterval(timer);
  }, [visible, paused, engaged]);
  const Icon = journeyIcons[active];
  return <section ref={root} className={`experience-section buying-journey${visible ? ' is-visible' : ''}`} id="journey" onFocusCapture={() => setEngaged(true)} onBlurCapture={e => {if (!e.currentTarget.contains(e.relatedTarget)) setEngaged(false);}} aria-labelledby="buying-journey-title"><div className="experience-wrap">
    <div className="experience-heading"><div><h2 id="buying-journey-title">One journey. A partner at every turn.</h2><p>From your first shortlist to the keys, every step has a purpose. And someone beside you.</p></div><Link href="/contact" className="experience-link">Take the first step <ArrowUpRight size={18}/></Link></div>
    <div className="journey-path" data-step={active} style={{'--journey-step': active} as CSSProperties} role="tablist" aria-label="Buying journey" onKeyDown={e => {if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) {e.preventDefault(); const next = e.key === 'Home' ? 0 : e.key === 'End' ? steps.length - 1 : (active + (e.key === 'ArrowRight' ? 1 : -1) + steps.length) % steps.length; setActive(next); e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();}}}>
      <div className="journey-route" aria-hidden="true"><div style={{width: `${active / (steps.length - 1) * 100}%`}}/></div>
      {steps.map(([title], i) => {const StepIcon = journeyIcons[i]; return <button id={`journey-step-${i}`} role="tab" type="button" aria-controls="journey-panel" aria-selected={active === i} tabIndex={active === i ? 0 : -1} key={title} className={`journey-stop${i <= active ? ' is-reached' : ''}${i === active ? ' is-current' : ''}`} onClick={() => setActive(i)}><span className="journey-node"><StepIcon size={24}/></span><small>0{i + 1}</small><span>{title}</span></button>;})}
    </div>
    <div id="journey-panel" role="tabpanel" aria-labelledby={`journey-step-${active}`} tabIndex={0} className="journey-detail"><div className="journey-stage-art" aria-hidden="true"><span className="journey-art-number">0{active + 1}</span><Icon size={56} strokeWidth={1.25}/></div><div className="journey-detail-copy" key={active}><span className="journey-step-label">Step {active + 1} of {steps.length}</span><h3>{steps[active][0]}</h3><p>{steps[active][1]}</p><div className="journey-guide"><Check size={18}/><span>{steps[active][2]}</span></div></div><div className="journey-controls"><button className="circle journey-play" type="button" title={paused ? 'Resume journey' : 'Pause journey'} aria-label={paused ? 'Resume journey' : 'Pause journey'} onClick={() => setPaused(value => !value)}>{paused ? <Play size={18}/> : <Pause size={18}/>}</button><button className="circle" title="Previous step" aria-label="Previous step" disabled={active === 0} onClick={() => setActive(i => i - 1)}><ArrowLeft size={20}/></button><button className="circle" title="Next step" aria-label="Next step" disabled={active === steps.length - 1} onClick={() => setActive(i => i + 1)}><ArrowRight size={20}/></button></div></div>
  </div></section>;
}

export function AdvisorPartnership() {
  return <section className="advisor-partnership" aria-labelledby="advisor-partnership-title"><h2 id="advisor-partnership-title">Not just a channel partner. Your property partner.</h2><div className="partnership-intro"><span className="partnership-icon"><Compass size={28}/></span><p>A clearer path. A more personal experience. We start with your brief and stay with the questions that matter.</p><Link href="/contact" className="experience-link">Meet your advisor <ArrowUpRight size={18}/></Link></div><div className="partnership-story"><img src={img('villa')} alt="Contemporary home surrounded by greenery" loading="lazy" width={900} height={540}/><div className="partnership-principles">{[[Heart, 'Listen before listing', 'Your routines, budget, commute and comfort shape the shortlist.'], [ShieldCheck, 'Compare with context', 'Understand the developer, locality, costs and trade-offs together.'], [Handshake, 'Stay beside you', 'One advisor keeps your journey clear, from the first visit to handover.']].map(([I, title, body], i) => {const Icon = I as typeof Heart; return <article key={String(title)}><span>0{i + 1}<Icon size={22}/></span><div><h3>{String(title)}</h3><p>{String(body)}</p></div></article>;})}</div></div></section>;
}
