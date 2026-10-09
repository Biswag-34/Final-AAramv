'use client';
import {useCallback, useEffect, useRef, useState} from 'react';
import {parseSavedHomes, savedHomesKey, serializeSavedHomes} from '@/lib/saved-homes';

export function useSavedHomes(validIds: readonly string[]) {
  const [saved, setSaved] = useState<string[]>([]);
  const current = useRef<string[]>([]);
  const storageHealthy = useRef(true);
  useEffect(() => {
    const sync = () => {
      try {
        current.current = parseSavedHomes(localStorage.getItem(savedHomesKey), validIds);
        storageHealthy.current = true;
        setSaved(current.current);
      } catch { /* Keep the in-memory shortlist when browser storage is unavailable. */ }
    };
    sync();
    const storage = (event: StorageEvent) => {if (event.key === savedHomesKey || event.key === null) sync();};
    window.addEventListener('storage', storage);
    return () => window.removeEventListener('storage', storage);
  }, [validIds]);
  const toggle = useCallback((id: string) => {
    if (!validIds.includes(id)) return;
    let previous = current.current;
    if (storageHealthy.current) {
      try {previous = parseSavedHomes(localStorage.getItem(savedHomesKey), validIds);} catch {storageHealthy.current = false;}
    }
    const next = previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id];
    current.current = next;
    setSaved(next);
    try {localStorage.setItem(savedHomesKey, serializeSavedHomes(next)); storageHealthy.current = true;} catch {storageHealthy.current = false;}
  }, [validIds]);
  return {saved, toggle};
}
