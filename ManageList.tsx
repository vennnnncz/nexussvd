import { useMemo, useState } from 'react';
import { Pencil, Search, Trash2 } from 'lucide-react';
import { useCatalog } from '../../hooks/useCatalog';
import { deleteContent } from '../../lib/adminApi';
import { pushTime, type RawItem } from '../../lib/mapper';

export default function ManageList({ onEdit }: { onEdit: (id: string, raw: RawItem) => void }) {
  const { raw } = useCatalog();
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return Object.entries(raw)
      .filter(([, v]) => v && v.title && (!term || v.title.toLowerCase().includes(term)))
      .sort((a, b) => pushTime(b[0]) - pushTime(a[0]));
  }, [raw, q]);

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Hapus "${title}" secara permanen?`)) return;
    try {
      await deleteContent(id);
      setError(null);
    } catch {
      setError('Gagal menghapus. Pastikan Firebase Rules mengizinkan admin menulis.');
    }
  };

  return (
    <div>
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-muted" aria-hidden />
        <input className="input pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari judul" aria-label="Cari judul" />
      </div>
      {error && <p className="mb-3 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-300">{error}</p>}
      <p className="mb-2 text-xs text-nx-muted">{rows.length} item</p>
      <ul className="space-y-2">
        {rows.map(([id, v]) => (
          <li key={id} className="flex items-center gap-3 rounded-xl border border-nx-line bg-nx-card p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{v.title}</p>
              <p className="truncate text-xs text-nx-muted">
                {v.type === 'livetv' ? 'Live TV' : v.type === 'series' ? 'Series' : 'Film'} - {v.category}
                {v.schedule && v.schedule !== 'Tersedia' ? ` - Jadwal: ${v.schedule}` : ''}
              </p>
            </div>
            <button type="button" aria-label={`Edit ${v.title}`} onClick={() => onEdit(id, v)} className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10">
              <Pencil className="h-4 w-4" />
            </button>
            <button type="button" aria-label={`Hapus ${v.title}`} onClick={() => remove(id, v.title ?? id)} className="flex h-11 w-11 items-center justify-center rounded-lg text-red-400 hover:bg-red-500/10">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
