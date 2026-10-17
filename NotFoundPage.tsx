import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import PageShell from '../components/PageShell';

export default function NotFoundPage({ message = 'Halaman yang Anda cari tidak ditemukan.' }: { message?: string }) {
  return (
    <PageShell>
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4 text-center">
        <SearchX className="h-14 w-14 text-nx-cyan" aria-hidden />
        <p className="font-display text-6xl font-extrabold text-nx-accent">404</p>
        <p className="max-w-md text-sm text-nx-muted">{message}</p>
        <Link to="/home" className="btn-primary">
          Kembali ke beranda
        </Link>
      </div>
    </PageShell>
  );
}
