import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarClock, Trophy, X } from 'lucide-react';
import PageShell, { EmptyState, PageHeading } from '../components/PageShell';
import { sportCategories } from '../data/sports';
import { useCatalog } from '../hooks/useCatalog';
import { formatDateTime } from '../lib/format';
import { getSportsEvent } from '../lib/catalog';
import type { SportCategory, SportsEvent } from '../types';

function EventCard({ event, onOpen }: { event: SportsEvent; onOpen: () => void }) {
  const live = event.status === 'live' && !!event.streamUrl;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-4 rounded-xl border border-nx-line bg-nx-card p-4 text-left transition hover:border-nx-accent"
    >
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `linear-gradient(145deg, hsl(${event.hue} 70% 40%), hsl(${(event.hue + 50) % 360} 65% 16%))` }}
      >
        <Trophy className="h-6 w-6 text-white/80" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{event.title}</span>
        <span className="block truncate text-xs text-nx-muted">
          {event.sport} - {event.league}
        </span>
        <span className="mt-1 flex items-center gap-1 text-xs text-nx-cyan">
          <CalendarClock className="h-3.5 w-3.5" aria-hidden /> {formatDateTime(event.startsAt)}
        </span>
      </span>
      {live && <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-bold">LIVE</span>}
      {event.isDemo && <span className="badge-demo">DEMO</span>}
    </button>
  );
}

export default function SportsPage() {
  const { sportsEvents } = useCatalog();
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState<SportCategory | 'all'>('all');
  const selected = getSportsEvent(params.get('event'));

  const filtered = useMemo(() => sportsEvents.filter((e) => category === 'all' || e.sport === category), [sportsEvents, category]);
  const liveEvents = filtered.filter((e) => e.status === 'live' && !!e.streamUrl);
  const upcoming = filtered.filter((e) => e.status === 'upcoming');

  return (
    <PageShell>
      <PageHeading
        title="Sports"
        subtitle="Acara dan jadwal olahraga. Halaman ini belum terhubung ke API olahraga, jadi jadwal, skor, dan status LIVE baru tampil setelah sumber data dihubungkan."
        icon={<Trophy className="h-7 w-7" />}
      />

      <div className="scrollbar-none mb-6 flex gap-2 overflow-x-auto pb-1">
        <button type="button" onClick={() => setCategory('all')} className={`chip shrink-0 ${category === 'all' ? 'chip-on' : ''}`}>
          Semua
        </button>
        {sportCategories.map((c) => (
          <button key={c} type="button" onClick={() => setCategory(c)} className={`chip shrink-0 ${category === c ? 'chip-on' : ''}`}>
            {c}
          </button>
        ))}
      </div>

      {selected && (
        <section className="relative mb-8 overflow-hidden rounded-2xl border border-nx-line p-5 md:p-8" style={{ background: `linear-gradient(135deg, hsl(${selected.hue} 60% 22%), #0b0d1a 70%)` }} aria-label="Detail acara">
          <button type="button" onClick={() => setParams({})} aria-label="Tutup detail" className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">{selected.sport}</span>
            <span className="chip">{selected.league}</span>
            {selected.isDemo && <span className="badge-demo">DEMO</span>}
          </div>
          <h2 className="mt-3 font-display text-2xl font-extrabold md:text-3xl">{selected.title}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-nx-cyan">
            <CalendarClock className="h-4 w-4" aria-hidden /> {formatDateTime(selected.startsAt)}
          </p>
          <p className="mt-3 max-w-2xl text-sm text-nx-text/80">{selected.description}</p>
          <p className="mt-3 text-sm font-medium">{selected.streamUrl ? 'Tautan siaran resmi tersedia.' : 'Tautan siaran resmi belum tersedia.'}</p>
        </section>
      )}

      <h2 className="mb-3 font-display text-xl font-bold">Live Events</h2>
      {liveEvents.length === 0 ? (
        <div className="mb-8">
          <EmptyState title="Tidak ada acara LIVE saat ini" description="Status LIVE hanya ditampilkan bila API olahraga dan stream resmi terhubung." />
        </div>
      ) : (
        <div className="mb-8 grid gap-3 md:grid-cols-2">
          {liveEvents.map((e) => (
            <EventCard key={e.id} event={e} onOpen={() => setParams({ event: e.id })} />
          ))}
        </div>
      )}

      <h2 className="mb-3 font-display text-xl font-bold">Upcoming Events</h2>
      {upcoming.length === 0 ? (
        <EmptyState title="Belum ada acara" description="Tidak ada acara pada kategori ini." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {upcoming.map((e) => (
            <EventCard key={e.id} event={e} onOpen={() => setParams({ event: e.id })} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
