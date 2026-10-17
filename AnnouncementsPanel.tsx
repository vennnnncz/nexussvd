import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { useCatalog } from '../../hooks/useCatalog';
import { deleteAnnouncement, postAnnouncement } from '../../lib/adminApi';

export default function AnnouncementsPanel() {
  const { announcements } = useCatalog();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    try {
      await postAnnouncement(title.trim(), body.trim());
      setTitle('');
      setBody('');
      setError(null);
    } catch {
      setError('Gagal mengirim pengumuman. Periksa Firebase Rules.');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="Judul pengumuman" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="input min-h-[96px] py-3" placeholder="Isi pengumuman" value={body} onChange={(e) => setBody(e.target.value)} />
        {error && <p className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-300">{error}</p>}
        <button type="submit" className="btn-primary">
          Kirim pengumuman
        </button>
      </form>
      <ul className="space-y-2">
        {announcements.map((a) => (
          <li key={a.id} className="flex items-start gap-3 rounded-xl border border-nx-line bg-nx-card p-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="text-xs text-nx-muted">{a.body}</p>
            </div>
            <button type="button" aria-label={`Hapus ${a.title}`} onClick={() => window.confirm('Hapus pengumuman ini?') && deleteAnnouncement(a.id)} className="flex h-11 w-11 items-center justify-center rounded-lg text-red-400 hover:bg-red-500/10">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {announcements.length === 0 && <li className="text-sm text-nx-muted">Belum ada pengumuman.</li>}
      </ul>
    </div>
  );
}
