'use client';

import {useId, useState, type FormEvent} from 'react';
import Link from 'next/link';
import {CheckCircle2, Phone, MapPin, ArrowRight, ArrowUpRight, Compass} from 'lucide-react';
import {toast} from 'sonner';
import {validateEnquiry} from '@/lib/enquiry';
import {Checkbox} from '@/components/ui/checkbox';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

export type EnquiryFormProps = {
  context?: string;
  compact?: boolean;
  extended?: boolean;
  variant?: 'header' | 'bottom' | 'project';
  project?: string;
};

export function EnquiryForm({context = 'Home consultation', compact = false, extended = false, variant = 'bottom', project}: EnquiryFormProps) {
  const id = useId();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState('');
  const header = variant === 'header';
  const sidebar = compact && variant === 'project';
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const issues = validateEnquiry({name: String(data.get('name') || ''), phone: String(data.get('phone') || ''), email: String(data.get('email') || ''), consent: !!data.get('consent')});
    setErrors(issues);
    if (Object.keys(issues).length) {
      toast.error('A little detail needs attention', {description: Object.values(issues)[0], id: 'enquiry-feedback'});
      form.querySelector<HTMLElement>(`[name="${Object.keys(issues)[0]}"]`)?.focus();
      return;
    }
    const intent = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') || 'callback';
    setDone(intent);
    toast.success('Your details are ready', {description: 'Preview only: this request has not been sent or stored.', id: 'enquiry-feedback'});
  }
  function error(name: string) {
    return errors[name] ? <span className="enquiry-error" id={`${id}-${name}-error`}>{errors[name]}</span> : null;
  }
  if (done) return <div className={sidebar ? 'form-success' : 'enquiry-success'} role="status"><CheckCircle2 size={34}/><h3>Your next step is ready.</h3><p>This website currently previews enquiries. Your {done === 'visit' ? 'site visit' : 'callback'} request has not been sent or stored.</p><button type="button" className={sidebar ? 'btn outline' : 'enquiry-button callback'} onClick={() => {setDone(''); setErrors({});}}>Start another enquiry <ArrowRight size={17}/></button></div>;
  if (sidebar) return <form className="cta-form" onSubmit={submit} noValidate>
    <input type="hidden" name="context" value={context}/>
    <div className="form-grid">
      <label className="field span2" htmlFor={`${id}-name`}>Your name<input id={`${id}-name`} name="name" placeholder="Full name" autoComplete="name" required minLength={2} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${id}-name-error` : undefined}/>{error('name')}</label>
      <label className="field span2" htmlFor={`${id}-phone`}>Mobile number<input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 Mobile number" required aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${id}-phone-error` : undefined}/>{error('phone')}</label>
      <label className="field span2" htmlFor={`${id}-email`}>Email<input id={`${id}-email`} name="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? `${id}-email-error` : undefined}/>{error('email')}</label>
      <label className="field span2" htmlFor={`${id}-interest`}>I’m looking for<input id={`${id}-interest`} name="interest" value={project || context} readOnly title={project || context}/></label>
      <div className="field span2"><span id={`${id}-budget-label`}>My budget</span><Select name="budget"><SelectTrigger className="custom-select" aria-labelledby={`${id}-budget-label`}><SelectValue placeholder="Select your budget"/></SelectTrigger><SelectContent position="popper">{['Under ₹1 Cr', '₹1–2 Cr', '₹2–3 Cr', 'Above ₹3 Cr', 'Still exploring'].map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
    </div>
    <label className="consent" htmlFor={`${id}-consent`}><Checkbox id={`${id}-consent`} name="consent" required aria-label="Consent to contact" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? `${id}-consent-error` : undefined}/><span>I agree to be contacted about my property enquiry. Read the <Link href="/privacy" style={{textDecoration: 'underline'}}>privacy policy</Link>.</span></label>
    {error('consent')}
    <div className="form-actions"><button className="btn primary" type="submit" name="action" value="callback">Request a callback <ArrowUpRight size={16}/></button><button className="btn outline site-visit" type="submit" name="action" value="visit">Plan a site visit <Compass size={16}/></button></div>
  </form>;
  return <form className={`enquiry-form enquiry-${variant}${compact ? ' is-compact' : ''}`} onSubmit={submit} noValidate>
    <input type="hidden" name="context" value={context}/>
    <div className="enquiry-fields">
      <label htmlFor={`${id}-name`}>{header ? 'Name' : 'Your name'}<input id={`${id}-name`} name="name" placeholder="Full name" autoComplete="name" required minLength={2} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${id}-name-error` : undefined}/>{error('name')}</label>
      <label htmlFor={`${id}-phone`}>{header ? 'Mobile Number' : 'Mobile number'}<input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 Mobile number" required aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${id}-phone-error` : undefined}/>{error('phone')}</label>
      <label htmlFor={`${id}-email`}>{header || variant === 'project' ? 'Email' : 'Email (opt)'}<input id={`${id}-email`} name="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? `${id}-email-error` : undefined}/>{error('email')}</label>
      <label htmlFor={`${id}-interest`}>I’m looking for{project ? <input id={`${id}-interest`} name="interest" value={project} readOnly title={project}/> : <select id={`${id}-interest`} name="interest" defaultValue=""><option value="">Help me decide</option><option>Apartment</option><option>Villa</option><option>Plot</option></select>}</label>
      {!header && <label className="enquiry-wide" htmlFor={`${id}-budget`}>My budget<select id={`${id}-budget`} name="budget" defaultValue=""><option value="">Still exploring</option>{['Under ₹1 Cr', '₹1–2 Cr', '₹2–3 Cr', 'Above ₹3 Cr'].map(value => <option key={value}>{value}</option>)}</select></label>}
      {extended && <label className="enquiry-wide" htmlFor={`${id}-message`}>Anything else we should know?<textarea id={`${id}-message`} name="message" rows={3} placeholder="Preferred area, timeline, or questions"/></label>}
    </div>
    <label className="enquiry-consent" htmlFor={`${id}-consent`}><input id={`${id}-consent`} name="consent" type="checkbox" required aria-invalid={!!errors.consent} aria-describedby={errors.consent ? `${id}-consent-error` : undefined}/><span>I agree to be contacted about my property enquiry. <Link href="/privacy">Privacy policy</Link></span></label>
    {error('consent')}
    <div className="enquiry-actions"><button className="enquiry-button callback" type="submit" name="action" value="callback"><Phone size={16}/><span>Request a callback</span></button><button className="enquiry-button visit" type="submit" name="action" value="visit"><MapPin size={16}/><span>Plan a site visit</span></button></div>
  </form>;
}
