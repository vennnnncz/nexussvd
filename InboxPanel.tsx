import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { adminReply, deleteInbox, watchInbox } from '../../lib/adminApi';
import type { InboxItem } from '../../types';

export default function InboxPanel() {
  const [items, setItems] = useState<InboxItem[] | null>(null);
  const [error, setError] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => watchInbox(setItems, () => setError(true)), []);

  if (error) return <p className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-300">Inbox tidak bisa dibaca. Periksa Firebase Rules (admin harus boleh membaca inbox).</p>;
  if (!items) return <p className="text-sm text-nx-muted">Memuat...</p>;
  if (items.length === 0) return <p className="text-sm text-nx-muted">Inbox kosong.</p>;

  return (
    <ul className="space-y-3">
      {items.map((m) => (
        <li key={m.id} className="rounded-xl border border-nx-line bg-nx-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">
                {m.name} <span className="chip ml-1 min-h-0 py-0.5">{m.type === 'lapor' ? 'Lapor' : 'Request'}</span>
              </p>
              <p className="text-[11px] text-nx-muted">{m.time ? new Date(m.time).toLocaleString('id-ID') : ''}</p>
            </div>
            <button type="button" aria-label="Hapus pesan" onClick={() => window.confirm('Hapus pesan ini?') && deleteInbox(m.id)} className="flex h-11 w-11 items-center justify-center rounded-lg text-red-400 hover:bg-red-500/10">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {m.thread.map((t, i) => (
              <p key={i} className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${t.role === 'admin' ? 'ml-auto bg-nx-accent/25' : 'bg-white/5'}`}>
                {t.text}
              </p>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input className="input" placeholder="Balas..." value={drafts[m.id] ?? ''} onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: e.target.value }))} aria-label={`Balas ${m.name}`} />
            <button
              type="button"
              className="btn-primary"
              disabled={!(drafts[m.id] ?? '').trim()}
              onClick={async () => {
                await adminReply(m, (drafts[m.id] ?? '').trim());
                setDrafts((d) => ({ ...d, [m.id]: '' }));
              }}
            >
              Kirim
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
