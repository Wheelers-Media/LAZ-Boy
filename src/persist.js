// Small, safe browser storage for work in progress. Storage can be blocked or full, so every call is guarded
// and the app keeps working (it just forgets on reload).
import { useEffect, useRef, useState } from 'react';

const PREFIX = 'lzb-';

export function readSaved(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    const value = JSON.parse(raw);
    return value === undefined ? fallback : value;
  } catch { return fallback; }
}

export function writeSaved(key, value) {
  try { window.localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; } catch { return false; }
}

export function clearSaved(...keys) {
  keys.forEach((key) => { try { window.localStorage.removeItem(PREFIX + key); } catch { /* storage blocked */ } });
}

/** Like useState, but remembered across tab switches and reloads. `accept` can reject a stale saved shape. */
export function usePersistentState(key, initial, accept = () => true) {
  const [value, setValue] = useState(() => {
    const saved = readSaved(key, undefined);
    if (saved !== undefined && accept(saved)) return saved;
    return typeof initial === 'function' ? initial() : initial;
  });
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } writeSaved(key, value); }, [key, value]);
  return [value, setValue];
}
