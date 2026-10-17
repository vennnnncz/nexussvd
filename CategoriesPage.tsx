import { Link } from 'react-router-dom';
import { Baby, BookOpen, Clapperboard, Radio, Sparkles, Trophy, Tv } from 'lucide-react';
import PageShell, { PageHeading } from '../components/PageShell';
import { useCatalog } from '../hooks/useCatalog';
import { uniqueGenres } from '../lib/catalog';

const tiles = [
  { to: '/movies', label: 'Movies', Icon: Clapperboard, hue: 215 },
  { to: '/series', label: 'TV Series', Icon: Tv, hue: 265 },
  { to: '/live-tv', label: 'Live TV', Icon: Radio, hue: 190 },
  { to: '/anime', label: 'Anime', Icon: Sparkles, hue: 320 },
  { to: '/sports', label: 'Sports', Icon: Trophy, hue: 150 },
  { to: '/documentaries', label: 'Documentaries', Icon: BookOpen, hue: 40 },
  { to: '/kids', label: 'Kids & Family', Icon: Baby, hue: 55 },
];

export default function CategoriesPage() {
  const c = useCatalog();
  const genres = uniqueGenres(c.movieOnly);
  return (
    <PageShell>
      <PageHeading title="Categories" subtitle="Pilih kategori hiburan atau jelajahi film berdasarkan genre." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {tiles.map(({ to, label, Icon, hue }) => (
          <Link
            key={to}
            to={to}
            className="group relative flex min-h-[110px] flex-col justify-between overflow-hidden rounded-2xl p-4 ring-1 ring-white/10 transition hover:-translate-y-1 hover:shadow-glow"
            style={{ background: `linear-gradient(145deg, hsl(${hue} 70% 34%), hsl(${(hue + 50) % 360} 65% 14%))` }}
          >
            <Icon className="h-7 w-7 text-white/80" aria-hidden />
            <span className="font-display text-base font-bold">{label}</span>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-10 font-display text-xl font-bold">Genre film</h2>
      <div className="flex flex-wrap gap-2">
        {genres.map((g) => (
          <Link key={g} to={`/movies?genre=${encodeURIComponent(g)}`} className="chip">
            {g}
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
