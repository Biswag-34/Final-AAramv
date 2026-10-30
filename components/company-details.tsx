
import {EditorialHeading} from '@/components/editorial-heading';
import {Building2, MapPin, FileText, Handshake} from 'lucide-react';
import {businessDetails as business} from '@/lib/business-details';
import {localities} from '@/app/data';

export function CompanyDetails() {
  const coverage = [...new Set(localities.map(l => l.zone))].join(' · ');
  return <section className="company-details-panel" aria-labelledby="company-details-title"><EditorialHeading as="h2" id="company-details-title">Company details.</EditorialHeading><dl>
    <div><dt><Building2 size={18}/>Our role</dt><dd>{business.tradingName} · Bengaluru real estate channel partner</dd></div>
    {business.legalName && <div><dt>Legal entity</dt><dd>{business.legalName}</dd></div>}
    <div><dt><MapPin size={18}/>Current catalogue</dt><dd>{coverage}</dd></div>
    {business.address && <div><dt>Office address</dt><dd>{business.address}</dd></div>}
    {business.agentRegistration && <div><dt><FileText size={18}/>Agent registration</dt><dd>{business.agentRegistration}</dd></div>}
    <div><dt><Handshake size={18}/>Fees & commission</dt><dd>{business.feePolicy || 'Request a written, transaction-specific fee and commission disclosure before committing.'}</dd></div>
  </dl></section>;
}

export function FooterBusinessDetails() {
  return <div className="footer-business-details">
    {business.legalName && <p>{business.legalName}</p>}
    {business.phone && <a href={`tel:+91${business.phone}`}>+91 {business.phone.slice(0,5)} {business.phone.slice(5)}</a>}
    {business.email && <a href={`mailto:${business.email}`}>{business.email}</a>}
    <p>{business.address || 'Bengaluru, Karnataka'}</p>
    {business.agentRegistration && <p>Agent registration: {business.agentRegistration}</p>}
    <p>Real estate channel partner</p>
  </div>;
}
