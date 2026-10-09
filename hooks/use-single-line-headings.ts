'use client';

import {useEffect} from 'react';

export function useSingleLineHeadings(route: string) {
  useEffect(() => {
    const media = window.matchMedia('(min-width: 600px)');
    const sizes = new Map<HTMLElement, string>();
    let mounted = true;
    const fit = () => {
      if (!mounted) return;
      document.querySelectorAll<HTMLElement>('#main-content h1, #main-content h2').forEach(heading => {
        if (heading.closest('.hero, .r-hero, .enquiry-success, .contact-form, .detail-form, .cta-section, .r-enquiry-section')) return;
        if (!sizes.has(heading)) sizes.set(heading, heading.style.fontSize);
        heading.style.fontSize = sizes.get(heading) || '';
        if (heading.classList.contains('single-line-heading') !== media.matches) heading.classList.toggle('single-line-heading', media.matches);
        if (!media.matches || !heading.clientWidth) return;
        const baseline = Number.parseFloat(getComputedStyle(heading).fontSize);
        if (heading.scrollWidth > heading.clientWidth) {
          heading.style.setProperty('font-size', `${Math.floor(baseline * heading.clientWidth / heading.scrollWidth * .98)}px`, 'important');
        }
      });
    };
    // DeviceView replaces its server-rendered branch after hydration.
    const mutation = new MutationObserver(changes => {
      if (changes.some(change => change.type === 'childList' || change.target instanceof HTMLElement && change.target.matches('h1, h2') && change.target.classList.contains('single-line-heading') !== media.matches)) fit();
    });
    const root = document.getElementById('main-content');
    if (root) mutation.observe(root, {childList: true, subtree: true, attributes: true, attributeFilter: ['class']});
    window.addEventListener('resize', fit);
    document.fonts.ready.then(fit);
    fit();
    return () => {
      mounted = false;
      mutation.disconnect();
      window.removeEventListener('resize', fit);
      sizes.forEach((size, heading) => {heading.style.fontSize = size; heading.classList.remove('single-line-heading');});
    };
  }, [route]);
}
