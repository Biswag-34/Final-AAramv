"use client";

import {useId,useRef,useState,type FormEvent,type FocusEvent,type ChangeEvent} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {ArrowUpRight,LoaderCircle} from 'lucide-react';
import {trackEngagement} from '@/lib/engagement';
import {validateEnquiry,ENQUIRY_BUDGETS} from '@/lib/enquiry';
import type {EnquiryDownload} from '@/components/enquiry-context';
import {saveEnquiryReceipt} from '@/lib/enquiry-receipt';

export type EnquiryFormProps={context?:string;compact?:boolean;extended?:boolean;variant?:'header'|'bottom'|'project';project?:string;download?:EnquiryDownload;onSuccess?:()=>void};

export function EnquiryForm({context='Home consultation',compact=false,variant='bottom',project,download,onSuccess}:EnquiryFormProps) {
  const id=useId();
  const router=useRouter();
  const [errors,setErrors]=useState<Record<string,string>>({});
  const [sending,setSending]=useState(false);
  const [submitError,setSubmitError]=useState('');
  const requestId=useRef('');
  const pending=useRef(false);
  const touched=useRef(new Set<string>());
  function validate(form:HTMLFormElement) {
    const data=new FormData(form);
    return validateEnquiry({name:String(data.get('name')||''),phone:String(data.get('phone')||''),email:String(data.get('email')||''),budget:String(data.get('budget')||''),consent:!!data.get('consent')});
  }
  function checkField(event:FocusEvent<HTMLFormElement>|ChangeEvent<HTMLFormElement>) {
    const input=event.target;
    if(!(input instanceof HTMLInputElement||input instanceof HTMLSelectElement))return;
    if(!['name','phone','email','budget','consent'].includes(input.name))return;
    if(event.type==='blur')touched.current.add(input.name);
    if(!touched.current.has(input.name)&&!errors[input.name])return;
    const issue=validate(event.currentTarget)[input.name];
    setErrors(previous=>{const next={...previous};if(issue)next[input.name]=issue;else delete next[input.name];return next;});
  }
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(pending.current)return;
    const form=event.currentTarget;
    const issues=validate(form);
    setErrors(issues);
    ['name','phone','email','budget','consent'].forEach(field=>touched.current.add(field));
    if(Object.keys(issues).length){form.querySelector<HTMLElement>(`[name="${Object.keys(issues)[0]}"]`)?.focus();return;}
    pending.current=true;setSending(true);setSubmitError('');
    const data=new FormData(form);
    if(!requestId.current)requestId.current=crypto.randomUUID();
    const intent=/site.?visit|schedule.*visit|plan.*visit/i.test(context)?'visit':'callback';
    try {
      const response=await fetch('/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...Object.fromEntries(data),consent:!!data.get('consent'),intent,requestId:requestId.current})});
      const result=await response.json();
      if(!response.ok){setErrors(result.errors||{});throw new Error(result.error||'We could not record your request. Please try again.');}
      saveEnquiryReceipt({reference:result.reference,intent,project,download});
      trackEngagement('enquiry_recorded');
      onSuccess?.();
      router.push('/thank-you');
    }catch(error){setSubmitError(error instanceof Error?error.message:'We could not record your request. Please try again.');pending.current=false;setSending(false);}
  }
  const error=(name:string)=>errors[name]?<span className="enquiry-error" id={`${id}-${name}-error`} role="alert">{errors[name]}</span>:null;
  const accessibility=(name:string)=>({'aria-invalid':!!errors[name],'aria-describedby':errors[name]?`${id}-${name}-error`:undefined});
  return <form className={`enquiry-form aaramv-enquiry enquiry-${variant}${compact?' is-compact':''}`} onSubmit={submit} onBlur={checkField} onChange={checkField} noValidate aria-busy={sending}>
    <input type="hidden" name="context" value={context}/>
    <label className="enquiry-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <div className="enquiry-fields">
      <label htmlFor={`${id}-name`}>Name<input id={`${id}-name`} name="name" placeholder="Your full name" autoComplete="name" required maxLength={100} {...accessibility('name')}/>{error('name')}</label>
      <label htmlFor={`${id}-phone`}>Number<input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 mobile number" required maxLength={30} {...accessibility('phone')}/>{error('phone')}</label>
      <label htmlFor={`${id}-email`}><span>Email <small>(optional)</small></span><input id={`${id}-email`} name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} {...accessibility('email')}/>{error('email')}</label>
      <label htmlFor={`${id}-budget`}><span>Budget <small>(optional)</small></span><select id={`${id}-budget`} name="budget" defaultValue="" {...accessibility('budget')}><option value="">Still exploring</option>{ENQUIRY_BUDGETS.map(value=><option key={value}>{value}</option>)}</select>{error('budget')}</label>
      <label className="enquiry-wide" htmlFor={`${id}-interest`}>Looking for{project?<input id={`${id}-interest`} name="interest" value={project} readOnly title={project}/>:<select id={`${id}-interest`} name="interest" defaultValue=""><option value="">Help me decide</option><option>Apartment</option><option>Villa</option><option>Plot</option></select>}</label>
    </div>
    <div className="enquiry-consent-group"><label className="enquiry-consent" htmlFor={`${id}-consent`}><input id={`${id}-consent`} name="consent" type="checkbox" required {...accessibility('consent')}/><span>I agree to be contacted about my enquiry. <Link href="/privacy">Privacy Policy</Link></span></label>{error('consent')}</div>
    {submitError&&<p role="alert" className="enquiry-submit-error">{submitError}</p>}
    <button disabled={sending} className="enquiry-submit" type="submit">{sending?<><LoaderCircle className="enquiry-spinner" size={18}/>Sending…</>:<><span>Let’s <em>Aaramv</em></span><ArrowUpRight size={18}/></>}</button>
  </form>;
}
