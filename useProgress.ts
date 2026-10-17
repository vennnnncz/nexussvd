import { useCallback, useMemo } from 'react';
import type { WatchProgress } from '../types';
import { useStoredState } from './useStoredState';

const EMPTY: Record<string, WatchProgress> = {};

export function useProgress() {
  const [map, setMap] = useStoredState<Record<string, WatchProgress>>('nx.progress', EMPTY);

  const save = useCallback(
    (p: WatchProgress) => {
      setMap((prev) => ({ ...prev, [p.key]: p }));
    },
    [setMap],
  );

  const remove = useCallback(
    (key: string) => {
      setMap((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [setMap],
  );

  const list = useMemo(() => Object.values(map), [map]);
  const get = useCallback((key: string) => map[key], [map]);

  return { map, list, get, save, remove };
}
