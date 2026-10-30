'use client';
import {EditorialHeading} from '@/components/editorial-heading';
import {EnquiryButton} from '@/components/enquiry-context';


import Link from 'next/link';
import {ArrowUpRight, Calculator, MapPin, FileCheck2} from 'lucide-react';
import {propertyPriceSummary, type Property} from '@/lib/catalog';

export function ProjectResearchDesk({p}: {p:Property}) {
  const amount=propertyPriceSummary(p).min;
  return <section className="detail-section project-research-desk" id="research-desk">
    <div className="research-desk-heading"><span className="detail-kicker">Make your research useful</span><EditorialHeading as="h2">Three things to <em>bring into focus.</em></EditorialHeading><p>Take the next step with a budget, a route and the right questions.</p></div>
    <div className="research-desk-grid">
      <Link href={amount?`/tools?tool=emi&price=${amount}`:'/tools?tool=emi'}><Calculator size={22}/><EditorialHeading as="h3">Monthly budget</EditorialHeading><p>Estimate repayments with your own loan assumptions.</p><span className="research-desk-link">Plan your budget <ArrowUpRight size={15}/></span></Link>
      <Link href={`/localities/${p.localityId}`}><MapPin size={22}/><EditorialHeading as="h3">Your locality</EditorialHeading><p>Check daily essentials and routes in {p.locality}.</p><span className="research-desk-link">Explore the area <ArrowUpRight size={15}/></span></Link>
      <Link href="/guides#cost-sheet"><FileCheck2 size={22}/><EditorialHeading as="h3">Complete cost</EditorialHeading><p>Review unit costs, charges and payment milestones.</p><span className="research-desk-link">Read the guide <ArrowUpRight size={15}/></span></Link>
    </div>
    <EnquiryButton className="text-link" context={`Talk through details: ${p.name}`} project={p.name}>Talk through details <ArrowUpRight size={16}/></EnquiryButton>
  </section>;
}
