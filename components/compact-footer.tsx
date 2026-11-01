import Link from 'next/link';
import {Phone,Mail} from 'lucide-react';
import {Brand} from '@/components/brand';
import {businessDetails} from '@/lib/business-details';

export function CompactFooter() {
  return <footer className="r-footer compact-footer"><div className="r-wrap">
    <div className="compact-footer-intro"><Brand className="r-brand"/><p>Buyer-first property guidance in Bengaluru.<br/>A researched shortlist and support through move-in.</p></div>
    <nav className="r-footer-nav" aria-label="Footer navigation">
      <div><h2>Find your place</h2><Link href="/properties">All properties</Link><Link href="/properties?status=Ready%20to%20move">Ready to move</Link><Link href="/localities">Neighbourhoods</Link><Link href="/shortlist">Saved homes</Link><Link href="/compare">Compare homes</Link></div>
      <div><h2>Meet Aaramv</h2><Link href="/about">Our story</Link><Link href="/contact">Speak to an advisor</Link><Link href="/guides">Buyer guides</Link><Link href="/tools">Home calculators</Link></div>
    </nav>
    <div className="compact-footer-icons" aria-label="Contact Aaramv">
      {businessDetails.phone&&<a href={`tel:+91${businessDetails.phone}`} aria-label={`Call Aaramv on +91 ${businessDetails.phone}`}><Phone size={21}/></a>}
      {businessDetails.email&&<a href={`mailto:${businessDetails.email}`} aria-label={`Email ${businessDetails.email}`}><Mail size={21}/></a>}
      <span role="img" aria-label="Instagram"><svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></span><span role="img" aria-label="Facebook"><svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path d="M14.5 22v-9h3l.5-4h-3.5V6.5c0-1.1.3-1.7 1.8-1.7H18V1.2A22 22 0 0 0 15 1c-3.1 0-5 1.9-5 5.2V9H7v4h3v9z"/></svg></span>
    </div>
    <div className="r-footer-bottom"><span>© 2026 Aaramv Realty · Bengaluru</span></div>
  </div></footer>;
}
