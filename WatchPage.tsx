import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, SkipBack, SkipForward } from 'lucide-react';
import NotFoundPage from './NotFoundPage';
import PageLoader from '../components/PageLoader';
import VideoPlayer from '../components/VideoPlayer';
import { useCatalog } from '../hooks/useCatalog';
import { trackWatch } from '../lib/adminApi';
import { useBack } from '../hooks/useBack';
import { useProgress } from '../hooks/useProgress';
import { findEpisode, getAnime, getMovie, getSeries, progressKey, watchPath } from '../lib/catalog';
import { formatDuration, parsePositiveInt } from '../lib/format';
import type { DownloadLink, Episode, SubtitleTrack } from '../types';

type Kind = 'movie' | 'series' | 'anime';

interface Resolved {
  type: Kind;
  contentId: string;
  title: string;
  heading: string;
  detailTo: string;
  src: string | null;
  isDemo: boolean;
  subtitles?: SubtitleTrack[];
  downloads?: DownloadLink[];
  season?: number;
  episode?: number;
  prev?: string;
  next?: string;
  episodes?: { label: string; to: string; active: boolean; hasVideo: boolean }[];
  seasons?: { number: number; to: string; active: boolean }[];
  info: string;
}

function resolve(kind: Kind, params: Record<string, string | undefined>): Resolved | 'invalid' | 'missing' {
  if (kind === 'movie') {
    const m = getMovie(params.movieId);
    if (!m) return 'missing';
    return {
      type: 'movie',
      contentId: m.id,
      title: m.title,
      heading: m.title,
      detailTo: `/detail/movie/${m.id}`,
      src: m.videoUrl,
      isDemo: m.isDemo,
      subtitles: m.subtitles,
      downloads: m.downloads,
      info: [m.year || '', m.duration ? formatDuration(m.duration) : '', m.genres.join(', ')].filter(Boolean).join(' - '),
    };
  }

  if (kind === 'series') {
    const sn = parsePositiveInt(params.seasonNumber);
    const en = parsePositiveInt(params.episodeNumber);
    if (sn === null || en === null) return 'invalid';
    const s = getSeries(params.seriesId);
    if (!s) return 'missing';
    const ep = findEpisode(s, sn, en);
    if (!ep) return 'missing';
    const season = s.seasons.find((x) => x.number === sn)!;
    const flat: { sn: number; ep: Episode }[] = s.seasons.flatMap((x) => x.episodes.map((e) => ({ sn: x.number, ep: e })));
    const idx = flat.findIndex((f) => f.sn === sn && f.ep.number === en);
    const prev = flat[idx - 1];
    const next = flat[idx + 1];
    return {
      type: 'series',
      contentId: s.id,
      title: s.title,
      heading: `${s.title} - S${sn} E${en}`,
      detailTo: `/detail/series/${s.id}`,
      src: ep.videoUrl,
      isDemo: s.isDemo,
      season: sn,
      episode: en,
      prev: prev ? watchPath('series', s.id, prev.sn, prev.ep.number) : undefined,
      next: next ? watchPath('series', s.id, next.sn, next.ep.number) : undefined,
      episodes: season.episodes.map((e) => ({
        label: `Episode ${e.number}`,
        to: watchPath('series', s.id, sn, e.number),
        active: e.number === en,
        hasVideo: !!e.videoUrl,
      })),
      seasons: s.seasons.map((x) => ({
        number: x.number,
        to: watchPath('series', s.id, x.number, 1),
        active: x.number === sn,
      })),
      downloads: ep.downloads,
      info: `Season ${sn}, Episode ${en}${ep.duration ? ` - ${ep.duration} menit` : ''}`,
    };
  }

  const en = parsePositiveInt(params.episodeNumber);
  if (en === null) return 'invalid';
  const a = getAnime(params.animeId);
  if (!a) return 'missing';
  const idx = a.episodes.findIndex((e) => e.number === en);
  if (idx < 0) return 'missing';
  const ep = a.episodes[idx];
  const prev = a.episodes[idx - 1];
  const next = a.episodes[idx + 1];
  return {
    type: 'anime',
    contentId: a.id,
    title: a.title,
    heading: a.format === 'movie' ? a.title : `${a.title} - Episode ${en}`,
    detailTo: `/detail/anime/${a.id}`,
    src: ep.videoUrl,
    isDemo: a.isDemo,
    episode: en,
    prev: prev ? watchPath('anime', a.id, 1, prev.number) : undefined,
    next: next ? watchPath('anime', a.id, 1, next.number) : undefined,
    episodes:
      a.format === 'movie'
        ? undefined
        : a.episodes.map((e) => ({
            label: `Episode ${e.number}`,
            to: watchPath('anime', a.id, 1, e.number),
            active: e.number === en,
            hasVideo: !!e.videoUrl,
          })),
    downloads: ep.downloads,
    info: [a.year || '', a.genres.join(', ')].filter(Boolean).join(' - '),
  };
}

