'use client';

import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {usePathname, useSearchParams} from 'next/navigation';
import {readScrollPositions,routeScrollAction,type ScrollPosition} from '@/lib/scroll-restoration';

type Position = ScrollPosition;
const storageKey = 'aaramv-route-scroll-v2';
const intentKey = 'aaramv-route-scroll-intent';
const locationKey = () => location.pathname + location.search + location.hash;
const clearance = () => {
  const headerBottom=Math.max(0,...Array.from(document.querySelectorAll<HTMLElement>('header')).map(el=>{
    const box=el.getBoundingClientRect();
    return ['fixed','sticky'].includes(getComputedStyle(el).position)&&box.top<=24&&box.height>0?box.bottom:0;
  }));
  const navigation=document.querySelector<HTMLElement>('.property-section-nav');
  const box=navigation?.getBoundingClientRect();
  return Math.max(headerBottom,box&&box.height>0&&box.top<=headerBottom+24?box.bottom:0)+16;
};

/** One scroll owner for route entries, search changes, hash links, and Back. */
export function useRouteScroll() {
  const path = usePathname();
  const params = useSearchParams();
  const route = path + (params.size ? `?${params.toString()}` : '');
  const [historyChange, setHistoryChange] = useState(0);
  const current = useRef('');
  const positions = useRef<Record<string,Position>>({});
  const loaded = useRef(false);
  const lastRestoration = useRef<{url:string; position?:Position}|undefined>(undefined);
  const pending = useRef(false);
  const restoring = useRef(false);
  const back = useRef(false);
  const explicitReturn = useRef(false);
  const cancelRestore = useRef<() => void>(() => {});

  useEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    const save = (clicked?:Element|null) => {
      if (!current.current || restoring.current) return;
      const footer = [...document.querySelectorAll('footer')].find(el => el.getBoundingClientRect().height > 0);
      const atFooter = clicked ? !!clicked.closest('footer') : !!footer && footer.getBoundingClientRect().top < innerHeight * .55;
      const position:Position = {top:atFooter ? 0 : window.scrollY};
      if (!atFooter && window.scrollY > 80) {
        const clickedCard = clicked?.closest<HTMLElement>('[data-scroll-key]');
        const line = clearance();
        const section = clickedCard || [...document.querySelectorAll<HTMLElement>('main [data-scroll-key],main section[id]')]
          .filter(el => {const box=el.getBoundingClientRect();return box.height>0 && box.top<=line+40 && box.bottom>line;}).at(-1);
        if (section) {
          position.anchor = section.dataset.scrollKey ? `card:${section.dataset.scrollKey}` : `section:${section.id}`;
          position.offset = clickedCard ? Math.max(line,section.getBoundingClientRect().top) : section.getBoundingClientRect().top;
        }
      }
      positions.current[current.current] = position;
      try {sessionStorage.setItem(storageKey,JSON.stringify(positions.current));} catch {}
    };
    let frame=0;
    const onScroll=()=>{
      if (pending.current || restoring.current) return;
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>save());
    };
    const onClick=(event:MouseEvent)=>{
      if(event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target=event.target instanceof Element ? event.target : null;
      const link=target?.closest<HTMLAnchorElement>('a[href]');
      if(!link || link.target==='_blank' || link.hasAttribute('download'))return;
      const destination=new URL(link.href,location.href);
      if(destination.origin!==location.origin)return;
      cancelRestore.current();
      save(target);
      if(destination.pathname+destination.search+destination.hash!==locationKey()) {
        pending.current=true;
        explicitReturn.current=link.hasAttribute('data-return-results');
        try {
          sessionStorage.removeItem(intentKey);
          if(explicitReturn.current)sessionStorage.setItem(intentKey,JSON.stringify({href:destination.pathname+destination.search+destination.hash,at:Date.now()}));
        } catch {}
      }
    };
    const onSubmit=(event:SubmitEvent)=>{
      const form=event.target;
      if(form instanceof HTMLFormElement && form.matches('[role="search"],.listing-search,.r-search')){
        cancelRestore.current();save();
        lastRestoration.current={url:locationKey()};
        setHistoryChange(value=>value+1);
      }
    };
    const onPop=()=>{
      cancelRestore.current();save();back.current=true;pending.current=true;
      try {sessionStorage.setItem(intentKey,JSON.stringify({href:locationKey(),at:Date.now()}));} catch {}
      setHistoryChange(value=>value+1);
    };
    const onHash=()=>setHistoryChange(value=>value+1);
    const onUserScroll=()=>cancelRestore.current();
    const onKey=(event:KeyboardEvent)=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))onUserScroll();};
    const onPageHide=()=>save();
    window.addEventListener('scroll',onScroll,{passive:true});
    // Save the outgoing entry before Next's bubble listener replaces its page tree.
    window.addEventListener('popstate',onPop,true);
    window.addEventListener('hashchange',onHash);
    window.addEventListener('pagehide',onPageHide);
    document.addEventListener('click',onClick,true);
    document.addEventListener('submit',onSubmit,true);
    window.addEventListener('wheel',onUserScroll,{passive:true});
    window.addEventListener('touchstart',onUserScroll,{passive:true});
    window.addEventListener('keydown',onKey);
    return()=>{
      history.scrollRestoration=previousRestoration;
      cancelAnimationFrame(frame);cancelRestore.current();
      window.removeEventListener('scroll',onScroll);
      window.removeEventListener('popstate',onPop,true);
      window.removeEventListener('hashchange',onHash);
      window.removeEventListener('pagehide',onPageHide);
      document.removeEventListener('click',onClick,true);
      document.removeEventListener('submit',onSubmit,true);
      window.removeEventListener('wheel',onUserScroll);
      window.removeEventListener('touchstart',onUserScroll);
      window.removeEventListener('keydown',onKey);
    };
  },[]);

  useLayoutEffect(()=>{
    // A popstate can arrive before Next commits its new pathname/search params.
    if(location.pathname!==path)return;
    cancelRestore.current();
    const next=locationKey();
    const previous=current.current;
    let storedIntent=false;
    try {
      if(!loaded.current){
        positions.current=readScrollPositions(sessionStorage.getItem(storageKey));
        loaded.current=true;
      }
      const intent=JSON.parse(sessionStorage.getItem(intentKey)||'null');
      storedIntent=intent?.href===next && Date.now()-intent.at<60000;
      if(storedIntent)sessionStorage.removeItem(intentKey);
    } catch {}
    const shouldRestore=back.current || explicitReturn.current || storedIntent;
    const saved=shouldRestore ? positions.current[next] : previous===next && lastRestoration.current?.url===next ? lastRestoration.current.position : undefined;
    const action=routeScrollAction(previous,next,shouldRestore);
    current.current=next;
    back.current=false;explicitReturn.current=false;pending.current=false;
    if(previous && previous!==next && action==='preserve'){
      lastRestoration.current={url:next,position:{top:window.scrollY}};
      return;
    }
    lastRestoration.current={url:next,position:saved};
    restoring.current=true;
    let frame=0, stopped=false;
    const apply=()=>{
      if(stopped)return;
      let top=saved?.top??0;
      if(location.hash) {
        let id=location.hash.slice(1);
        try {id=decodeURIComponent(id);} catch {}
        const anchor=document.getElementById(id);
        if(anchor)top=window.scrollY+anchor.getBoundingClientRect().top-clearance();
      } else if(saved?.anchor) {
        const [kind,...parts]=saved.anchor.split(':');
        const id=parts.join(':');
        const anchor=kind==='card' ? document.querySelector<HTMLElement>(`[data-scroll-key="${CSS.escape(id)}"]`) : document.getElementById(id);
        if(anchor && anchor.getBoundingClientRect().height>0)top=window.scrollY+anchor.getBoundingClientRect().top-(saved.offset??clearance());
      }
      window.scrollTo({top:Math.max(0,top),left:0,behavior:'instant'});
    };
    const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(apply);};
    const observer=new ResizeObserver(schedule);
    const root=document.getElementById('main-content');
    if(root)observer.observe(root);
    // Reapply after the responsive branch hydrates, without a smooth scroll from the footer.
    const mutations=new MutationObserver(schedule);
    if(root)mutations.observe(root,{childList:true,subtree:true});
    const stop=()=>{stopped=true;restoring.current=false;cancelAnimationFrame(frame);observer.disconnect();mutations.disconnect();clearTimeout(timer);};
    const timer=window.setTimeout(stop,1000);
    cancelRestore.current=stop;
    apply();schedule();
    return stop;
  },[route,historyChange]);
}
