import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart, Radio, Search } from 'lucide-react';
import LiveTVPlayer from '../components/LiveTVPlayer';
import PageShell, { EmptyState, PageHeading } from '../components/PageShell';
import Poster from '../components/Poster';
import PageLoader from '../components/PageLoader';
import { channelCategories } from '../data/channels';
import { useCatalog } from '../hooks/useCatalog';
import { trackWatch } from '../lib/adminApi';
import { useMyList } from '../hooks/useMyList';
import { getChannel } from '../lib/catalog';
import type { ChannelCategory } from '../types';
import NotFoundPage from './NotFoundPage';

export default function LiveTVPage() {
  const { channelId } = useParams();
  const { channels, loading } = useCatalog();
  const { has, toggle } = useMyList();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ChannelCategory | 'all' | 'favorites'>('all');

  const selected = channelId ? getChannel(channelId) : undefined;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return channels.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (category === 'favorites') return has('channel', c.id);
      if (category !== 'all' && c.category !== category) return false;
      return true;
    });
  }, [channels, query, category, has]);

  useEffect(() => {
    if (selected?.streamUrl) trackWatch(selected.id);
  }, [selected?.id, selected?.streamUrl]);

  if (channelId && !selected && loading) return <PageLoader />;
  if (channelId && !selected) return <NotFoundPage message="Channel tidak ditemukan." />;

  return (
    <PageShell>
      <PageHeading
        title="Live TV"
        subtitle="Daftar channel dan siaran langsung. Status LIVE mengikuti pengaturan admin dan hanya tampil bila ada sumber siaran."
        icon={<Radio className="h-7 w-7" />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          {selected ? (
            <LiveTVPlayer channel={selected} />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-nx-line px-6 text-center">
              <Radio className="h-10 w-10 text-nx-muted" aria-hidden />
              <p className="text-sm text-nx-muted">Pilih channel untuk mulai menonton.</p>
            </div>
          )}
        </div>

        <aside aria-label="Daftar channel">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-muted" aria-hidden />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari channel" aria-label="Cari channel" className="input pl-10" />
          </div>
          <div className="scrollbar-none my-3 flex gap-2 overflow-x-auto pb-1">
            <button type="button" onClick={() => setCategory('all')} className={`chip shrink-0 ${category === 'all' ? 'chip-on' : ''}`}>
              Semua
            </button>
            <button type="button" onClick={() => setCategory('favorites')} className={`chip shrink-0 ${category === 'favorites' ? 'chip-on' : ''}`}>
              Favorit
            </button>
            {channelCategories.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} className={`chip shrink-0 ${category === c ? 'chip-on' : ''}`}>
                {c}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="Channel tidak ditemukan" description={category === 'favorites' ? 'Belum ada channel favorit.' : 'Coba kata kunci atau kategori lain.'} />
          ) : (
            <ul className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
              {filtered.map((c) => {
                const live = c.isLive && !!c.streamUrl;
                const fav = has('channel', c.id);
                return (
                  <li key={c.id} className={`flex items-center gap-2 rounded-xl border p-2 transition ${selected?.id === c.id ? 'border-nx-accent bg-nx-accent/10' : 'border-nx-line bg-nx-card'}`}>
                    <Link to={`/live-tv/${c.id}`} className="flex min-h-[56px] min-w-0 flex-1 items-center gap-3">
                      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                        <Poster hue={c.hue} title={c.name} type="channel" src={c.logo ?? undefined} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{c.name}</p>
                        <p className="truncate text-xs text-nx-muted">{c.category}{c.quality ? ` - ${c.quality}` : ''}</p>
                        <p className="truncate text-[11px] text-nx-muted">
                          {c.streamUrl ? (c.liveStatus === 'replay' ? 'Tayang ulang' : c.liveStatus === 'scheduled' ? 'Terjadwal' : live ? 'Sedang siaran' : '') : 'Siaran belum tersedia.'}
                        </p>
                      </div>
                    </Link>
                    {live && <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-bold">LIVE</span>}
                    {c.isDemo && <span className="badge-demo">DEMO</span>}
                    <button
                      type="button"
                      onClick={() => toggle('channel', c.id)}
                      aria-pressed={fav}
                      aria-label={fav ? `Hapus ${c.name} dari favorit` : `Jadikan ${c.name} favorit`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-white/10"
                    >
                      <Heart className={`h-5 w-5 ${fav ? 'fill-nx-accent text-nx-accent' : 'text-nx-muted'}`} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
