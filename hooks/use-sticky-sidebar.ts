'use client';

import {useEffect, useRef} from 'react';

export function useStickySidebar(mode: 'adaptive' | 'top' = 'adaptive') {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const sidebar = ref.current;
    if (!sidebar) return;
    // Tall panels finish entering the viewport before pinning at their bottom edge.
    const measure = () => sidebar.style.setProperty(
      '--sidebar-top', `${mode === 'top' ? 104 : Math.min(96, window.innerHeight - sidebar.offsetHeight - 24)}px`,
    );
    const observer = new ResizeObserver(measure);
    observer.observe(sidebar);
    window.addEventListener('resize', measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [mode]);

  return ref;
}
