'use client';
import {EnquiryButton} from '@/components/enquiry-context';
import {EditorialHeading} from '@/components/editorial-heading';

import {ArrowUpRight, FileText, Download} from 'lucide-react';
import {formatArea, propertyPriceSummary, type Property} from '@/lib/catalog';

export function ProjectPricing({p,onEnquire}: {p: Property;onEnquire:(context:string,project?:string)=>void}) {
  return <section className="detail-section project-price-options" id="pricing"><div><span className="overview-kicker">YOUR NEXT CHAPTER, CLEARLY PRICED</span><EditorialHeading as="h2">Price &amp; availability</EditorialHeading><strong className="project-onward-price">{propertyPriceSummary(p).label}</strong></div><button type="button" className="btn primary" onClick={()=>onEnquire(`Price and availability enquiry: ${p.name}`,p.name)}>Enquire <ArrowUpRight size={17}/></button></section>;
}

export function ProjectDocuments({p}: {p: Property}) {
  const documents=p.documents.flatMap((doc,index)=>doc.url?[{title:'title' in doc?doc.title:doc.label,url:doc.url,index}]:[]);
  return <>{!!p.otherProductFamilies?.length&&<section className="detail-section"><EditorialHeading as="h2">More home formats</EditorialHeading><div className="research-price-grid">{p.otherProductFamilies.map((format,i)=><article key={i}><span>{format.type}</span><EditorialHeading as="h3">{format.configuration}</EditorialHeading><p>{formatArea(format.superBuiltUpAreaSqFt)} super built-up</p><p>{formatArea(format.reraCarpetAreaSqFt)} RERA carpet</p></article>)}</div></section>}{p.plotSizeSchedule?.publishedRangeSqFt&&<section className="detail-section"><EditorialHeading as="h2">Plot sizes</EditorialHeading><p>{formatArea(p.plotSizeSchedule.publishedRangeSqFt.min)} – {formatArea(p.plotSizeSchedule.publishedRangeSqFt.max)}</p></section>}{!!documents.length&&<section className="detail-section project-brochure-section" id="brochures"><div className="brochure-section-heading"><span className="brochure-icon"><FileText size={28}/></span><div><span className="overview-kicker">TAKE A CLOSER LOOK</span><EditorialHeading as="h2">Project brochures</EditorialHeading><p>Keep the project details and plans at hand.</p></div></div><div className="brochure-download-list">{documents.map(doc=><article key={doc.index}><div><span className="brochure-file-label">PDF DOCUMENT</span><EditorialHeading preserve as="h3">{p.name}{documents.length>1?` · ${doc.index+1}`:''}</EditorialHeading><p>{doc.title}</p></div><EnquiryButton className="btn primary brochure-download" context={`Download brochure: ${p.name}`} project={p.name} download={{url:`/api/brochures/${p.id}/${doc.index}`,filename:`${p.id}-brochure-${doc.index+1}.pdf`}}><Download size={17}/>Download brochure</EnquiryButton><a className="brochure-source" href={doc.url} target="_blank" rel="noreferrer">Open original <ArrowUpRight size={14}/></a></article>)}</div></section>}</>;
}
