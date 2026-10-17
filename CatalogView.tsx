import { useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { toCard, uniqueGenres, type AnyContent } from '../lib/catalog';
import ContentCard from './ContentCard';
import PageShell, { EmptyState, PageHeading } from './PageShell';

export type SortKey = 'popular' | 'year' | 'added' | 'trending';

const sortLabels: Record<SortKey, string> = {
  popular: 'Popularitas',
  year: 'Tahun rilis',
  added: 'Terbaru ditambahkan',
  trending: 'Trending',
};

interface QuickFilter {
  label: string;
  test: (item: AnyContent) => boolean;
}

interface Props {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  items: AnyContent[];
  sorts?: SortKey[];
  quickFilters?: QuickFilter[];
  pageSize?: number;
}

export default function CatalogView({
  title,
  subtitle,
  icon,
  items,
  sorts = ['popular', 'year', 'added'],
  quickFilters,
  pageSize = 12,
}: Props) {
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState(params.get('genre') ?? 'all');
  const [year, setYear] = useState('all');
  const [sort, setSort] = useState<SortKey>(sorts[0]);
  const [quick, setQuick] = useState(-1);
  const [visible, setVisible] = useState(pageSize);

  const genres = useMemo(() => uniqueGenres(items), [items]);
  const years = useMemo(() => Array.from(new Set(items.map((i) => i.year).filter((y) => y > 0))).sort((a, b) => b - a), [items]);

  const result = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter((i) => {
      if (q && !i.title.toLowerCase().includes(q)) return false;
      if (genre !== 'all' && !i.genres.includes(genre)) return false;
      if (year !== 'all' && String(i.year) !== year) return false;
      if (quick >= 0 && quickFilters && !quickFilters[quick].test(i)) return false;
      return true;
    });
    if (sort === 'trending') list = list.filter((i) => i.trending);
    return [...list].sort((a, b) => {
      if (sort === 'year') return b.year - a.year;
      if (sort === 'added') return b.addedAt.localeCompare(a.addedAt);
      return b.popularity - a.popularity;
    });
  }, [items, query, genre, year, sort, quick, quickFilters]);

  const reset = () => {
    setQuery('');
    setGenre('all');
    setYear('all');
    setQuick(-1);
    setVisible(pageSize);
  };

  return (
    <PageShell>
      <PageHeading title={title} subtitle={subtitle} icon={icon} />

      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-muted" aria-hidden />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(pageSize);
            }}
            placeholder="Cari berdasarkan judul"
            aria-label="Cari berdasarkan judul"
            className="input pl-10"
          />
        </div>
        <select
          aria-label="Filter tahun"
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            setVisible(pageSize);
          }}
          className="input md:w-40"
        >
          <option value="all">Semua tahun</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select aria-label="Urutkan" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="input md:w-52">
          {sorts.map((s) => (
            <option key={s} value={s}>
              {sortLabels[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="scrollbar-none mb-6 flex gap-2 overflow-x-auto pb-1">
        <button type="button" onClick={() => setGenre('all')} className={`chip shrink-0 ${genre === 'all' ? 'chip-on' : ''}`}>
          Semua genre
        </button>
        {genres.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => {
              setGenre(g);
              setVisible(pageSize);
            }}
            className={`chip shrink-0 ${genre === g ? 'chip-on' : ''}`}
          >
            {g}
          </button>
        ))}
        {quickFilters?.map((f, i) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setQuick((cur) => (cur === i ? -1 : i))}
            className={`chip shrink-0 border-nx-violet/40 ${quick === i ? 'chip-on' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {result.length === 0 ? (
        <EmptyState
          title="Tidak ada hasil"
          description="Coba ubah kata kunci atau filter yang digunakan."
          action={
            <button type="button" className="btn-ghost" onClick={reset}>
              Reset filter
            </button>
          }
        />
      ) : (
        <>
          <p className="mb-3 text-xs text-nx-muted">{result.length} judul </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 md:gap-x-4 lg:grid-cols-5 xl:grid-cols-6">
            {result.slice(0, visible).map((i) => (
              <ContentCard key={`${i.type}-${i.id}`} item={toCard(i)} fluid />
            ))}
          </div>
          {visible < result.length && (
            <div className="mt-8 flex justify-center">
              <button type="button" className="btn-ghost" onClick={() => setVisible((v) => v + pageSize)}>
                Tampilkan lebih banyak
              </button>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
