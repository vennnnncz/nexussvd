import { getSnapshot } from './store';
import type {
  Anime,
  CardData,
  Episode,
  LiveChannel,
  Movie,
  Series,
  SportsEvent,
  WatchProgress,
} from '../types';

export const getMovie = (id?: string): Movie | undefined => getSnapshot().movies.find((m) => m.id === id);
export const getSeries = (id?: string): Series | undefined => getSnapshot().series.find((s) => s.id === id);
export const getAnime = (id?: string): Anime | undefined => getSnapshot().anime.find((a) => a.id === id);
export const getChannel = (id?: string): LiveChannel | undefined => getSnapshot().channels.find((c) => c.id === id);
export const getSportsEvent = (id?: string | null): SportsEvent | undefined =>
  getSnapshot().sportsEvents.find((e) => e.id === id);

export function findEpisode(s: Series, season: number, episode: number): Episode | undefined {
  return s.seasons.find((x) => x.number === season)?.episodes.find((e) => e.number === episode);
}

export function progressKey(type: 'movie' | 'series' | 'anime', id: string, season?: number, episode?: number): string {
  if (type === 'movie') return `movie:${id}`;
  if (type === 'series') return `series:${id}:s${season}:e${episode}`;
  return `anime:${id}:e${episode}`;
}

export function watchPath(type: 'movie' | 'series' | 'anime', id: string, season = 1, episode = 1): string {
  if (type === 'movie') return `/watch/movie/${id}`;
  if (type === 'series') return `/watch/series/${id}/season/${season}/episode/${episode}`;
  return `/watch/anime/${id}/episode/${episode}`;
}

// ---- Pemetaan ke CardData ----

export const movieCard = (m: Movie): CardData => ({
  key: `movie-${m.id}`,
  type: 'movie',
  id: m.id,
  title: m.title,
  year: m.year,
  genres: m.genres,
  rating: m.rating,
  hue: m.hue,
  poster: m.poster,
  isDemo: m.isDemo,
  to: `/detail/movie/${m.id}`,
});

export const seriesCard = (s: Series): CardData => ({
  key: `series-${s.id}`,
  type: 'series',
  id: s.id,
  title: s.title,
  year: s.year,
  genres: s.genres,
  rating: s.rating,
  hue: s.hue,
  poster: s.poster,
  isDemo: s.isDemo,
  to: `/detail/series/${s.id}`,
});

export const animeCard = (a: Anime): CardData => ({
  key: `anime-${a.id}`,
  type: 'anime',
  id: a.id,
  title: a.title,
  year: a.year,
  genres: a.genres,
  rating: a.rating,
  hue: a.hue,
  poster: a.poster,
  isDemo: a.isDemo,
  to: `/detail/anime/${a.id}`,
});

export const channelCard = (c: LiveChannel): CardData => ({
  key: `channel-${c.id}`,
  type: 'channel',
  id: c.id,
  title: c.name,
  subtitle: c.category,
  genres: [c.category],
  hue: c.hue,
  isDemo: c.isDemo,
  isLive: c.isLive && !!c.streamUrl,
  to: `/live-tv/${c.id}`,
});

export const sportsCard = (e: SportsEvent): CardData => ({
  key: `sports-${e.id}`,
  type: 'sports',
  id: e.id,
  title: e.title,
  subtitle: e.league,
  genres: [e.sport],
  hue: e.hue,
  isDemo: e.isDemo,
  isLive: e.status === 'live' && !!e.streamUrl,
  to: `/sports?event=${e.id}`,
});

export type AnyContent = Movie | Series | Anime;

export const toCard = (c: AnyContent): CardData =>
  c.type === 'movie' ? movieCard(c) : c.type === 'series' ? seriesCard(c) : animeCard(c);

export function getContent(type: 'movie' | 'series' | 'anime', id: string): AnyContent | undefined {
  if (type === 'movie') return getMovie(id);
  if (type === 'series') return getSeries(id);
  return getAnime(id);
}

export function getAllContent(): AnyContent[] {
  const c = getSnapshot();
  return [...c.movies, ...c.series, ...c.anime];
}

export const byPopularity = <T extends { popularity: number }>(list: T[]): T[] =>
  [...list].sort((a, b) => b.popularity - a.popularity);

export const byAdded = <T extends { addedAt: string }>(list: T[]): T[] =>
  [...list].sort((a, b) => b.addedAt.localeCompare(a.addedAt));

export function uniqueGenres(list: { genres: string[] }[]): string[] {
  return Array.from(new Set(list.flatMap((i) => i.genres))).sort();
}

