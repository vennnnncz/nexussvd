import { Megaphone, X } from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { useStoredState } from '../hooks/useStoredState';

export default function AnnouncementToast() {
  const { announcements } = useCatalog();
  const [dismissed, setDismissed] = useStoredState<string>('nx.annDismissed', '');
  const latest = announcements[0];
  if (!latest || latest.id === dismissed) return null;

  return (
    <aside role="status" className="glass fixed inset-x-4 bottom-20 z-30 rounded-2xl p-4 shadow-2xl md:bottom-6 md:left-auto md:right-6 md:w-96">
      <div className="flex items-start gap-3">
        <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-nx-cyan" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{latest.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-nx-muted">{latest.body}</p>
        </div>
        <button type="button" aria-label="Tutup pengumuman" onClick={() => setDismissed(latest.id)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
