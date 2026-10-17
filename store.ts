import { onValue, ref } from 'firebase/database';
import { anime as demoAnime } from '../data/anime';
import { channels as demoChannels } from '../data/channels';
import { movies as demoMovies } from '../data/movies';
import { series as demoSeries } from '../data/series';
import { sportsEvents as demoSports } from '../data/sports';
import type { Anime, Announcement, LiveChannel, Movie, Series, SportsEvent } from '../types';
import { db, useDemoData } from './firebase';
import { mapAll, type RawItem } from './mapper';

export interface CatalogSnapshot {
  movies: Movie[];
  movieOnly: Movie[];
  documentaries: Movie[];
  kidsContent: Movie[];
  series: Series[];
  anime: Anime[];
  channels: LiveChannel[];
  sportsEvents: SportsEvent[];
  announcements: Announcement[];
  raw: Record<string, RawItem>;
  loading: boolean;
  error: string | null;
}

const empty: CatalogSnapshot = {
  movies: [],
  movieOnly: [],
  documentaries: [],
  kidsContent: [],
  series: [],
  anime: [],
  channels: [],
  sportsEvents: [],
  announcements: [],
  raw: {},
  loading: true,
  error: null,
};

let snap: CatalogSnapshot = empty;
let rawMovies: Record<string, RawItem> = {};
let watch: Record<string, number> = {};
const listeners = new Set<() => void>();
let started = false;

function emit(next: Partial<CatalogSnapshot>) {
  snap = { ...snap, ...next };
  listeners.forEach((l) => l());
}

function withMovies(movies: Movie[]) {
  return {
    movies,
    movieOnly: movies.filter((m) => m.category === 'movie'),
    documentaries: movies.filter((m) => m.category === 'documentary'),
    kidsContent: movies.filter((m) => m.category === 'kids'),
  };
}

function rebuild() {
  const m = mapAll(rawMovies, watch);
  emit({ ...withMovies(m.movies), series: m.series, anime: m.anime, channels: m.channels, raw: rawMovies, loading: false, error: null });
}

function start() {
  if (started) return;
  started = true;

  if (useDemoData) {
    emit({ ...withMovies(demoMovies), series: demoSeries, anime: demoAnime, channels: demoChannels, sportsEvents: demoSports, loading: false });
    return;
  }

  onValue(
    ref(db, 'movies'),
    (s) => {
      rawMovies = (s.val() as Record<string, RawItem> | null) ?? {};
      rebuild();
    },
    () => emit({ loading: false, error: 'Gagal memuat data dari database. Periksa koneksi atau Firebase Rules.' }),
  );
  onValue(
    ref(db, 'globalWatch'),
    (s) => {
      watch = (s.val() as Record<string, number> | null) ?? {};
      rebuild();
    },
    () => undefined,
  );
  onValue(
    ref(db, 'announcements'),
    (s) => {
      const v = (s.val() as Record<string, { title?: string; body?: string; time?: number }> | null) ?? {};
      const list: Announcement[] = Object.entries(v)
        .filter(([, a]) => a && a.title)
        .map(([id, a]) => ({ id, title: a.title ?? '', body: a.body ?? '', time: a.time ?? 0 }))
        .sort((a, b) => b.time - a.time);
      emit({ announcements: list });
    },
    () => undefined,
  );
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): CatalogSnapshot {
  start();
  return snap;
}
