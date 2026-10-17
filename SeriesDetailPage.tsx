import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import ContentCarousel from '../components/ContentCarousel';
import DetailHero from '../components/DetailHero';
import { useProgress } from '../hooks/useProgress';
import PageLoader from '../components/PageLoader';
import { useCatalog } from '../hooks/useCatalog';
import { getSeries, progressKey, related, watchPath } from '../lib/catalog';
import NotFoundPage from './NotFoundPage';

export default function SeriesDetailPage() {
  const { seriesId } = useParams();
  const c = useCatalog();
  const show = getSeries(seriesId);
  const { list, get } = useProgress();

  const last = useMemo(() => {
    if (!show) return undefined;
    return list
      .filter((p) => p.type === 'series' && p.contentId === show.id && p.duration > 0 && p.position / p.duration < 0.97)
      .sort((a, b) => b.updatedAt - a.updatedAt)[0];
  }, [list, show]);

  const [selected, setSelected] = useState<number | null>(null);

  if (!show && c.loading) return <PageLoader />;
  if (!show) return <NotFoundPage message="Serial tidak ditemukan atau tidak lagi tersedia." />;

  const seasonNumber = selected ?? last?.season ?? show.seasons[0]?.number ?? 1;
  const season = show.seasons.find((s) => s.number === seasonNumber) ?? show.seasons[0];
  const totalEpisodes = show.seasons.reduce((n, s) => n + s.episodes.length, 0);

  return (
    <div>
      <DetailHero
        item={show}
        meta={[
          ...(show.year > 0 ? [`Mulai ${show.year}`] : []),
          ...(show.schedule ? [`Jadwal: ${show.schedule}`] : []),
          ...(show.status ? [show.status === 'Ongoing' ? 'Sedang tayang' : 'Selesai'] : []),
          `${show.seasons.length} season`,
          `${totalEpisodes} episode`,
        ]}
        watchTo={watchPath('series', show.id, 1, 1)}
        watchLabel="Mulai dari Episode 1"
        extraAction={
          last ? (
            <Link to={watchPath('series', show.id, last.season ?? 1, last.episode ?? 1)} className="btn-ghost">
              <Play className="h-5 w-5" aria-hidden /> Continue Watching S{last.season} E{last.episode}
            </Link>
          ) : undefined
        }
      >
        {show.isDemo && <p className="mt-4 text-xs text-nx-muted">Informasi season, episode, dan status adalah data contoh (DEMO), bukan data resmi.</p>}
      </DetailHero>

      <div className="mx-auto max-w-[1600px] px-4 md:px-10">
        <h2 className="mb-3 font-display text-xl font-bold">Episode</h2>
        <div className="scrollbar-none mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Pilih season">
          {show.seasons.map((s) => (
            <button
              key={s.number}
              type="button"
              role="tab"
              aria-selected={s.number === season.number}
              onClick={() => setSelected(s.number)}
              className={`chip shrink-0 ${s.number === season.number ? 'chip-on' : ''}`}
            >
              {s.name || `Season ${s.number}`}
            </button>
          ))}
        </div>

        {!season || season.episodes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-nx-line px-4 py-8 text-center text-sm text-nx-muted">Belum ada episode.</p>
        ) : (
        <ul className="grid gap-2 md:grid-cols-2">
          {season.episodes.map((ep) => {
            const p = get(progressKey('series', show.id, season.number, ep.number));
            const pct = p && p.duration > 0 ? Math.min(100, Math.round((p.position / p.duration) * 100)) : 0;
            return (
              <li key={ep.id}>
                <Link
                  to={watchPath('series', show.id, season.number, ep.number)}
                  className="flex min-h-[64px] items-center gap-3 rounded-xl border border-nx-line bg-nx-card px-4 py-3 transition hover:border-nx-accent"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-nx-accent/20 font-display font-bold">{ep.number}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{ep.title}</span>
                    <span className="block text-xs text-nx-muted">{ep.duration ? `${ep.duration} menit` : 'Episode'}{ep.videoUrl ? '' : ' - video belum tersedia'}</span>
                    {pct > 0 && (
                      <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-white/10">
                        <span className="block h-full bg-nx-accent" style={{ width: `${pct}%` }} />
                      </span>
                    )}
                  </span>
                  <Play className="h-4 w-4 shrink-0 text-nx-muted" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
        )}
      </div>

      <div className="mx-auto mt-6 max-w-[1600px] pb-6">
        <ContentCarousel title="Serial Serupa" items={related(show)} />
      </div>
    </div>
  );
}
