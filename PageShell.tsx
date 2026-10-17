import type { ReactNode } from 'react';

export default function PageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-[1600px] px-4 pb-10 pt-20 md:px-10 md:pt-24 ${className}`}>{children}</div>;
}

export function PageHeading({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: ReactNode }) {
  return (
    <header className="mb-6">
      <div className="flex items-center gap-3">
        {icon && <span className="text-nx-cyan">{icon}</span>}
        <h1 className="font-display text-2xl font-extrabold md:text-4xl">{title}</h1>
      </div>
      {subtitle && <p className="mt-2 max-w-2xl text-sm text-nx-muted">{subtitle}</p>}
    </header>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-nx-line px-6 py-14 text-center">
      <p className="font-display text-lg font-bold">{title}</p>
      {description && <p className="max-w-md text-sm text-nx-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
