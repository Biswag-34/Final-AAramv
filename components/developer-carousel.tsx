'use client';

import Link from 'next/link';
import {properties} from '@/app/data';
import {filterProperties} from '@/lib/catalog';

const developerOptions = [
  ['Prestige', 'prestige'], ['Godrej', 'godrej'], ['Assetz', 'assetz'],
  ['Bhartiya City', 'bhartiya-city'], ['TVS Emerald', 'tvs-emerald'], ['Sattva', 'sattva'],
  ['Sumadhura', 'sumadhura'], ['Poulomi', 'poulomi'], ['Brigade', 'brigade'],
  ['Concorde', 'concorde'], ['Lodha', 'lodha'], ['DNR', 'dnr'],
];

const developers = developerOptions.filter(([name]) => filterProperties(properties, {query:name}).length > 0);

export function DeveloperCarousel() {
  return <div className="developer-carousel developer-marquee" role="region" aria-label="Explore homes by developer">
    <div className="developer-viewport"><div className="developer-marquee-track">{[0,1].map(copy => <div className="developer-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>{developers.map(([name, asset]) => <Link className="developer-slide" href={`/properties?q=${encodeURIComponent(name)}`} key={name} aria-label={`Explore ${name} properties`} tabIndex={copy === 1 ? -1 : undefined}><img src={`/images/developer-logos/${asset}.webp`} alt={`${name} logo`} loading="lazy" width={190} height={100}/></Link>)}</div>)}</div></div>

  </div>;
}
