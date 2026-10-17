import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import ContentCarousel from '../components/ContentCarousel';
import DetailHero from '../components/DetailHero';
import { useProgress } from '../hooks/useProgress';
import PageLoader from '../components/PageLoader';
import { useCatalog } from '../hooks/useCatalog';
import { getAnime, progressKey, related, watchPath } from '../lib/catalog';
import NotFoundPage from './NotFoundPage';

export default function AnimeDetailPage() {
  const { animeId } = useParams();
  const c = useCatalog();
  const item = getAnime(animeId);
  const { list, get } = useProgress();

  const last = useMemo(() => {
    if (!item) return undefined;
    return list
      .filter((p) => p.type === 'anime' && p.contentId === item.id && p.duration > 0 && p.position / p.duration < 0.97)
      .sort((a, b) => b.updatedAt - a.updatedAt)[0];
  }, [list, item]);

  if (!item && c.loading) return <PageLoader />;
  if (!item) return <NotFoundPage message="Anime tidak ditemukan atau tidak lagi tersedia." />;

  return (
    <div>
      <DetailHero
        item={item}
        meta={[
          ...(item.year > 0 ? [String(item.year)] : []),
          ...(item.schedule ? [`Jadwal: ${item.schedule}`] : []),
          item.format === 'movie' ? 'Anime Movie' : 'Anime Series',
          ...(item.format === 'series' ? [`${item.episodes.length} episode`] : []),
          ...(item.status ? [item.status === 'Ongoing' ? 'Sedang tayang' : 'Selesai'] : []),
        ]}
        watchTo={watchPath('anime', item.id, 1, 1)}
        watchLabel={item.format === 'movie' ? 'Watch Now' : 'Mulai dari Episode 1'}
        extraAction={
          last ? (
            <Link to={watchPath('anime', item.id, 1, last.episode ?? 1)} className="btn-ghost">
              <Play className="h-5 w-5" aria-hidden /> Continue Watching E{last.episode}
            </Link>
          ) : undefined
        }
      >
        {item.isDemo && <p className="mt-4 text-xs text-nx-muted">Informasi episode dan status adalah data contoh (DEMO).</p>}
      </DetailHero>

      <div className="mx-auto max-w-[1600px] px-4 md:px-10">
        <h2 className="mb-3 font-display text-xl font-bold">Episode</h2>
        <ul className="grid gap-2 md:grid-cols-2">
          {item.episodes.map((ep) => {
            const p = get(progressKey('anime', item.id, undefined, ep.number));
            const pct = p && p.duration > 0 ? Math.min(100, Math.round((p.position / p.duration) * 100)) : 0;
            return (
              <li key={ep.id}>
                <Link
                  to={watchPath('anime', item.id, 1, ep.number)}
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
      </div>

      <div className="mx-auto mt-6 max-w-[1600px] pb-6">
        <ContentCarousel title="Anime Serupa" items={related(item)} />
      </div>
    </div>
  );
}
