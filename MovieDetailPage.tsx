import { useParams } from 'react-router-dom';
import ContentCarousel from '../components/ContentCarousel';
import DetailHero from '../components/DetailHero';
import { useProgress } from '../hooks/useProgress';
import { formatDuration } from '../lib/format';
import PageLoader from '../components/PageLoader';
import { useCatalog } from '../hooks/useCatalog';
import { getMovie, movieCard, progressKey, watchPath } from '../lib/catalog';
import NotFoundPage from './NotFoundPage';

export default function MovieDetailPage() {
  const { movieId } = useParams();
  const c = useCatalog();
  const movie = getMovie(movieId);
  const { get } = useProgress();

  if (!movie && c.loading) return <PageLoader />;
  if (!movie) return <NotFoundPage message="Film tidak ditemukan atau tidak lagi tersedia." />;

  const p = get(progressKey('movie', movie.id));
  const resumable = p && p.duration > 0 && p.position / p.duration < 0.97;
  const categoryLabel = movie.category === 'documentary' ? 'Documentary' : movie.category === 'kids' ? 'Kids & Family' : 'Movie';

  const relatedItems = c.movies
    .filter((m) => m.id !== movie.id && m.category === movie.category)
    .map((m) => ({ m, score: m.genres.filter((g) => movie.genres.includes(g)).length }))
    .sort((a, b) => b.score - a.score || b.m.popularity - a.m.popularity)
    .slice(0, 12)
    .map((x) => movieCard(x.m));

  return (
    <div>
      <DetailHero
        item={movie}
        meta={[movie.year > 0 ? String(movie.year) : '', movie.duration ? formatDuration(movie.duration) : '', movie.language ?? '', categoryLabel, movie.schedule ? `Jadwal: ${movie.schedule}` : ''].filter(Boolean)}
        watchTo={watchPath('movie', movie.id)}
        watchLabel={resumable ? 'Continue Watching' : 'Watch Now'}
      >
        <dl className="mt-6 grid max-w-2xl gap-3 text-sm sm:grid-cols-2">
          {movie.director && (
            <div>
              <dt className="text-xs uppercase tracking-wider text-nx-muted">Sutradara</dt>
              <dd>{movie.director}</dd>
            </div>
          )}
          {movie.cast && movie.cast.length > 0 && (
            <div>
              <dt className="text-xs uppercase tracking-wider text-nx-muted">Pemeran</dt>
              <dd>{movie.cast.join(', ')}</dd>
            </div>
          )}
        </dl>
        {movie.isDemo && <p className="mt-4 text-xs text-nx-muted">Seluruh informasi pada halaman ini adalah data contoh (DEMO).</p>}
      </DetailHero>
      <div className="mx-auto max-w-[1600px] pb-6">
        <ContentCarousel title="Rekomendasi Terkait" items={relatedItems} />
      </div>
    </div>
  );
}
