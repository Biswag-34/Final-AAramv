'use client';
import {useState} from 'react';
import {Images, ChevronDown} from 'lucide-react';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs';
import {configurationLabel, formatArea, formatInr, type Property} from '@/lib/catalog';

export function PropertyLayouts({p, onImage}: {p: Property; onImage: (id: string) => void}) {
  const groups = [...new Set(p.configurations.toSorted((a, b) => (a.bedrooms ?? Infinity) - (b.bedrooms ?? Infinity)).map(c => configurationLabel(c, p.type)))];
  const [active, setActive] = useState(String(groups[0]));
  const [expanded, setExpanded] = useState(false);
  return <Tabs className="property-layout-tabs" value={active} onValueChange={value => {setActive(value); setExpanded(false);}}>
    <TabsList className="configuration-tabs" aria-label="Home configurations">{groups.map(n => <TabsTrigger key={n} value={n}>{n}</TabsTrigger>)}</TabsList>
    {groups.map(n => {
      const matches = p.configurations.filter(c => configurationLabel(c, p.type) === n);
      const visible = expanded ? matches : matches.slice(0, 4);
      return <TabsContent key={String(n)} value={String(n)}>
        <div className="layout-table-wrap"><table className="floor-plan-table"><caption className="sr-only">{p.name}: {n}</caption><thead><tr><th scope="col">Home configuration</th><th scope="col">Area</th><th scope="col">Starting price</th><th scope="col">Plan</th></tr></thead><tbody>{visible.map(c => <tr key={c.id}><th scope="row"><strong>{configurationLabel(c, p.type)}</strong><small className="catalog-unit-note">{c.label}</small><small className="catalog-unit-note">{c.bathrooms !== null && `${c.bathrooms} bath / `}{c.availability.replaceAll('-', ' ')}</small></th><td><strong>{formatArea(c.areaSqFt)}</strong><small className="catalog-unit-note">{c.areaBasis === 'unspecified' ? 'Area basis on request' : c.areaBasis.replaceAll('-', ' ') + ' area'}</small></td><td><strong>{formatInr(c.startingPriceInr)}</strong>{c.priceNote && <small className="catalog-unit-note">{c.priceNote}</small>}</td><td>{c.floorPlanImageId ? <button className="circle floor-plan-button" title={`View ${c.label} floor plan`} aria-label={`View ${c.label} floor plan`} onClick={() => onImage(c.floorPlanImageId!)}><Images size={18}/></button> : <span className="plan-unavailable" aria-label="Floor plan on request">-</span>}</td></tr>)}</tbody></table></div>
        <div className="layout-mobile-list">{visible.map(c => <article className="layout-mobile-row" key={c.id}><div><h3>{c.label}</h3><span>{c.availability.replaceAll('-', ' ')}</span></div><dl><div><dt>Area</dt><dd>{formatArea(c.areaSqFt)}<small>{c.areaBasis === 'unspecified' ? 'Area basis on request' : c.areaBasis.replaceAll('-', ' ') + ' area'}</small></dd></div><div><dt>Starting price</dt><dd>{formatInr(c.startingPriceInr)}</dd></div></dl>{c.priceNote && <p>{c.priceNote}</p>}{c.floorPlanImageId && <button className="btn outline small" onClick={() => onImage(c.floorPlanImageId!)}><Images size={16}/>View floor plan</button>}</article>)}</div>
        {matches.length > 4 && <button className="btn outline small layout-more" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Show fewer layouts' : `Show all ${matches.length} layouts`}<ChevronDown size={16}/></button>}
      </TabsContent>;
    })}
  </Tabs>;
}
