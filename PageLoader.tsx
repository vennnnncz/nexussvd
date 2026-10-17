import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Memuat">
      <Loader2 className="h-9 w-9 animate-spin text-nx-accent" />
    </div>
  );
}