export function related(item: AnyContent, limit = 12): CardData[] {
  const pool = getAllContent().filter((c) => c.id !== item.id && c.type === item.type);
  const scored = pool
    .map((c) => ({ c, score: c.genres.filter((g) => item.genres.includes(g)).length }))
    .sort((a, b) => b.score - a.score || b.c.popularity - a.c.popularity);
  return scored.slice(0, limit).map((x) => toCard(x.c));
}

/** Kartu "Continue Watching" dari progres tersimpan; item yang tidak ada lagi dilewati. */
export function continueCards(progress: WatchProgress[]): CardData[] {
  const out: CardData[] = [];
  const seen = new Set<string>();
  for (const p of [...progress].sort((a, b) => b.updatedAt - a.updatedAt)) {
    const content = getContent(p.type, p.contentId);
    if (!content) continue;
    const dedupe = `${p.type}:${p.contentId}`;
    if (seen.has(dedupe)) continue;
    if (p.duration <= 0 || p.position / p.duration > 0.97) continue;
    seen.add(dedupe);
    const base = toCard(content);
    out.push({
      ...base,
      key: `continue-${p.key}`,
      subtitle: p.type === 'movie' ? undefined : `Lanjut ${p.season ? `S${p.season} ` : ''}E${p.episode}`,
      progress: p.position / p.duration,
      to: watchPath(p.type, p.contentId, p.season ?? 1, p.episode ?? 1),
    });
  }
  return out;
}

/** Episode terbaru per serial (berdasarkan season/episode terakhir). */
export function latestEpisodeCards(): CardData[] {
  const out: CardData[] = [];
  for (const s of byAdded(getSnapshot().series)) {
    const lastSeason = [...s.seasons].reverse().find((x) => x.episodes.length > 0);
    if (!lastSeason) continue;
    const lastEp = lastSeason.episodes[lastSeason.episodes.length - 1];
    out.push({
      ...seriesCard(s),
      key: `latest-${lastEp.id}`,
      subtitle: `S${lastSeason.number} E${lastEp.number}`,
      to: watchPath('series', s.id, lastSeason.number, lastEp.number),
    });
  }
  return out;
}

// ---- Pencarian global ----

export type SearchCategory = 'all' | 'movie' | 'series' | 'anime' | 'channel' | 'documentary' | 'sports';

export interface SearchHit {
  key: string;
  label: string;
  title: string;
  meta: string;
  to: string;
  hue: number;
  category: Exclude<SearchCategory, 'all'>;
}

export function searchAll(query: string, category: SearchCategory): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const { movies, series, anime, channels, sportsEvents } = getSnapshot();
  const hits: SearchHit[] = [];
  const match = (text: string, extra: string[] = []) =>
    text.toLowerCase().includes(q) || extra.some((e) => e.toLowerCase().includes(q));

  for (const m of movies) {
    if (!match(m.title, m.genres)) continue;
    const cat = m.category === 'documentary' ? 'documentary' : 'movie';
    hits.push({
      key: `m-${m.id}`,
      label: m.category === 'documentary' ? 'Documentary' : m.category === 'kids' ? 'Kids' : 'Movie',
      title: m.title,
      meta: [m.year || '', m.genres.join(', ')].filter(Boolean).join(' - '),
      to: `/detail/movie/${m.id}`,
      hue: m.hue,
      category: cat,
    });
  }
  for (const s of series) {
    if (!match(s.title, s.genres)) continue;
    hits.push({ key: `s-${s.id}`, label: 'Series', title: s.title, meta: [s.year || '', s.genres.join(', ')].filter(Boolean).join(' - '), to: `/detail/series/${s.id}`, hue: s.hue, category: 'series' });
  }
  for (const a of anime) {
    if (!match(a.title, a.genres)) continue;
    hits.push({ key: `a-${a.id}`, label: 'Anime', title: a.title, meta: [a.year || '', a.genres.join(', ')].filter(Boolean).join(' - '), to: `/detail/anime/${a.id}`, hue: a.hue, category: 'anime' });
  }
  for (const c of channels) {
    if (!match(c.name, [c.category])) continue;
    hits.push({ key: `c-${c.id}`, label: 'Live TV', title: c.name, meta: c.category, to: `/live-tv/${c.id}`, hue: c.hue, category: 'channel' });
  }
  for (const e of sportsEvents) {
    if (!match(e.title, [e.league, e.sport])) continue;
    hits.push({ key: `e-${e.id}`, label: 'Sports', title: e.title, meta: `${e.sport} - ${e.league}`, to: `/sports?event=${e.id}`, hue: e.hue, category: 'sports' });
  }
  return category === 'all' ? hits : hits.filter((h) => h.category === category);
}
