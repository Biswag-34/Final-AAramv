import propertyRecords from '@/data/properties.json';
import localityRecords from '@/data/localities.json';
import { catalogSchema } from '@/lib/catalog-schema';
import { createCatalog, formatPrice } from '@/lib/catalog';

const catalog = createCatalog(catalogSchema.parse({ properties: propertyRecords, localities: localityRecords }));
export const properties = catalog.properties;
export const localities = catalog.localities;
export type { Property } from '@/lib/catalog';
export const price = formatPrice;
export const img = (name: string) => name.startsWith('/') || name.startsWith('https://') ? name : `/images/${name}.jpg`;

export const steps=[
['Search & shortlist','We start with your budget, location preferences and how you want to live. Then we help you compare a focused selection, including the trade-offs.','Your Aaramv guide: a shortlist built around your brief.'],
['Visit & experience','Walk through your shortlisted homes, inspect the surroundings and ask the questions that photographs cannot answer. We coordinate the visits and organise your observations.','Your Aaramv guide: coordinated visits and a clear comparison.'],
['Plan your finances','Understand the complete cost sheet, payment schedule and available financing options. We coordinate with lenders; eligibility and sanction remain with the lender.','Your Aaramv guide: loan coordination and cost clarity.'],
['Review the paperwork','Bring project approvals, RERA details, title documents and agreements together for review by an independent qualified legal professional.','Your Aaramv guide: documentation coordination and legal referrals.'],
['Book with confidence','Review the selected unit, price, written commitments, cancellation terms and payment milestones before you make a booking decision.','Your Aaramv guide: booking coordination and milestone tracking.'],
['Possession & beyond','Stay informed through construction updates, handover checks and possession documentation. We help coordinate the final steps with the developer.','Your Aaramv guide: one point of contact through handover.']
];
