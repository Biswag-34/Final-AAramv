'use client';

import {useEffect,useRef,useState} from 'react';

export function PropertySectionNav({items}:{items:{id:string;label:string}[]}) {
  const [active,setActive]=useState(items[0]?.id||'overview');
  const ref=useRef<HTMLElement>(null);
  const clicked=useRef<{id:string;until:number}|null>(null);
  const key=items.map(item=>item.id).join(',');
  useEffect(()=>{
    let frame=0;
    const ids=key.split(',');
    const measure=()=>{
      frame=0;
      const line=(ref.current?.getBoundingClientRect().bottom||120)+20;
      if(clicked.current){
        const top=document.getElementById(clicked.current.id)?.getBoundingClientRect().top??0;
        if(Date.now()<clicked.current.until&&Math.abs(top-line)>35)return;
        clicked.current=null;
      }
      let current=ids[0];
      for(const id of ids){const section=document.getElementById(id);if(section&&section.getBoundingClientRect().top<=line)current=id;}
      setActive(current);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(measure);};
    window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);schedule();
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};
  },[key]);
  useEffect(()=>{
    const nav=ref.current,link=nav?.querySelector<HTMLElement>(`[href="#${active}"]`);
    if(nav&&link){if(link.offsetLeft<nav.scrollLeft)nav.scrollLeft=link.offsetLeft;else if(link.offsetLeft+link.offsetWidth>nav.scrollLeft+nav.clientWidth)nav.scrollLeft=link.offsetLeft+link.offsetWidth-nav.clientWidth;}
  },[active]);
  return <nav ref={ref} className="anchor-nav property-section-nav" aria-label="Property sections">{items.map(item=><a key={item.id} href={`#${item.id}`} className={active===item.id?'is-active':undefined} aria-current={active===item.id?'location':undefined} onClick={()=>{clicked.current={id:item.id,until:Date.now()+1200};setActive(item.id);}}>{item.label}</a>)}</nav>;
}
