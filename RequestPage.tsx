import { useEffect, useState, type FormEvent } from 'react';
import { MessageSquare } from 'lucide-react';
import PageShell, { PageHeading } from '../components/PageShell';
import { useStoredState } from '../hooks/useStoredState';
import { sendUserMessage, watchMessage } from '../lib/adminApi';
import type { InboxItem } from '../types';

const NONE: string[] = [];

function MyMessage({ id }: { id: string }) {
  const [item, setItem] = useState<InboxItem | null>(null);
  useEffect(() => watchMessage(id, setItem), [id]);
  if (!item) return null;
  return (
    <li className="rounded-xl border border-nx-line bg-nx-card p-4">
      <p className="mb-2 text-[11px] uppercase tracking-wider text-nx-muted">{item.type === 'lapor' ? 'Laporan' : 'Request'}</p>
      <div className="space-y-2">
        {item.thread.map((t, i) => (
          <p key={i} className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${t.role === 'admin' ? 'ml-auto bg-nx-accent/25' : 'bg-white/5'}`}>
            {t.role === 'admin' && <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-nx-cyan">Admin</span>}
            {t.text}
          </p>
        ))}
      </div>
    </li>
  );
}

export default function RequestPage() {
  const [type, setType] = useState<'request' | 'lapor'>('request');
  const [name, setName] = useStoredState<string>('nx.uname', '');
  const [text, setText] = useState('');
  const [mine, setMine] = useStoredState<string[]>('nx.myMessages', NONE);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) {
      setMsg({ ok: false, text: 'Nama dan pesan wajib diisi.' });
      return;
    }
    setBusy(true);
    try {
      const id = await sendUserMessage(name.trim().slice(0, 40), text.trim().slice(0, 600), type);
      if (id) setMine((cur) => [id, ...cur].slice(0, 20));
      setText('');
      setMsg({ ok: true, text: 'Terkirim. Balasan admin akan muncul di bawah.' });
    } catch {
      setMsg({ ok: false, text: 'Gagal mengirim. Coba lagi nanti.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <PageHeading title="Request / Lapor" subtitle="Minta judul baru atau laporkan masalah. Balasan admin tampil di halaman ini (di perangkat yang sama)." icon={<MessageSquare className="h-7 w-7" />} />
      <form onSubmit={submit} className="max-w-xl space-y-3">
        <div className="flex gap-2" role="tablist">
          <button type="button" role="tab" aria-selected={type === 'request'} onClick={() => setType('request')} className={`chip ${type === 'request' ? 'chip-on' : ''}`}>
            Request
          </button>
          <button type="button" role="tab" aria-selected={type === 'lapor'} onClick={() => setType('lapor')} className={`chip ${type === 'lapor' ? 'chip-on' : ''}`}>
            Lapor
          </button>
        </div>
        <input className="input" placeholder="Nama" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
        <textarea className="input min-h-[110px] py-3" placeholder={type === 'request' ? 'Judul yang ingin ditambahkan' : 'Jelaskan masalahnya'} maxLength={600} value={text} onChange={(e) => setText(e.target.value)} />
        {msg && <p role="status" className={`rounded-xl px-4 py-3 text-sm ${msg.ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>{msg.text}</p>}
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? 'Mengirim...' : 'Kirim'}
        </button>
      </form>

      {mine.length > 0 && (
        <>
          <h2 className="mb-3 mt-10 font-display text-xl font-bold">Pesan saya</h2>
          <ul className="max-w-xl space-y-3">
            {mine.map((id) => (
              <MyMessage key={id} id={id} />
            ))}
          </ul>
        </>
      )}
    </PageShell>
  );
}
