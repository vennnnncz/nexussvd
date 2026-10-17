import type {
  Anime,
  ChannelCategory,
  DownloadLink,
  Episode,
  LiveChannel,
  Movie,
  MovieCategory,
  Season,
  Series,
} from '../types';
import { isSafeUrl } from './media';

/** Skema item di Firebase `movies/` (dipakai aplikasi lama dan dashboard admin). */
export interface RawEpisode {
  url?: string;
  dl?: { '1080p'?: string; '720p'?: string } | null;
}
export interface RawSeason {
  name?: string;
  episodes?: (string | RawEpisode)[];
}
export interface RawItem {
  title?: string;
  poster?: string;
  category?: string;
  genres?: string[] | Record<string, string>;
  synopsis?: string;
  type?: 'movie' | 'series' | 'livetv';
  url?: string;
  downloadUrl?: string | { '1080p'?: string; '720p'?: string };
  seasons?: RawSeason[] | Record<string, RawSeason>;
  episodes?: (string | RawEpisode)[];
  schedule?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  language?: string;
  rating?: string | number;
  trailerUrl?: string;
  channelLogo?: string;
  liveQuality?: string;
  liveStatus?: string;
}

const PUSH = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

/** Waktu pembuatan dari push-key Firebase (8 karakter pertama). */
export function pushTime(key: string): number {
  let t = 0;
  for (const ch of key.slice(0, 8)) {
    const i = PUSH.indexOf(ch);
    if (i < 0) return 0;
    t = t * 64 + i;
  }
  return t > 1e12 ? t : 0;
}

function hueOf(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) % 360;
  return h;
}

function toArray<T>(v: T[] | Record<string, T> | undefined | null): T[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter((x) => x !== null && x !== undefined);
  return Object.values(v);
}

function cleanUrl(u: string | undefined): string | null {
  const t = (u ?? '').trim();
  return t && isSafeUrl(t) ? t : null;
}

function posterOf(raw: RawItem): string | undefined {
  const p = cleanUrl(raw.poster);
  return p && !p.includes('placehold.co') ? p : undefined;
}

function ratingOf(raw: RawItem): number | undefined {
  const n = parseFloat(String(raw.rating ?? ''));
  return Number.isFinite(n) && n > 0 && n <= 10 ? n : undefined;
}

function downloadsOf(d: RawItem['downloadUrl'] | RawEpisode['dl']): DownloadLink[] | undefined {
  if (!d) return undefined;
  const out: DownloadLink[] = [];
  if (typeof d === 'string') {
    const u = cleanUrl(d);
    if (u) out.push({ label: 'Unduh', url: u });
  } else {
    const a = cleanUrl(d['1080p']);
    const b = cleanUrl(d['720p']);
    if (a) out.push({ label: '1080p', url: a });
    if (b) out.push({ label: '720p', url: b });
  }
  return out.length ? out : undefined;
}

function episodesOf(id: string, seasonNo: number, list: (string | RawEpisode)[] | undefined): Episode[] {
  return toArray(list).map((e, i) => {
    const obj: RawEpisode = typeof e === 'string' ? { url: e } : e;
    return {
      id: `${id}-s${seasonNo}e${i + 1}`,
      number: i + 1,
      title: `Episode ${i + 1}`,
      videoUrl: cleanUrl(obj.url),
      downloads: downloadsOf(obj.dl),
    };
  });
}

function seasonsOf(id: string, raw: RawItem): Season[] {
  const seasons = toArray(raw.seasons);
  if (seasons.length > 0) {
    return seasons.map((s, i) => ({
      number: i + 1,
      name: s.name,
      episodes: episodesOf(id, i + 1, s.episodes),
    }));
  }
  if (raw.episodes) return [{ number: 1, name: 'Season 1', episodes: episodesOf(id, 1, raw.episodes) }];
  return [];
}

const channelCats: ChannelCategory[] = ['News', 'Entertainment', 'Movies', 'Sports', 'Music', 'Education', 'Kids', 'International'];

function channelCategoryOf(raw: RawItem): ChannelCategory {
  const hay = toArray(raw.genres).join(' ').toLowerCase();
  const found = channelCats.find((c) => hay.includes(c.toLowerCase()));
  if (found) return found;
  if (/berita|news/.test(hay)) return 'News';
  if (/olahraga|sport/.test(hay)) return 'Sports';
  if (/musik/.test(hay)) return 'Music';
  if (/edukasi/.test(hay)) return 'Education';
  if (/anak|kartun|family/.test(hay)) return 'Kids';
  return 'Entertainment';
}

export interface Mapped {
  movies: Movie[];
  series: Series[];
  anime: Anime[];
  channels: LiveChannel[];
}

export function mapAll(rawMap: Record<string, RawItem>, watch: Record<string, number>): Mapped {
  const out: Mapped = { movies: [], series: [], anime: [], channels: [] };

  for (const [id, raw] of Object.entries(rawMap)) {
    if (!raw || !raw.title) continue;
    const title = raw.title.trim();
    const genres = toArray(raw.genres);
    const added = pushTime(id);
    const base = {
      id,
      title,
      year: 0,
      genres,
      rating: ratingOf(raw),
      synopsis: raw.synopsis?.trim() || 'Sinopsis belum tersedia.',
      hue: hueOf(title),
      poster: posterOf(raw),
      popularity: watch[id.replace(/[.#$[\]/]/g, '_')] ?? 0,
      addedAt: new Date(added || 0).toISOString(),
      schedule: raw.schedule && raw.schedule !== 'Tersedia' ? raw.schedule : undefined,
      language: raw.language || undefined,
      trailerUrl: cleanUrl(raw.trailerUrl) ?? undefined,
      isDemo: false,
    };

    if (raw.type === 'livetv' || raw.category === 'Live TV') {
      const status = raw.liveStatus === 'replay' || raw.liveStatus === 'scheduled' ? raw.liveStatus : 'live';
      const url = cleanUrl(raw.url);
      out.channels.push({
        id,
        name: title,
        logo: cleanUrl(raw.channelLogo),
        category: channelCategoryOf(raw),
        streamUrl: url,
        isLive: status === 'live' && !!url,
        nowPlaying: null,
        nextProgram: null,
        quality: raw.liveQuality,
        liveStatus: status,
        hue: base.hue,
        isDemo: false,
      });
      continue;
    }

    if (raw.category === 'Anime') {
      const isMovie = raw.type !== 'series';
      const seasons = seasonsOf(id, raw);
      const episodes: Episode[] = isMovie
        ? [{ id: `${id}-e1`, number: 1, title: title, videoUrl: cleanUrl(raw.url), downloads: downloadsOf(raw.downloadUrl) }]
        : seasons.flatMap((s) => s.episodes).map((e, i) => ({ ...e, id: `${id}-e${i + 1}`, number: i + 1 }));
      out.anime.push({ ...base, type: 'anime', format: isMovie ? 'movie' : 'series', episodes });
      continue;
    }

    if (raw.type === 'series') {
      out.series.push({ ...base, type: 'series', seasons: seasonsOf(id, raw) });
      continue;
    }

    let category: MovieCategory = 'movie';
    if (raw.category === 'Kartun') category = 'kids';
    else if (genres.some((g) => /dokumenter|biografi|sejarah/i.test(g))) category = 'documentary';
    out.movies.push({
      ...base,
      type: 'movie',
      category,
      videoUrl: cleanUrl(raw.url),
      downloads: downloadsOf(raw.downloadUrl),
    });
  }

  return out;
}
