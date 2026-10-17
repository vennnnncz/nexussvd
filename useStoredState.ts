import { useCallback, useEffect, useState } from 'react';
import { readJSON, writeJSON } from '../lib/storage';

const EVT = 'nx-storage';

/** State yang tersinkron dengan localStorage dan antar komponen/tab. */
export function useStoredState<T>(key: string, fallback: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => readJSON(key, fallback));

  useEffect(() => {
    const sync = (e: Event) => {
      const k = e instanceof StorageEvent ? e.key : (e as CustomEvent<string>).detail;
      if (k !== key) return;
      setValue(readJSON(key, fallback));
    };
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      const current = readJSON<T>(key, fallback);
      const next = typeof v === 'function' ? (v as (prev: T) => T)(current) : v;
      writeJSON(key, next);
      setValue(next);
      window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, set];
}
