import { useCallback } from 'react';
import type { ListEntry, ListType } from '../types';
import { useStoredState } from './useStoredState';

const EMPTY: ListEntry[] = [];

export function useMyList() {
  const [entries, setEntries] = useStoredState<ListEntry[]>('nx.mylist', EMPTY);

  const has = useCallback(
    (type: ListType, id: string) => entries.some((e) => e.type === type && e.id === id),
    [entries],
  );

  const toggle = useCallback(
    (type: ListType, id: string) => {
      setEntries((prev) =>
        prev.some((e) => e.type === type && e.id === id)
          ? prev.filter((e) => !(e.type === type && e.id === id))
          : [...prev, { type, id }],
      );
    },
    [setEntries],
  );

  return { entries, has, toggle };
}
