'use client';

import { useState } from 'react';
import { Building2, House, LandPlot, BedDouble, Maximize, ShieldCheck, Handshake, KeyRound, Compass, MapPin, TreePine, Dumbbell, Waves, Car, Users, TrainFront, BriefcaseBusiness, School, Clock, CheckCircle2, FileText, Hospital, ShoppingBag, Bath, Ruler, Activity, CalendarDays, GraduationCap, IndianRupee, Trees, Baby, Bike, BookOpen, Clapperboard, Drama, Flower2, Footprints, Goal, HeartPulse, PawPrint, PersonStanding, Sparkles, Store, TentTree, Trophy, Volleyball, Armchair, ParkingCircle, ChevronLeft, ChevronRight, Images, ArrowUpRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { IconName, Place, LocalityRecord, PropertyRecord } from '@/lib/catalog-schema';

const icons = { Building2, House, LandPlot, BedDouble, Maximize, ShieldCheck, Handshake, KeyRound, Compass, MapPin, TreePine, Dumbbell, Waves, Car, Users, TrainFront, BriefcaseBusiness, School, Clock, CheckCircle2, FileText, Hospital, ShoppingBag, Bath, Ruler, Activity, CalendarDays, GraduationCap, IndianRupee, Trees, Baby, Bike, BookOpen, Clapperboard, Drama, Flower2, Footprints, Goal, HeartPulse, PawPrint, PersonStanding, Sparkles, Store, TentTree, Trophy, Volleyball, Armchair, ParkingCircle };
function iconFor(label: string | undefined, fallback: IconName): IconName {
  const text = (label || '').toLowerCase();
  if (/rera|legal|document|approval|registration/.test(text)) return 'ShieldCheck';
  if (/price|budget|cost|rupee|payment/.test(text)) return 'IndianRupee';
  if (/bed|configuration|bhk|floor plan|layout/.test(text)) return 'BedDouble';
  if (/bath/.test(text)) return 'Bath';
  if (/area|sq ft|carpet|built|size/.test(text)) return 'Ruler';
  if (/land|plot|acre|site/.test(text)) return 'LandPlot';
  if (/home|unit|residential|building|tower|floor/.test(text)) return 'House';
  if (/status|ready|construction|launch|available/.test(text)) return 'CheckCircle2';
  if (/possession|handover|date|checked|completion|timeline/.test(text)) return 'CalendarDays';
  if (/children|kids|toddler|tot lot|creche|play area/.test(text)) return 'Baby';
  if (/pet/.test(text)) return 'PawPrint';
  if (/pool|swim|jacuzzi/.test(text)) return 'Waves';
  if (/gym|fitness|open gym|indoor gym|outdoor gym/.test(text)) return 'Dumbbell';
  if (/yoga|meditation/.test(text)) return 'PersonStanding';
  if (/jogging|walking|track|path/.test(text)) return 'Footprints';
  if (/cycling/.test(text)) return 'Bike';
  if (/library|coworking|hobby/.test(text)) return 'BookOpen';
  if (/cinema|movie|theatre|theater/.test(text)) return 'Clapperboard';
  if (/amphitheatre|amphitheater/.test(text)) return 'Drama';
  if (/garden|green|landscape|lawn|park|tree|aroma|healing/.test(text)) return 'Flower2';
  if (/parking/.test(text)) return 'ParkingCircle';
  if (/store|convenience|retail/.test(text)) return 'Store';
  if (/spa|salon|massage|sauna/.test(text)) return 'Sparkles';
  if (/senior|healthcare|nurse/.test(text)) return 'HeartPulse';
  if (/seating|hammock|gazebo|plaza|corner/.test(text)) return 'Armchair';
  if (/barbeque|bbq|deck|sky|rooftop/.test(text)) return 'TentTree';
  if (/court|cricket|tennis|badminton|basketball|football|futsal|volleyball|pickleball|squash|kabaddi|skating|golf|sports|table tennis|chess|climbing/.test(text)) return 'Volleyball';
  if (/open space/.test(text)) return 'Trees';
  if (/developer|partner|clubhouse|club house|lounge|community|banquet|party|hall/.test(text)) return 'Users';
  if (/sport|activity|play/.test(text)) return 'Trophy';
  if (/pool|swim|water/.test(text)) return 'Waves';
  if (/school|education|college/.test(text)) return 'GraduationCap';
  if (/hospital|health|clinic|medical/.test(text)) return 'Hospital';
  if (/mall|shopping|retail|market/.test(text)) return 'ShoppingBag';
  if (/airport|metro|station|bus|rail|train|transport|connectivity/.test(text)) return 'TrainFront';
  if (/office|tech|business|employment|work/.test(text)) return 'BriefcaseBusiness';
  if (/road|drive|parking|car/.test(text)) return 'Car';
  if (/location|map|address|nearby|locality/.test(text)) return 'MapPin';
  return fallback;
}
export function DataIcon({ name, size = 20, label }: { name: IconName; size?: number; label?: string }) { const Icon = icons[iconFor(label, name)]; return <Icon size={size} strokeWidth={1.9} aria-hidden="true"/>; }
export function MapLink({ record }: { record: Pick<PropertyRecord, 'mapUrl' | 'coordinates'> }) {
  const href = record.mapUrl || (record.coordinates ? `https://www.google.com/maps?q=${record.coordinates.latitude},${record.coordinates.longitude}` : null);
  return href ? <a className="text-link" href={href} target="_blank" rel="noopener noreferrer">View on map <ArrowUpRight size={15}/></a> : null;
}
export function Places({ items }: { items: Place[] }) { return <div className="catalog-places">{items.map((place, index) => <div className="location-row" key={`${place.name}-${index}`}><div><div className="row"><DataIcon name={place.icon} size={18} label={`${place.category} ${place.name}`}/><strong>{place.name}</strong></div><small>{place.category}</small>{place.description && <p>{place.description}</p>}</div><div className="catalog-distance">{place.distanceKm !== null && <span>{place.distanceKm} km</span>}{place.travelMinutes !== null && <span>{place.travelMinutes} min{place.travelMode && ` (${place.travelMode})`}</span>}{place.mapUrl && <a href={place.mapUrl} target="_blank" rel="noopener noreferrer" className="text-link">Map <ArrowUpRight size={14}/></a>}</div></div>)}</div>; }
export function Gallery({ name, images, selectedId, onClose }: { name: string; images: PropertyRecord['images']; selectedId: string | null; onClose: () => void }) {
  const initial = images.findIndex(image => image.id === selectedId);
  const [offset, setOffset] = useState(0);
  const index = (Math.max(0, initial) + offset + images.length) % images.length;
  const photo = images[index];
  return <Dialog open={selectedId !== null} onOpenChange={open => { if (!open) { setOffset(0); onClose(); } }}><DialogContent className="gallery-modal"><DialogTitle className="sr-only">{name} gallery</DialogTitle><DialogDescription className="sr-only">{photo.alt}</DialogDescription><img src={photo.src} alt={photo.alt}/><div className="gallery-bottom"><div><span>{photo.caption} · {index + 1} / {images.length}</span>{photo.credit && <small className="catalog-credit">{photo.credit}</small>}</div>{images.length > 1 && <div className="row"><button className="circle" aria-label="Previous gallery image" onClick={() => setOffset((offset + images.length - 1) % images.length)}><ChevronLeft size={18}/></button><button className="circle" aria-label="Next gallery image" onClick={() => setOffset((offset + 1) % images.length)}><ChevronRight size={18}/></button></div>}</div></DialogContent></Dialog>;
}
export function LocalityExtras({ locality: l }: { locality: LocalityRecord }) {
  const [selected, setSelected] = useState<string | null>(null);
  return <>
    {!!l.metrics.length && <section className="detail-section"><h2>{l.name} at a glance</h2><div className="catalog-metrics">{l.metrics.map((metric, i) => <div key={i}><DataIcon name={metric.icon}/><p>{metric.label}</p><strong>{typeof metric.value === 'number' ? metric.value.toLocaleString('en-IN') : metric.value}{metric.unit && ` ${metric.unit}`}</strong>{metric.note && <p>{metric.note}</p>}{metric.asOf && <small>As of {metric.asOf}</small>}</div>)}</div></section>}
    {!!l.connectivity.length && <section className="detail-section"><h2>Getting around</h2><Places items={l.connectivity}/><MapLink record={l}/></section>}
    {!!l.nearbyPlaces.length && <section className="detail-section"><h2>Everyday essentials</h2><Places items={l.nearbyPlaces}/></section>}
    {!!l.infrastructure.length && <section className="detail-section"><h2>Infrastructure & developments</h2><div className="catalog-infrastructure">{l.infrastructure.map((item, i) => <div key={i}><div className="row"><DataIcon name={item.icon}/><h3>{item.title}</h3><span className="tag">{item.status.replaceAll('-', ' ')}</span></div><p>{item.description}</p>{item.expectedCompletion && <p>Expected completion: {item.expectedCompletion}</p>}</div>)}</div></section>}
    {l.market && <section className="detail-section"><h2>Local market snapshot</h2><p>{l.market.summary}</p><dl className="catalog-market">{l.market.minPricePerSqFtInr !== null && <div><dt>From / sq ft</dt><dd>₹{l.market.minPricePerSqFtInr.toLocaleString('en-IN')}</dd></div>}{l.market.maxPricePerSqFtInr !== null && <div><dt>To / sq ft</dt><dd>₹{l.market.maxPricePerSqFtInr.toLocaleString('en-IN')}</dd></div>}{l.market.rentalYieldPercent !== null && <div><dt>Rental yield</dt><dd>{l.market.rentalYieldPercent}%</dd></div>}</dl>{l.market.asOf && <p>As of {l.market.asOf}</p>}</section>}
    {l.images.length > 1 && <section className="detail-section"><h2>Around {l.name}</h2><div className="catalog-gallery">{l.images.map(image => <button key={image.id} onClick={() => setSelected(image.id)} aria-label={`View ${image.alt}`}><img src={image.src} alt={image.alt} loading="lazy"/><span>{image.caption || image.alt} <Images size={16}/></span></button>)}</div></section>}
    {!!l.faqs.length && <section className="detail-section faq"><h2>Questions about {l.name}</h2>{l.faqs.map((item, i) => <details key={i}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section>}
    <Gallery key={selected} name={l.name} images={l.images} selectedId={selected} onClose={() => setSelected(null)}/>
  </>;
}
