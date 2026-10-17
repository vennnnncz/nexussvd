import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('NEXUSNETXXI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-400" aria-hidden />
        <h1 className="font-display text-2xl font-bold">Terjadi kesalahan</h1>
        <p className="max-w-md text-sm text-nx-muted">Halaman ini gagal dimuat. Muat ulang halaman atau kembali ke beranda.</p>
        <div className="flex gap-3">
          <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
            Muat ulang
          </button>
          <a href="/home" className="btn-ghost">
            Ke beranda
          </a>
        </div>
      </div>
    );
  }
}
