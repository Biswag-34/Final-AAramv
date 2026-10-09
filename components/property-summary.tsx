import {propertyPriceSummary, mapEmbedUrl, type Property} from '@/lib/catalog';

export function PropertyPrice({p}: {p: Property}) {
  const summary = propertyPriceSummary(p);
  return <div className="property-price-copy"><strong>{summary.label}</strong><small>{summary.note}</small></div>;
}

export function PropertyMap({p}: {p: Property}) {
  const src = mapEmbedUrl(p);
  return src ? <div className="property-map"><iframe src={src} title={`${p.name} location map`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/><small>{p.coordinates ? 'Project location from recorded coordinates.' : 'Map search based on the recorded project address.'}</small></div> : null;
}
