'use client';

import {useEffect,useRef} from 'react';
import {businessDetails} from '@/lib/business-details';
import styles from './floating-whatsapp.module.css';

export function FloatingWhatsapp() {
  const ref=useRef<HTMLAnchorElement>(null);
  const number=(businessDetails.whatsapp||`91${businessDetails.phone||''}`).replace(/\D/g,'');

  useEffect(()=>{
    const button=ref.current;
    if(!button)return;
    let frame=0;
    const observed=new Set<Element>();
    const measure=()=>{
      const bars=[...document.querySelectorAll<HTMLElement>('.r-visit-bar,.buyer-compare-bar')];
      let obstruction=0;
      const buttonBox=button.getBoundingClientRect();
      for(const bar of bars){
        const box=bar.getBoundingClientRect();
        if(box.height>0&&box.top<innerHeight&&box.bottom>0&&box.right>buttonBox.left-6&&box.left<buttonBox.right+6){
          obstruction=Math.max(obstruction,innerHeight-box.top+16);
        }
        if(!observed.has(bar)){observed.add(bar);resize.observe(bar);}
      }
      for(const bar of observed){if(!bar.isConnected){resize.unobserve(bar);observed.delete(bar);}}
      button.style.setProperty('--whatsapp-obstruction',`${Math.ceil(obstruction)}px`);
    };
    const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
    const resize=new ResizeObserver(schedule);
    const mutations=new MutationObserver(schedule);
    mutations.observe(document.body,{childList:true,subtree:true});
    window.addEventListener('resize',schedule);
    measure();
    return()=>{cancelAnimationFrame(frame);resize.disconnect();mutations.disconnect();window.removeEventListener('resize',schedule);};
  },[]);

  if(!number||(!businessDetails.phone&&!businessDetails.whatsapp))return null;
  return <a ref={ref} className={styles.button} href={`https://wa.me/${number}?text=${encodeURIComponent('Hi Aaramv! I would like some guidance with my property search.')}`} target="_blank" rel="noopener noreferrer" aria-label="Chat with Aaramv Realty on WhatsApp (opens in a new tab)">
    <span className={styles.tooltip} aria-hidden="true">Chat on WhatsApp</span>
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.9 11.9 0 0 0 12.05 0C5.46 0 .1 5.36.1 11.95c0 2.1.55 4.15 1.6 5.96L0 24l6.25-1.64a11.9 11.9 0 0 0 5.79 1.48h.01c6.59 0 11.95-5.36 11.95-11.95a11.86 11.86 0 0 0-3.48-8.41ZM12.05 21.82a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.71.97.99-3.62-.24-.37a9.88 9.88 0 0 1-1.51-5.26c0-5.48 4.46-9.94 9.95-9.94a9.88 9.88 0 0 1 7.03 2.92 9.87 9.87 0 0 1 2.91 7.03c0 5.49-4.46 9.96-10.02 9.86Zm5.45-7.44c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.11 3.22 5.12 4.52.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg>
  </a>;
}
