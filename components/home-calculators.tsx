'use client';
import {EditorialHeading} from '@/components/editorial-heading';


import {useEffect, useState} from 'react';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {ArrowRight} from 'lucide-react';
import {monthlyPayment, netRentalYield} from '@/lib/home-calculators';

const tools = [['emi','Monthly EMI'],['cost','Total purchase cost'],['yield','Rental yield']] as const;
type Tool = typeof tools[number][0];
const money = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export function HomeCalculators() {
  const params=useSearchParams(), router=useRouter();
  const requested=params.get('tool'), tool:Tool=requested==='cost'||requested==='yield'?requested:'emi';
  const validPrice=()=>{const n=Number(params.get('price'));return Number.isFinite(n)&&n>0?Math.min(1000000000,n):10000000;};
  const [cost,setCost]=useState(String(validPrice())), [down,setDown]=useState('2000000'), [rate,setRate]=useState('8.5'), [years,setYears]=useState('20'), [extras,setExtras]=useState('0'), [rent,setRent]=useState(''), [expenses,setExpenses]=useState('0');
  const suppliedPrice=params.get('price');
  useEffect(()=>{if(suppliedPrice){const n=Number(suppliedPrice);if(Number.isFinite(n)&&n>0){setCost(String(Math.min(1000000000,n)));setDown(previous=>String(Math.min(Number(previous),n)));}}},[suppliedPrice]);
  const n=(s:string)=>s.trim()===''?NaN:Number(s);
  const loan=monthlyPayment(n(cost),n(down),n(rate),n(years));
  const validCost=Number.isFinite(n(cost))&&n(cost)>0&&n(cost)<=1000000000;
  const validExtras=Number.isFinite(n(extras))&&n(extras)>=0&&n(extras)<=1000000000;
  const rental=netRentalYield(n(cost),n(extras),rent===''?null:n(rent),n(expenses));
  const allFields=[
    {id:'price',label:'Home price (₹)',value:cost,set:setCost,min:1,max:1000000000,money:true},
    ...(tool==='emi'?[{id:'down',label:'Down payment (₹)',value:down,set:setDown,min:0,max:n(cost),money:true},{id:'rate',label:'Interest per year (%)',value:rate,set:setRate,min:0,max:30,money:false},{id:'years',label:'Loan term (years)',value:years,set:setYears,min:1,max:40,money:false}]:[{id:'extras',label:'Additional purchase costs (₹)',value:extras,set:setExtras,min:0,max:1000000000,money:true}]),
    ...(tool==='yield'?[{id:'rent',label:'Monthly rent (₹)',value:rent,set:setRent,min:0,max:10000000,money:true},{id:'expenses',label:'Annual property expenses (₹)',value:expenses,set:setExpenses,min:0,max:100000000,money:true}]:[]),
  ];
  const fieldsValid=allFields.every(f=>Number.isFinite(n(f.value))&&n(f.value)>=f.min&&n(f.value)<=f.max);
  function selectTool(next:Tool){const query=new URLSearchParams(params.toString());query.set('tool',next);router.replace(`/tools?${query}`,{scroll:false});}
  return <main className="inner buyer-page calculator-page"><div className="wrap"><div className="inner-head"><div className="eyebrow">Make room for the numbers</div><EditorialHeading as="h1">Plan your home budget.</EditorialHeading><p>Explore one decision at a time using your own assumptions.</p></div>
    <div className="calculator-tabs" role="tablist" aria-label="Home calculators" onKeyDown={e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const index=tools.findIndex(([id])=>id===tool);const next=e.key==='Home'?0:e.key==='End'?2:(index+(e.key==='ArrowRight'?1:2))%3;selectTool(tools[next][0]);e.currentTarget.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();}}}>{tools.map(([id,label])=><button key={id} id={`tab-${id}`} role="tab" aria-selected={tool===id} aria-controls={`calculator-${tool}`} tabIndex={tool===id?0:-1} onClick={()=>selectTool(id)}>{label}</button>)}</div>
    <section id={`calculator-${tool}`} role="tabpanel" aria-labelledby={`tab-${tool}`} className="calculator-layout"><form className="calculator-fields" onSubmit={e=>e.preventDefault()}><EditorialHeading as="h2">{tool==='emi'?'Your loan assumptions':tool==='cost'?'Your purchase assumptions':'Your rental assumptions'}</EditorialHeading>{allFields.map(f=>{const invalid=f.value!==''&&(!Number.isFinite(n(f.value))||n(f.value)<f.min||n(f.value)>f.max);return <label htmlFor={`calc-${f.id}`} key={f.id}>{f.label}<input id={`calc-${f.id}`} aria-label={f.label} type="number" inputMode="decimal" min={f.min} max={f.max} step={f.id==='rate'?'.05':'1'} value={f.value} aria-invalid={invalid} aria-describedby={`calc-${f.id}-help`} placeholder={f.id==='rent'?'Enter expected monthly rent':undefined} onChange={e=>f.set(e.target.value)}/><small id={`calc-${f.id}-help`} className={invalid?'enquiry-error':undefined}>{invalid?`Enter a value between ${f.money?money(f.min):f.min} and ${f.money?money(f.max):f.max}.`:f.money&&f.value!==''&&Number.isFinite(n(f.value))?money(n(f.value)):f.id==='rent'?'Enter rent to calculate a yield.':f.id==='rate'?'Fixed annual rate, applied to monthly repayments.':f.id==='years'?'Repayment period in years.':'Use your own assumption.'}</small></label>;})}</form>
    <div className="calculator-results" aria-live="polite" aria-atomic="true">{tool==='emi'?<article><span>Estimated monthly EMI</span><strong>{fieldsValid&&loan?money(loan.monthly):'Check your inputs'}</strong>{fieldsValid&&loan&&<><small>Loan principal {money(loan.principal)}</small><p>{rate}% annual interest · {years} years · monthly repayments</p><dl><div><dt>Down payment</dt><dd>{money(n(down))}</dd></div><div><dt>Interest over the term</dt><dd>{money(loan.interest)}</dd></div></dl></>}</article>:tool==='cost'?<article><span>Estimated purchase cost</span><strong>{validCost&&validExtras?money(n(cost)+n(extras)):'Check your inputs'}</strong>{validCost&&validExtras&&<><dl><div><dt>Home price</dt><dd>{money(n(cost))}</dd></div><div><dt>Additional costs entered</dt><dd>{money(n(extras))}</dd></div></dl><p>{n(extras)===0?'You assumed ₹0 in additional costs. This is not an all-inclusive quote.':'Only the additional costs you entered are included.'}</p></>}</article>:<article><span>Net annual rental yield</span><strong>{rent===''?'Enter monthly rent':fieldsValid&&rental!==null?`${rental.toFixed(2)}%`:'Check your inputs'}</strong><p>{rent===''?'Add your rent assumption to see an estimate.':'(Annual rent − entered annual expenses) ÷ (home price + additional costs) × 100.'}</p><small>Vacancy, financing costs, taxes and maintenance are excluded unless included in your entered expenses. This is not a rental forecast.</small></article>}
    <p className="calculator-note">Planning estimates based on the assumptions shown. Loan terms, rate changes and costs not entered are excluded.</p>{validCost&&<Link className="btn primary" href={`/properties?budget=${(n(cost)/10000000).toFixed(4)}`}>Browse homes within {money(n(cost))} <ArrowRight size={17}/></Link>}<Link className="text-link" href="/contact">Talk through your budget <ArrowRight size={16}/></Link></div></section>
  </div></main>;
}
