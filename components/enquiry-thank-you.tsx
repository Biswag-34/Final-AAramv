'use client';

import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Check,Download,Phone} from 'lucide-react';
import {EditorialHeading} from '@/components/editorial-heading';
import {readEnquiryReceipt,consumeEnquiryDownload,type EnquiryReceipt} from '@/lib/enquiry-receipt';

export function EnquiryThankYou(){
  const [receipt,setReceipt]=useState<EnquiryReceipt|null>(null);
  const [downloadState,setDownloadState]=useState<'idle'|'loading'|'done'|'error'>('idle');
  const started=useRef(false);
  async function downloadBrochure(info:NonNullable<EnquiryReceipt['download']>){
    if(!/^\/api\/brochures\/[a-z0-9-]+\/\d+$/.test(info.url))return;
    setDownloadState('loading');
    try{
      const response=await fetch(info.url);
      if(!response.ok)throw new Error('Download unavailable');
      const blob=await response.blob();
      if(!blob.size)throw new Error('Empty file');
      const url=URL.createObjectURL(blob),link=document.createElement('a');
      link.href=url;link.download=info.filename;document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),60000);setDownloadState('done');
    }catch{setDownloadState('error');}
  }
  useEffect(()=>{
    if(started.current)return;started.current=true;
    const saved=readEnquiryReceipt();setReceipt(saved);
    if(saved?.download){consumeEnquiryDownload();void downloadBrochure(saved.download);}
  },[]);
  return <main className="inner thank-you-page"><div className="wrap"><section className="thank-you-card"><span className="thank-you-mark" aria-hidden="true"><Check size={32}/></span><p className="thank-you-kicker">A little closer to your next beginning</p><EditorialHeading as="h1">Thank <em className="heading-accent">you.</em></EditorialHeading><p className="thank-you-lead">Your next chapter starts with a conversation.</p><p>We’ve received your enquiry. Our team will contact you on the number you provided to understand your needs and talk through the next steps.</p>{receipt?.project&&<p className="thank-you-project">Your enquiry: <strong>{receipt.project}</strong></p>}{receipt?.intent==='visit'&&<p>We’ll discuss your preferred visit time and confirm project access with you before an appointment is arranged.</p>}{receipt?.reference&&<p className="thank-you-reference">Your reference <strong>{receipt.reference}</strong></p>}{receipt?.download&&<div className="thank-you-download" role="status"><Download size={20}/><div><strong>{downloadState==='error'?'Your enquiry is saved. The brochure download needs another try.':downloadState==='done'?'Your brochure download has started.':'Preparing your brochure…'}</strong>{downloadState==='error'&&<button type="button" className="text-link" onClick={()=>downloadBrochure(receipt.download!)}>Try the download again <ArrowRight size={16}/></button>}</div></div>}<Link href="/" className="btn primary thank-you-home">Return to homepage <ArrowRight size={18}/></Link><span className="thank-you-note"><Phone size={15}/>A personal conversation. A clearer way forward.</span></section></div></main>;
}
