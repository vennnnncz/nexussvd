import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ContentCarousel from '../components/ContentCarousel';
import HeroBanner from '../components/HeroBanner';
import PageLoader from '../components/PageLoader';
import PageShell, { EmptyState } from '../components/PageShell';
import { useCatalog } from '../hooks/useCatalog';
import { useMyList } from '../hooks/useMyList';
import { useProgress } from '../hooks/useProgress';
import {
  animeCard,
  byAdded,
  byPopularity,
  channelCard,
  continueCards,
  getAllContent,
  getContent,
  latestEpisodeCards,
  movieCard,
  seriesCard,
  sportsCard,
  toCard,
} from '../lib/catalog';

export default function HomePage() {
  const c = useCatalog();
  const { list } = useProgress();
  const { entries } = useMyList();

  const all = getAllContent();
  const trending = byPopularity(all.filter((i) => i.trending));
  const featured = (trending.length > 0 ? trending : byPopularity(all)).slice(0, 4);
  const upcoming = all.filter((i) => i.schedule);

  const recommended = useMemo(() => {
    // Genre dari My List dan tontonan terakhir dipakai sebagai sinyal; bila kosong, urut rating.
    const seedGenres = new Set<string>();
    entries.forEach((e) => {
      if (e.type !== 'channel') getContent(e.type, e.id)?.genres.forEach((g) => seedGenres.add(g));
    });
    list.forEach((p) => getContent(p.type, p.contentId)?.genres.forEach((g) => seedGenres.add(g)));
    const owned = new Set([...entries.map((e) => e.id), ...list.map((p) => p.contentId)]);
    return getAllContent()
      .filter((i) => !owned.has(i.id))
      .map((i) => ({ i, score: i.genres.filter((g) => seedGenres.has(g)).length }))
      .sort((a, b) => b.score - a.score || (b.i.rating ?? 0) - (a.i.rating ?? 0))
      .slice(0, 14)
      .map((x) => toCard(x.i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, list, c]);

  if (c.loading) return <PageLoader />;

  if (all.length === 0 && c.channels.length === 0) {
    return (
      <PageShell>
        <EmptyState
          title={c.error ? 'Data gagal dimuat' : 'Belum ada konten'}
          description={c.error ?? 'Tambahkan konten lewat dashboard admin.'}
          action={
            <Link to="/admin" className="btn-primary">
              Buka Admin
            </Link>
          }
        />
      </PageShell>
    );
  }

  return (
    <div>
      <HeroBanner items={featured} />
      <div className="mx-auto max-w-[1600px] pb-6">
        <ContentCarousel title="Trending Now" items={trending.map(toCard)} />
        <ContentCarousel title="Continue Watching" items={continueCards(list)} to="/my-list" />
        <ContentCarousel title="Popular Movies" items={byPopularity(c.movieOnly).map(movieCard)} to="/movies" />
        <ContentCarousel title="Popular Series" items={byPopularity(c.series).map(seriesCard)} to="/series" />
        <ContentCarousel title="Latest Episodes" items={latestEpisodeCards()} to="/series" />
        <ContentCarousel title="Live TV Channels" items={c.channels.map(channelCard)} to="/live-tv" />
        <ContentCarousel title="Anime Collection" items={byPopularity(c.anime).map(animeCard)} to="/anime" />
        <ContentCarousel title="Sports & Events" items={c.sportsEvents.map(sportsCard)} to="/sports" />
        <ContentCarousel title="Documentaries" items={c.documentaries.map(movieCard)} to="/documentaries" />
        <ContentCarousel title="Coming Soon" items={upcoming.map(toCard)} />
        <ContentCarousel title="Recently Added" items={byAdded(all).slice(0, 14).map(toCard)} />
        <ContentCarousel title="Recommended For You" items={recommended} />
      </div>
    </div>
  );
}
