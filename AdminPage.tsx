import { useState, type FormEvent } from 'react';
import { LogOut, ShieldCheck } from 'lucide-react';
import PageLoader from '../../components/PageLoader';
import PageShell, { PageHeading } from '../../components/PageShell';
import { useAuth } from '../../hooks/useAuth';
import { authConfigured } from '../../lib/firebase';
import type { RawItem } from '../../lib/mapper';
import AnnouncementsPanel from './AnnouncementsPanel';
import ContentForm from './ContentForm';
import InboxPanel from './InboxPanel';
import ManageList from './ManageList';

type Tab = 'upload' | 'manage' | 'inbox' | 'announce';

export default function AdminPage() {
  const { user, loading, login, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('upload');
  const [editing, setEditing] = useState<{ id: string; raw: RawItem } | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!authConfigured) {
    return (
      <PageShell>
        <PageHeading title="Admin" icon={<ShieldCheck className="h-7 w-7" />} />
        <div className="max-w-2xl space-y-3 rounded-2xl border border-nx-line bg-nx-card p-5 text-sm">
          <p className="font-semibold">Login admin belum dikonfigurasi.</p>
          <p className="text-nx-muted">
            Isi environment variable <code>VITE_FIREBASE_API_KEY</code>, <code>VITE_FIREBASE_AUTH_DOMAIN</code>, dan <code>VITE_FIREBASE_PROJECT_ID</code> (lihat README, bagian &quot;Admin&quot;), lalu deploy ulang.
          </p>
        </div>
      </PageShell>
    );
  }

  if (loading) return <PageLoader />;

  if (!user) {
    const submit = async (e: FormEvent) => {
      e.preventDefault();
      setError(await login(email, password));
    };
    return (
      <PageShell>
        <PageHeading title="Admin" subtitle="Masuk untuk mengelola konten." icon={<ShieldCheck className="h-7 w-7" />} />
        <form onSubmit={submit} className="max-w-sm space-y-3">
          <input className="input" type="email" autoComplete="username" placeholder="Email admin" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-300">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            Masuk
          </button>
        </form>
      </PageShell>
    );
  }

  const tabs: { v: Tab; l: string }[] = [
    { v: 'upload', l: editing ? 'Edit' : 'Upload' },
    { v: 'manage', l: 'Kelola' },
    { v: 'inbox', l: 'Inbox' },
    { v: 'announce', l: 'Pengumuman' },
  ];

  return (
    <PageShell>
      <div className="flex items-start justify-between gap-3">
        <PageHeading title="Dashboard Admin" subtitle={user.email ?? undefined} icon={<ShieldCheck className="h-7 w-7" />} />
        <button type="button" className="btn-ghost shrink-0" onClick={() => logout()}>
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </div>

      <div className="scrollbar-none mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist">
        {tabs.map((t) => (
          <button key={t.v} type="button" role="tab" aria-selected={tab === t.v} onClick={() => setTab(t.v)} className={`chip shrink-0 ${tab === t.v ? 'chip-on' : ''}`}>
            {t.l}
          </button>
        ))}
      </div>

      <div className="max-w-4xl">
        {tab === 'upload' && (
          <ContentForm
            key={editing?.id ?? 'new'}
            editId={editing?.id ?? null}
            initial={editing?.raw}
            onDone={() => {
              setEditing(null);
              setTab('manage');
            }}
          />
        )}
        {tab === 'manage' && (
          <ManageList
            onEdit={(id, raw) => {
              setEditing({ id, raw });
              setTab('upload');
            }}
          />
        )}
        {tab === 'inbox' && <InboxPanel />}
        {tab === 'announce' && <AnnouncementsPanel />}
      </div>
    </PageShell>
  );
}
