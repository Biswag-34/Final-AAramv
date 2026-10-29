import {ArrowUpRight, FileText} from 'lucide-react';
import {formatArea, formatInr, type Property} from '@/lib/catalog';

export function ProjectPricing({p}: {p: Property}) {
  const quotes = p.pricing?.quotes;
  if (!quotes?.length) return null;
  return <section className="detail-section project-price-options"><h2>Prices by home format</h2><div className="research-price-grid">{quotes.map((quote, i) => <article key={i}><span>{quote.label}</span><strong>{formatInr(quote.startingPriceInr)}<small> Onward</small></strong>{quote.areaSqFt !== null && <p>{quote.areaMaxSqFt ? `${quote.areaSqFt.toLocaleString('en-IN')}–${quote.areaMaxSqFt.toLocaleString('en-IN')} sq ft` : formatArea(quote.areaSqFt)}{quote.areaBasis && ` · ${quote.areaBasis.replaceAll('-', ' ')}`}</p>}{quote.phaseName&&<p>{quote.phaseName}</p>}<span className="research-price-type">{quote.basis === 'developer-published' ? 'Developer price' : /resale/i.test(quote.label+' '+quote.basis) ? 'Resale' : 'Listed price'}</span></article>)}</div></section>;
}

export function ProjectDocuments({p}: {p: Property}) {
  const documents = p.documents.filter(d => 'title' in d);
  return <>{!!p.otherProductFamilies?.length&&<section className="detail-section"><h2>More home formats</h2><div className="research-price-grid">{p.otherProductFamilies.map((format,i)=><article key={i}><span>{format.type}</span><h3>{format.configuration}</h3><p>{formatArea(format.superBuiltUpAreaSqFt)} super built-up</p><p>{formatArea(format.reraCarpetAreaSqFt)} RERA carpet</p></article>)}</div></section>}{p.plotSizeSchedule?.publishedRangeSqFt&&<section className="detail-section"><h2>Plot sizes</h2><p>{formatArea(p.plotSizeSchedule.publishedRangeSqFt.min)} – {formatArea(p.plotSizeSchedule.publishedRangeSqFt.max)}</p></section>}{!!documents.length&&<section className="detail-section"><h2>Project brochures</h2><div className="research-documents">{documents.map((doc,i)=>'title' in doc&&<a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"><FileText size={21}/><span>{doc.title}</span><ArrowUpRight size={18}/></a>)}</div></section>}</>;
}
