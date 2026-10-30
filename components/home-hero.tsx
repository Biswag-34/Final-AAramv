'use client';

import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,Compass,Handshake,House,MapPin,Phone} from 'lucide-react';
import {EditorialHeading} from '@/components/editorial-heading';
import {HeroSearch} from '@/components/hero-search';

const slides=[
  {id:'buyer-first',heading:'Your next home should',accent:'fit your life.',description:'Share your budget, everyday routes and must-haves. We research suitable options, explain the trade-offs and support you through move-in.',image:'/images/aaramv-buyer-first-hero.png'},
  {id:'bengaluru',heading:'Bengaluru homes.',accent:'Find your beginning.',description:'Explore homes, compare neighbourhoods and find a place that fits your everyday.',image:'/images/hero/bengaluru-desktop.webp'},
  {id:'north-bengaluru',heading:'North Bengaluru.',accent:'Your next chapter.',description:'Explore projects across North Bengaluru and compare the areas around your everyday.',image:'/images/hero/north-bengaluru-desktop.webp'},
] as const;

export function HomeHero({responsive=false,onEnquire}:{responsive?:boolean;onEnquire:(context:string)=>void}){
  const [active,setActive]=useState(0);
  const [focused,setFocused]=useState(false);
  const [visible,setVisible]=useState(true);
  const [ready,setReady]=useState(false);
  const [reducedMotion,setReducedMotion]=useState(false);
  const section=useRef<HTMLElement>(null);
  useEffect(()=>{
    const firstImage=section.current?.querySelector('img');
    if(firstImage?.complete&&firstImage.naturalWidth>0)setReady(true);
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const motion=()=>setReducedMotion(preference.matches);
    const visibility=()=>setVisible(!document.hidden);
    motion();preference.addEventListener('change',motion);document.addEventListener('visibilitychange',visibility);
    return()=>{preference.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);};
  },[]);
  useEffect(()=>{
    if(!ready||focused||!visible||reducedMotion)return;
    const timer=window.setInterval(()=>setActive(current=>(current+1)%slides.length),5000);
    return()=>window.clearInterval(timer);
  },[ready,focused,visible,reducedMotion,active]);
  const title=<EditorialHeading as="h1" className="hero-carousel-title" aria-live="off">{slides.map((slide,index)=><span key={slide.id} className={`hero-heading-slide${index===active?' is-active':''}`} aria-hidden={index!==active}><span>{slide.heading}</span>{' '}<em>{slide.accent}</em></span>)}</EditorialHeading>;
  const description=<p className="hero-carousel-description">{slides.map((slide,index)=><span key={slide.id} className={`hero-description-slide${index===active?' is-active':''}`} aria-hidden={index!==active}>{slide.description}</span>)}</p>;
  const search=<><HeroSearch/><div className={`hero-actions${responsive?' r-hero-actions':''}`}><Link href="/properties" className="btn lime">Browse homes<ArrowUpRight size={16}/></Link><button type="button" className={`${responsive?'r-button':'btn'} advisor-call`} onClick={()=>onEnquire('Build my shortlist')}><Phone size={17}/>Build my shortlist</button></div>{responsive?<div className="r-popular"><Link href="/properties?status=Ready%20to%20move">Ready to move<ArrowUpRight size={13}/></Link><Link href="/properties?q=Thanisandra">Thanisandra</Link><Link href="/properties?q=Bagalur">Bagalur</Link></div>:<div className="popular"><span>POPULAR SEARCHES</span>{['Bagalur','Thanisandra','Devanahalli'].map(name=><Link key={name} href={`/properties?q=${encodeURIComponent(name)}`}>{name}</Link>)}<Link href="/properties?status=Ready%20to%20move">Ready to move</Link></div>}</>;
  return <><section ref={section} className={`${responsive?'r-hero':'hero'} home-hero-carousel`} data-hero-slide={active} aria-label="Bengaluru homes and buyer guidance" aria-roledescription="carousel" onFocusCapture={event=>setFocused(!!(event.target as HTMLElement).closest('form'))} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setFocused(false);}}>
    <div className="hero-carousel-visual" aria-hidden="true">{slides.map((slide,index)=><div key={slide.id} className={`hero-carousel-frame${index===active?' is-active':''}`} data-concept={slide.id}><picture>{index>0&&<><source media="(min-width: 1024px)" srcSet={slide.image}/><source media="(min-width: 768px)" srcSet={`/images/hero/${slide.id}-tablet.webp`}/><source srcSet={`/images/hero/${slide.id}-mobile.webp`}/></>}<img src={slide.image} alt="" width={index===0?1774:index===1?1834:1836} height={index===0?887:index===1?858:857} fetchPriority={index===0?'high':'low'} decoding="async" onLoad={()=>{if(index===0)setReady(true);}}/></picture></div>)}</div>
    {responsive?<div className="r-wrap r-hero-copy"><div className="hero-carousel-message"><p className="r-kicker">BENGALURU REAL ESTATE CHANNEL PARTNER</p>{title}{description}</div><div className="hero-carousel-search">{search}</div></div>:<div className="wrap hero-content"><div className="eyebrow">Bengaluru real estate channel partner</div>{title}{description}{search}</div>}
    {active===2&&<span className="hero-carousel-caption">Illustrative project collage</span>}
  </section>{!responsive&&<div className="wrap quick-ribbon"><span><MapPin size={17}/> Bengaluru property discovery</span><span><Compass size={17}/> Compare your shortlist</span><span><Handshake size={17}/> Site-visit coordination</span><span><House size={17}/> Apartments · Villas · Plots</span></div>}</>;
}
