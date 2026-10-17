import { useSyncExternalStore } from 'react';
import { getSnapshot, subscribe, type CatalogSnapshot } from '../lib/store';

/** Data katalog realtime dari Firebase (atau data DEMO bila VITE_USE_DEMO_DATA=true). */
export function useCatalog(): CatalogSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
