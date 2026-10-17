import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, X } from 'lucide-react';
import ContentCard from '../components/ContentCard';
import ContentCarousel from '../components/ContentCarousel';
import PageShell, { EmptyState, PageHeading } from '../components/PageShell';
import PageLoader from '../components/PageLoader';
import { useCatalog } from '../hooks/useCatalog';
import { useMyList } from '../hooks/useMyList';
import { useProgress } from '../hooks/useProgress';
import { channelCard, continueCards, getChannel, getContent, toCard } from '../lib/catalog';
import type { CardData, ListEntry, ListType } from '../types';

const tabs: { value: ListType | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'movie', label: 'Movies' },
  { value: 'series', label: 'Series' },
  { value: 'anime', label: 'Anime' },
  { value: 'channel', label: 'Channels' },
];

function toItem(e: ListEntry): CardData | null {
  if (e.type === 'channel') {
    const c = getChannel(e.id);
    return c ? channelCard(c) : null;
  }
  const c = getContent(e.type, e.id);
  return c ? toCard(c) : null;
}

export default function MyListPage() {
  const { loading } = useCatalog();
  const { entries, toggle } = useMyList();
  const { list, remove } = useProgress();
  const [tab, setTab] = useState<ListType | 'all'>('all');

  const visible = useMemo(() => entries.filter((e) => tab === 'all' || e.type === tab), [entries, tab]);
  const missing = visible.filter((e) => !toItem(e));
  const cards = visible.map(toItem).filter((c): c is CardData => c !== null);
  const continuing = continueCards(list);

  if (loading) return <PageLoader />;

  return (
    <PageShell>
      <PageHeading
        title="My List"
        subtitle="Daftar tontonan dan channel favorit Anda. Data disimpan di perangkat ini (tanpa akun)."
        icon={<Bookmark className="h-7 w-7" />}
      />

      {continuing.length > 0 && (
        <div className="-mx-4 mb-4 md:-mx-10">
          <ContentCarousel title="Continue Watching" items={continuing} />
          <div className="mt-1 flex flex-wrap gap-2 px-4 md:px-10">
            {list.map((p) => (
              <button key={p.key} type="button" onClick={() => remove(p.key)} className="chip">
                <X className="mr-1 h-3 w-3" aria-hidden /> Hapus progres {p.type === 'movie' ? '' : `${p.season ? `S${p.season} ` : ''}E${p.episode} `}({p.contentId})
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="scrollbar-none mb-5 flex gap-2 overflow-x-auto pb-1" role="tablist">
        {tabs.map((t) => (
          <button key={t.value} type="button" role="tab" aria-selected={tab === t.value} onClick={() => setTab(t.value)} className={`chip shrink-0 ${tab === t.value ? 'chip-on' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {cards.length === 0 && missing.length === 0 ? (
        <EmptyState
          title="My List masih kosong"
          description="Tekan tombol plus pada kartu atau halaman detail untuk menyimpan film, serial, anime, atau channel favorit."
          action={
            <Link to="/movies" className="btn-primary">
              Jelajahi Movies
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {cards.map((c) => (
            <ContentCard key={c.key} item={c} fluid />
          ))}
        </div>
      )}

      {missing.length > 0 && (
        <div className="mt-8 space-y-2">
          <p className="text-sm font-semibold">Item yang tidak lagi tersedia</p>
          {missing.map((e) => (
            <div key={`${e.type}-${e.id}`} className="flex items-center justify-between rounded-xl border border-nx-line bg-nx-card px-4 py-3 text-sm">
              <span className="text-nx-muted">
                {e.type}: {e.id}
              </span>
              <button type="button" onClick={() => toggle(e.type, e.id)} aria-label={`Hapus ${e.id}`} className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
