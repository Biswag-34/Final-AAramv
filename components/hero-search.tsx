'use client';

import {useId} from 'react';
import {useRouter} from 'next/navigation';
import {MapPin, Search, House, Wallet} from 'lucide-react';
import {properties, localities} from '@/app/data';

/** The existing white pill search, with visible labels and explicit defaults. */
export function HeroSearch() {
  const router = useRouter();
  const suggestions = useId();
  return <form action="/properties" className="search-bar visual-hero-search" role="search" onSubmit={event => {
    event.preventDefault();
    const params = new URLSearchParams();
    new FormData(event.currentTarget).forEach((value, key) => {if (String(value).trim()) params.set(key, String(value).trim());});
    router.push(`/properties${params.size ? `?${params}` : ''}`);
  }}>
    <label className="hero-search-field hero-search-location"><MapPin size={18}/><span><strong>Locality or project</strong><input name="q" aria-label="Search locality or project" placeholder="Any locality or project" list={suggestions} autoComplete="off"/></span></label>
    <datalist id={suggestions}>{localities.map(l => <option key={l.id} value={l.name}/>)}{properties.map(p => <option key={p.id} value={p.name}/>)}</datalist>
    <label className="hero-search-field"><House size={18}/><span><strong>Home type</strong><select name="type" aria-label="Search home type" defaultValue=""><option value="">Any home type</option><option>Apartment</option><option>Villa</option><option>Plot</option></select></span></label>
    <label className="hero-search-field"><Wallet size={18}/><span><strong>Budget (₹)</strong><select name="budget" aria-label="Search budget in rupees" defaultValue=""><option value="">Any budget</option><option value="0.75">Up to ₹75 lakh</option><option value="1">Up to ₹1 crore</option><option value="1.5">Up to ₹1.5 crore</option><option value="2">Up to ₹2 crore</option><option value="3">Up to ₹3 crore</option><option value="5">Up to ₹5 crore</option></select></span></label>
    <button className="btn primary" type="submit">Search homes<Search size={17}/></button>
  </form>;
}