export default function WatchPage({ kind }: { kind: Kind }) {
  const params = useParams();
  const navigate = useNavigate();
  const back = useBack();
  const catalog = useCatalog();
  const { get, save } = useProgress();
  const [theater, setTheater] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => resolve(kind, params), [kind, params, catalog]);
  const resolved = typeof data === 'object' ? data : null;
  const key = resolved ? progressKey(resolved.type, resolved.contentId, resolved.season, resolved.episode) : '';

  const startAt = useMemo(() => {
    const p = key ? get(key) : undefined;
    return p && p.duration > 0 && p.position / p.duration < 0.97 ? p.position : 0;
    // Hanya dibaca sekali per episode; pembaruan progres tidak boleh me-restart pemutar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const onProgress = useCallback(
    (position: number, duration: number) => {
      if (!resolved || !(duration > 0)) return;
      save({
        key,
        type: resolved.type,
        contentId: resolved.contentId,
        season: resolved.season,
        episode: resolved.episode,
        position,
        duration,
        updatedAt: Date.now(),
      });
    },
    [resolved, key, save],
  );

  useEffect(() => {
    if (resolved && resolved.src) trackWatch(resolved.contentId);
  }, [resolved?.contentId, resolved?.src, key]);

  if (data === 'missing' && catalog.loading) return <PageLoader />;
  if (data === 'invalid') return <NotFoundPage message="Alamat tontonan tidak valid. Periksa nomor season atau episode." />;
  if (data === 'missing') return <NotFoundPage message="Konten atau episode tidak ditemukan atau tidak lagi tersedia." />;

  return (
    <div className={`mx-auto px-0 pb-10 pt-16 md:px-10 md:pt-20 ${theater ? 'max-w-none' : 'max-w-6xl'}`}>
      <div className="px-4 md:px-0">
        <button type="button" onClick={back} className="mb-3 inline-flex min-h-[44px] items-center gap-2 text-sm text-nx-muted transition hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Kembali
        </button>
      </div>

      <VideoPlayer
        key={key}
        src={data.src}
        title={data.heading}
        subtitles={data.subtitles}
        startAt={startAt}
        theater={theater}
        onToggleTheater={() => setTheater((t) => !t)}
        onProgress={onProgress}
        onEnded={() => {
          if (data.next) navigate(data.next);
        }}
        demoNotice={data.isDemo && !!data.src}
      />

      <div className="px-4 pt-5 md:px-0">
        <h1 className="font-display text-xl font-bold md:text-3xl">{data.heading}</h1>
        <p className="mt-1 text-sm text-nx-muted">{data.info}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.prev && (
            <Link to={data.prev} className="btn-ghost">
              <SkipBack className="h-4 w-4" aria-hidden /> Sebelumnya
            </Link>
          )}
          {data.next && (
            <Link to={data.next} className="btn-primary">
              Berikutnya <SkipForward className="h-4 w-4" aria-hidden />
            </Link>
          )}
          <Link to={data.detailTo} className="btn-ghost">
            Detail {data.title}
          </Link>
        </div>

        {data.downloads && data.downloads.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-nx-muted">Unduh</span>
            {data.downloads.map((d) => (
              <a key={d.url} href={d.url} target="_blank" rel="noopener noreferrer" className="chip">
                <Download className="mr-1.5 h-3 w-3" aria-hidden /> {d.label}
              </a>
            ))}
          </div>
        )}

        {data.seasons && data.seasons.length > 1 && (
          <div className="scrollbar-none mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Pilih season">
            {data.seasons.map((s) => (
              <Link key={s.number} to={s.to} role="tab" aria-selected={s.active} className={`chip shrink-0 ${s.active ? 'chip-on' : ''}`}>
                Season {s.number}
              </Link>
            ))}
          </div>
        )}

        {data.episodes && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {data.episodes.map((e) => (
              <Link
                key={e.to}
                to={e.to}
                aria-current={e.active ? 'page' : undefined}
                className={`flex min-h-[48px] flex-col justify-center rounded-xl border px-3 py-2 text-sm transition ${
                  e.active ? 'border-nx-accent bg-nx-accent/20' : 'border-nx-line bg-nx-card hover:border-nx-accent/60'
                }`}
              >
                <span className="font-semibold">{e.label}</span>
                {!e.hasVideo && <span className="text-[11px] text-nx-muted">Video belum tersedia</span>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
