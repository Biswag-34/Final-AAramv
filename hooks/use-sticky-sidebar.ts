'use client';

import {useEffect, useRef} from 'react';
import {stickySidebarMetrics} from '@/lib/scroll-restoration';

export function useStickySidebar(mode: 'adaptive' | 'top' = 'adaptive') {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const sidebar = ref.current;
    if (!sidebar) return;
    const headers=[...document.querySelectorAll<HTMLElement>('.ribbon,.r-header')];
    const measure = () => {
      const headerBottom=Math.max(0,...headers.filter(header=>header.getBoundingClientRect().height>0).map(header=>header.getBoundingClientRect().bottom));
      const viewportHeight=window.visualViewport?.height??window.innerHeight;
      const {top,availableHeight}=stickySidebarMetrics(viewportHeight,headerBottom,sidebar.offsetHeight,mode);
      sidebar.style.setProperty('--sidebar-top',`${top}px`);
      sidebar.style.setProperty('--sidebar-max-height',`${availableHeight}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(sidebar);
    headers.forEach(header=>observer.observe(header));
    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize',measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('resize',measure);
    };
  }, [mode]);

  return ref;
}
