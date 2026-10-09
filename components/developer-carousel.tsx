'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {ArrowLeft, ArrowRight} from 'lucide-react';

const developers = [
  ['Prestige', 'prestige'], ['Godrej', 'godrej'], ['Assetz', 'assetz'],
  ['Bhartiya City', 'bhartiya-city'], ['TVS Emerald', 'tvs-emerald'], ['Sattva', 'sattva'],
  ['Sumadhura', 'sumadhura'], ['Poulomi', 'poulomi'], ['Brigade', 'brigade'],
  ['Concorde', 'concorde'], ['Lodha', 'lodha'], ['DNR', 'dnr'],
];

export function DeveloperCarousel() {
  const [viewport, api] = useEmblaCarousel({align: 'start', loop: true});
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!api || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {if (!document.hidden) api.scrollNext();}, 2800);
    return () => window.clearInterval(timer);
  }, [api, paused]);
  return <div className="developer-carousel" role="region" aria-label="Homes by all twelve developers" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={event => {if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);}}>
    <div className="developer-viewport" ref={viewport}><div className="developer-track">{developers.map(([name, asset], i) => <Link className="developer-slide" href={`/properties?q=${encodeURIComponent(name)}`} key={name} aria-label={`Explore ${name} properties`} onFocusCapture={() => api?.scrollTo(i)}><img src={`/images/developer-logos/${asset}.webp`} alt={`${name} logo`} loading="lazy" width={190} height={100}/></Link>)}</div></div>
    <div className="developer-controls"><button className="circle" aria-label="Previous developers" title="Previous developers" onClick={() => api?.scrollPrev()}><ArrowLeft size={18}/></button><button className="circle" aria-label="Next developers" title="Next developers" onClick={() => api?.scrollNext()}><ArrowRight size={18}/></button></div>
  </div>;
}
