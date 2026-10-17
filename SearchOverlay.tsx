import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, Loader2, Search, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { useCatalog } from '../hooks/useCatalog';
import { useStoredState } from '../hooks/useStoredState';
import { searchAll, type SearchCategory, type SearchHit } from '../lib/catalog';

const categories: { value: SearchCategory; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'movie', label: 'Movies' },
  { value: 'series', label: 'Series' },
  { value: 'anime', label: 'Anime' },
  { value: 'channel', label: 'Live TV' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'sports', label: 'Sports' },
];

const NO_RECENT: string[] = [];

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useStoredState<string[]>('nx.recent', NO_RECENT);
  const debounced = useDebounce(query, 220);
  const catalog = useCatalog();

  const loading = query.trim() !== debounced.trim();
  const { hits, error } = useMemo<{ hits: SearchHit[]; error: string | null }>(() => {
    try {
      return { hits: searchAll(debounced, category), error: null };
    } catch {
      return { hits: [], error: 'Pencarian gagal. Coba lagi.' };
    }
  }, [debounced, category, catalog]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      window.setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setCategory('all');
      setActive(0);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => setActive(0), [debounced, category]);

  useEffect(() => {
    document.getElementById(`sr-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const remember = (term: string) => {
    const t = term.trim();
    if (!t) return;
    setRecent((prev) => [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6));
  };

  const go = (hit: SearchHit) => {
    remember(query);
    onClose();
    navigate(hit.to);
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(hits.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && hits[active]) {
      e.preventDefault();
      go(hits[active]);
    }
  };

  const hasQuery = debounced.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-nx-bg/95 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Pencarian" onKeyDown={onKeyDown}>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden px-4 pt-4 md:pt-12">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-nx-muted" aria-hidden />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari film, serial, anime, channel, acara olahraga"
              className="input h-12 pl-12 text-base"
              aria-label="Kata kunci pencarian"
              autoComplete="off"
            />
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup pencarian" className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button key={c.value} type="button" onClick={() => setCategory(c.value)} className={`chip shrink-0 ${category === c.value ? 'chip-on' : ''}`}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex-1 overflow-y-auto pb-24" role="listbox" aria-label="Hasil pencarian">
          {!hasQuery && !loading && (
            <div>
              {recent.length > 0 ? (
                <>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-nx-muted">Pencarian terakhir</p>
                    <button type="button" onClick={() => setRecent([])} className="text-xs text-nx-cyan hover:underline">Hapus</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button key={r} type="button" onClick={() => setQuery(r)} className="chip">
                        <Clock className="mr-1.5 h-3 w-3" aria-hidden /> {r}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="py-10 text-center text-sm text-nx-muted">Ketik untuk mulai mencari. Gunakan panah atas/bawah dan Enter untuk memilih.</p>
              )}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-nx-muted" role="status">
              <Loader2 className="h-5 w-5 animate-spin" /> Mencari...
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-amber-400">
              <AlertTriangle className="h-5 w-5" /> {error}
            </div>
          )}

          {!loading && !error && hasQuery && hits.length === 0 && (
            <p className="py-10 text-center text-sm text-nx-muted">Tidak ada hasil untuk &quot;{debounced}&quot;.</p>
          )}

          {!loading && !error && hits.map((h, i) => (
            <button
              key={h.key}
              id={`sr-${i}`}
              type="button"
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(h)}
              className={`flex min-h-[56px] w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${i === active ? 'bg-nx-accent/20' : 'hover:bg-white/5'}`}
            >
              <span className="h-12 w-9 shrink-0 rounded-md" style={{ background: `linear-gradient(155deg, hsl(${h.hue} 75% 42%), hsl(${(h.hue + 50) % 360} 70% 18%))` }} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{h.title}</span>
                <span className="block truncate text-xs text-nx-muted">{h.meta}</span>
              </span>
              <span className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-nx-cyan">{h.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
