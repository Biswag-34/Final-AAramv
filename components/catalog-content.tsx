'use client';

import { useState } from 'react';
import { Building2, House, LandPlot, BedDouble, Maximize, ShieldCheck, Handshake, KeyRound, Compass, MapPin, TreePine, Dumbbell, Waves, Car, Users, TrainFront, BriefcaseBusiness, School, Clock, CheckCircle2, FileText, Hospital, ShoppingBag, Bath, Ruler, ChevronLeft, ChevronRight, Images, ArrowUpRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { IconName, Place, LocalityRecord, PropertyRecord } from '@/lib/catalog-schema';

const icons = { Building2, House, LandPlot, BedDouble, Maximize, ShieldCheck, Handshake, KeyRound, Compass, MapPin, TreePine, Dumbbell, Waves, Car, Users, TrainFront, BriefcaseBusiness, School, Clock, CheckCircle2, FileText, Hospital, ShoppingBag, Bath, Ruler };
export function DataIcon({ name, size = 20 }: { name: IconName; size?: number }) { const Icon = icons[name]; return <Icon size={size} strokeWidth={1.5} aria-hidden="true"/>; }
export function MapLink({ record }: { record: Pick<PropertyRecord, 'mapUrl' | 'coordinates'> }) {
  const href = record.mapUrl || (record.coordinates ? `https://www.google.com/maps?q=${record.coordinates.latitude},${record.coordinates.longitude}` : null);
  return href ? <a className="text-link" href={href} target="_blank" rel="noopener noreferrer">View on map <ArrowUpRight size={15}/></a> : null;
}
export function Places({ items }: { items: Place[] }) { return <div className="catalog-places">{items.map((place, index) => <div className="location-row" key={`${place.name}-${index}`}><div><div className="row"><DataIcon name={place.icon} size={18}/><strong>{place.name}</strong></div><small>{place.category}</small>{place.description && <p>{place.description}</p>}</div><div className="catalog-distance">{place.distanceKm !== null && <span>{place.distanceKm} km</span>}{place.travelMinutes !== null && <span>{place.travelMinutes} min{place.travelMode && ` (${place.travelMode})`}</span>}{place.mapUrl && <a href={place.mapUrl} target="_blank" rel="noopener noreferrer" className="text-link">Map <ArrowUpRight size={14}/></a>}</div></div>)}</div>; }
export function Sources({ record }: { record: Pick<PropertyRecord, 'sources' | 'updatedAt'> }) {
  return record.sources.length || record.updatedAt ? <div className="catalog-sources">{record.updatedAt && <p>Updated <time dateTime={record.updatedAt}>{record.updatedAt}</time></p>}{record.sources.map((source, i) => <p key={i}>{source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a> : source.label}{source.checkedAt && ` · Checked ${source.checkedAt}`}</p>)}</div> : null;
}
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
    {!!l.infrastructure.length && <section className="detail-section"><h2>Infrastructure & developments</h2><div className="catalog-infrastructure">{l.infrastructure.map((item, i) => <div key={i}><div className="row"><DataIcon name={item.icon}/><h3>{item.title}</h3><span className="tag">{item.status.replaceAll('-', ' ')}</span></div><p>{item.description}</p>{item.expectedCompletion && <p>Expected completion: {item.expectedCompletion}</p>}{item.sourceUrl && <a className="text-link" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Source <ArrowUpRight size={14}/></a>}</div>)}</div></section>}
    {l.market && <section className="detail-section"><h2>Local market snapshot</h2><p>{l.market.summary}</p><dl className="catalog-market">{l.market.minPricePerSqFtInr !== null && <div><dt>From / sq ft</dt><dd>₹{l.market.minPricePerSqFtInr.toLocaleString('en-IN')}</dd></div>}{l.market.maxPricePerSqFtInr !== null && <div><dt>To / sq ft</dt><dd>₹{l.market.maxPricePerSqFtInr.toLocaleString('en-IN')}</dd></div>}{l.market.rentalYieldPercent !== null && <div><dt>Indicative rental yield</dt><dd>{l.market.rentalYieldPercent}%</dd></div>}</dl>{l.market.asOf && <p>As of {l.market.asOf}</p>}{l.market.sourceUrl && <a className="text-link" href={l.market.sourceUrl} target="_blank" rel="noopener noreferrer">Market source <ArrowUpRight size={14}/></a>}</section>}
    {l.images.length > 1 && <section className="detail-section"><h2>Around {l.name}</h2><div className="catalog-gallery">{l.images.map(image => <button key={image.id} onClick={() => setSelected(image.id)} aria-label={`View ${image.alt}`}><img src={image.src} alt={image.alt} loading="lazy"/><span>{image.caption || image.alt} <Images size={16}/></span></button>)}</div></section>}
    {!!l.faqs.length && <section className="detail-section faq"><h2>Questions about {l.name}</h2>{l.faqs.map((item, i) => <details key={i}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section>}
    <Sources record={l}/><Gallery key={selected} name={l.name} images={l.images} selectedId={selected} onClose={() => setSelected(null)}/>
  </>;
}
