'use client';
import {createElement, Fragment, type ReactNode, useSyncExternalStore} from 'react';

const query = '(max-width: 1199px)';
function subscribe(callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

export function useResponsiveLayout() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

const subscribeHydration = () => () => {};
export function DeviceView({desktop, responsive}: {desktop: ReactNode; responsive: ReactNode}) {
  const hydrated = useSyncExternalStore(subscribeHydration, () => true, () => false);
  const compact = useResponsiveLayout();
  // Keep the visible branch mounted so hydration preserves early input and focus.
  return createElement(Fragment, null,
    createElement('div', {className: 'r-server-desktop'}, !hydrated || !compact ? desktop : null),
    createElement('div', {className: 'r-server-responsive', 'data-ready': hydrated ? 'true' : undefined}, !hydrated || compact ? responsive : null));
}
