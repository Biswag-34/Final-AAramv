'use client';

import {useId, useRef, useState, type FormEvent} from 'react';
import Link from 'next/link';
import {CheckCircle2, Phone, MapPin, ArrowRight, ArrowUpRight, Compass} from 'lucide-react';
import {toast} from 'sonner';
import {trackEngagement} from '@/lib/engagement';
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
  const [reference, setReference] = useState('');
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const requestId = useRef('');
  const header = variant === 'header';
  const sidebar = compact && variant === 'project';
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
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
    setSubmitError(''); setSending(true);
    if (!requestId.current) requestId.current = crypto.randomUUID();
    try {
      const response = await fetch('/api/enquiries', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...Object.fromEntries(data), consent: !!data.get('consent'), intent, requestId: requestId.current})});
      const result = await response.json();
      if (!response.ok) {setErrors(result.errors || {});throw new Error(result.error || 'We could not record your request. Please try again.');}
      setReference(result.reference); setDone(intent); trackEngagement('enquiry_recorded');
      toast.success('Your request is recorded', {description: `Reference: ${result.reference}`, id: 'enquiry-feedback'});
    } catch (error) {const message = error instanceof Error ? error.message : 'We could not record your request. Please try again.';setSubmitError(message);toast.error(message, {id: 'enquiry-feedback'});}
    finally {setSending(false);}
  }
  function error(name: string) {
    return errors[name] ? <span className="enquiry-error" id={`${id}-${name}-error`}>{errors[name]}</span> : null;
  }
  if (done) return <div className={sidebar ? 'form-success' : 'enquiry-success'} role="status"><CheckCircle2 size={34}/><h3>Your request is recorded.</h3><p>Your {done === 'visit' ? 'site-visit' : 'callback'} request has been recorded.<br/><strong>{reference}</strong><br/>Keep this reference for your next conversation. Site access and appointment timing are arranged separately.</p><button type="button" className={sidebar ? 'btn outline' : 'enquiry-button callback'} onClick={() => {setDone(''); setErrors({}); requestId.current = ''; setSubmitError('');}}>Start another enquiry <ArrowRight size={17}/></button></div>;
  if (sidebar) return <form className="cta-form" onSubmit={submit} noValidate>
    <input type="hidden" name="context" value={context}/><label className="enquiry-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label><input type="hidden" name="interest" value={project || context}/>
    <div className="form-grid">
      <label className="field span2" htmlFor={`${id}-name`}>Your name<input id={`${id}-name`} name="name" placeholder="Full name" autoComplete="name" required minLength={2} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${id}-name-error` : undefined}/>{error('name')}</label>
      <label className="field span2" htmlFor={`${id}-phone`}>Mobile number<input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Include your country code" required aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${id}-phone-error` : undefined}/>{error('phone')}</label>

      <div className="field span2"><span id={`${id}-budget-label`}>My budget</span><Select name="budget"><SelectTrigger className="custom-select" aria-labelledby={`${id}-budget-label`}><SelectValue placeholder="Still exploring"/></SelectTrigger><SelectContent position="popper">{['Under ₹1 Cr', '₹1–2 Cr', '₹2–3 Cr', 'Above ₹3 Cr', 'Still exploring'].map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
    </div>
    <label className="consent" htmlFor={`${id}-consent`}><Checkbox id={`${id}-consent`} name="consent" required aria-label="Consent to contact" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? `${id}-consent-error` : undefined}/><span>I agree to be contacted about this property enquiry. Read the <Link href="/privacy" style={{textDecoration: 'underline'}}>Privacy Policy</Link>.</span></label>
    {error('consent')}
    {submitError && <p role="alert" className="enquiry-submit-error">{submitError}</p>}
    <div className="form-actions"><button disabled={sending} className="btn primary" type="submit" name="action" value="callback">{sending ? 'Recording…' : 'Request a callback'} <ArrowUpRight size={16}/></button></div>
  </form>;
  return <form className={`enquiry-form enquiry-${variant}${compact ? ' is-compact' : ''}`} onSubmit={submit} noValidate>
    <input type="hidden" name="context" value={context}/><label className="enquiry-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <div className="enquiry-fields">
      <label htmlFor={`${id}-name`}>{header ? 'Name' : 'Your name'}<input id={`${id}-name`} name="name" placeholder="Full name" autoComplete="name" required minLength={2} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${id}-name-error` : undefined}/>{error('name')}</label>
      <label htmlFor={`${id}-phone`}>{header ? 'Mobile Number' : 'Mobile number'}<input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Include your country code" required aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${id}-phone-error` : undefined}/>{error('phone')}</label>
      {extended && <label htmlFor={`${id}-email`}>Email optional<input id={`${id}-email`} name="email" type="email" autoComplete="email" placeholder="Your email address" aria-invalid={!!errors.email}/>{error('email')}</label>}
      <label htmlFor={`${id}-interest`}>I am looking for{project ? <input id={`${id}-interest`} name="interest" value={project} readOnly title={project}/> : <select id={`${id}-interest`} name="interest" defaultValue=""><option value="">Help me decide</option><option>Apartment</option><option>Villa</option><option>Plot</option></select>}</label>
      {variant === 'project' && <label htmlFor={`${id}-preferredDate`}>Preferred visit date (optional)<input id={`${id}-preferredDate`} name="preferredDate" type="date" aria-invalid={!!errors.preferredDate}/>{error('preferredDate')}</label>}
      {!header && <label className="enquiry-wide" htmlFor={`${id}-budget`}>My budget<select id={`${id}-budget`} name="budget" defaultValue=""><option value="">Still exploring</option>{['Under ₹1 Cr', '₹1–2 Cr', '₹2–3 Cr', 'Above ₹3 Cr'].map(value => <option key={value}>{value}</option>)}</select></label>}
      {extended && <label className="enquiry-wide" htmlFor={`${id}-message`}>What matters most?<textarea id={`${id}-message`} name="message" rows={3} placeholder="For example, your work location, extra room, budget limit or intended move."/></label>}
    </div>
    <label className="enquiry-consent" htmlFor={`${id}-consent`}><input id={`${id}-consent`} name="consent" type="checkbox" required aria-invalid={!!errors.consent} aria-describedby={errors.consent ? `${id}-consent-error` : undefined}/><span>I agree to be contacted about this property enquiry. <Link href="/privacy">Privacy Policy</Link></span></label>
    {error('consent')}
    {submitError && <p role="alert" className="enquiry-submit-error">{submitError}</p>}
    <p className="visit-request-note">Your site visit is confirmed only after access and timing are agreed.</p><div className="enquiry-actions"><button disabled={sending} className="enquiry-button callback" type="submit" name="action" value="callback"><Phone size={16}/><span>{sending ? 'Recording…' : 'Request a callback'}</span></button><button disabled={sending} className="enquiry-button visit" type="submit" name="action" value="visit"><MapPin size={16}/><span>{sending ? 'Recording…' : 'Request a site visit'}</span></button></div>
  </form>;
}
