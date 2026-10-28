'use client';

import {useEffect,useState} from 'react';

export function useHeaderSurface(path:string) {
  const [onHero,setOnHero]=useState(path==='/');
  useEffect(()=>{
    let frame=0;
    const measure=()=>{
      frame=0;
      const header=[...document.querySelectorAll<HTMLElement>('.ribbon,.r-header')].find(el=>el.getBoundingClientRect().height>0);
      const clearance=header?Math.ceil(header.getBoundingClientRect().bottom)+8:84;
      document.documentElement.style.setProperty('--header-clearance',`${clearance}px`);
      const hero=[...document.querySelectorAll<HTMLElement>('.home-page .hero,.r-home .r-hero')].find(el=>el.getBoundingClientRect().width>0);
      setOnHero(path==='/'&&!!hero&&hero.getBoundingClientRect().bottom>clearance);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(measure);};
    const observer=new MutationObserver(schedule);
    const root=document.getElementById('main-content');
    if(root)observer.observe(root,{childList:true,subtree:true});
    window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
    schedule();
    return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};
  },[path]);
  return onHero;
}
