export type ContentType = 'movie' | 'series' | 'anime';
export type MovieCategory = 'movie' | 'documentary' | 'kids';

export interface DownloadLink {
  label: string;
  url: string;
}

export interface BaseContent {
  id: string;
  title: string;
  /** Tahun rilis; 0 bila tidak diketahui. */
  year: number;
  /** Jadwal tayang (mis. "Senin", "Segera"); kosong atau "Tersedia" berarti sudah tayang. */
  schedule?: string;
  language?: string;
  trailerUrl?: string;
  genres: string[];
  rating?: number;
  synopsis: string;
  /** Hue (0-360) dipakai untuk poster generatif bila gambar tidak tersedia. */
  hue: number;
  poster?: string;
  backdrop?: string;
  popularity: number;
  /** Tanggal ditambahkan (ISO) */
  addedAt: string;
  trending?: boolean;
  isDemo: boolean;
}

export interface Movie extends BaseContent {
  type: 'movie';
  category: MovieCategory;
  /** Durasi dalam menit */
  duration?: number;
  downloads?: DownloadLink[];
  director?: string;
  cast?: string[];
  videoUrl: string | null;
  subtitles?: SubtitleTrack[];
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  /** Durasi dalam menit */
  duration?: number;
  synopsis?: string;
  videoUrl: string | null;
  downloads?: DownloadLink[];
}

export interface Season {
  number: number;
  name?: string;
  episodes: Episode[];
}

export interface Series extends BaseContent {
  type: 'series';
  status?: 'Ongoing' | 'Ended';
  seasons: Season[];
}

export interface Anime extends BaseContent {
  type: 'anime';
  format: 'series' | 'movie';
  status?: 'Ongoing' | 'Ended';
  episodes: Episode[];
}

export interface SubtitleTrack {
  src: string;
  label: string;
  lang: string;
}

export interface ProgramSchedule {
  title: string;
  start: string;
  end: string;
}

export type ChannelCategory =
  | 'News'
  | 'Entertainment'
  | 'Movies'
  | 'Sports'
  | 'Music'
  | 'Education'
  | 'Kids'
  | 'International';

export interface LiveChannel {
  id: string;
  name: string;
  logo: string | null;
  category: ChannelCategory;
  streamUrl: string | null;
  isLive: boolean;
  nowPlaying: ProgramSchedule | null;
  nextProgram: ProgramSchedule | null;
  quality?: string;
  liveStatus?: 'live' | 'replay' | 'scheduled';
  hue: number;
  isDemo: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  time: number;
}

export interface InboxMessage {
  role: 'user' | 'admin';
  text: string;
  time: number;
  name?: string;
}

export interface InboxItem {
  id: string;
  name: string;
  message: string;
  type: 'request' | 'lapor';
  time: number;
  thread: InboxMessage[];
}

export type SportCategory =
  | 'Football'
  | 'Basketball'
  | 'Badminton'
  | 'Motorsport'
  | 'Tennis'
  | 'Other Sports';

export interface SportsEvent {
  id: string;
  title: string;
  sport: SportCategory;
  league: string;
  /** ISO string atau null bila jadwal belum tersedia */
  startsAt: string | null;
  status: 'upcoming' | 'live' | 'finished';
  streamUrl: string | null;
  description: string;
  hue: number;
  isDemo: boolean;
}

export type WatchKind = 'movie' | 'series' | 'anime';

export interface WatchProgress {
  key: string;
  type: WatchKind;
  contentId: string;
  season?: number;
  episode?: number;
  /** detik */
  position: number;
  /** detik */
  duration: number;
  updatedAt: number;
}

export type ListType = 'movie' | 'series' | 'anime' | 'channel';

export interface ListEntry {
  type: ListType;
  id: string;
}

/** Bentuk seragam untuk kartu konten, hasil pemetaan dari semua tipe data. */
export interface CardData {
  key: string;
  type: 'movie' | 'series' | 'anime' | 'channel' | 'sports';
  id: string;
  title: string;
  subtitle?: string;
  year?: number;
  genres: string[];
  rating?: number;
  hue: number;
  poster?: string;
  isDemo: boolean;
  isLive?: boolean;
  /** 0 - 1 */
  progress?: number;
  to: string;
}
