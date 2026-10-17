import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Info, Play, Star } from 'lucide-react';
import type { AnyContent } from '../lib/catalog';
import { watchPath } from '../lib/catalog';

interface Props {
  items: AnyContent[];
}

export default function HeroBanner({ items }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % items.length), 8000);
    return () => window.clearInterval(t);
  }, [items.length]);

  const item = items[index];
  if (!item) return null;

  const watchTo = watchPath(item.type, item.id);
  const typeLabel = item.type === 'movie' ? 'Movie' : item.type === 'series' ? 'Series' : 'Anime';

  return (
    <section className="relative isolate overflow-hidden">
      <div
        className="absolute inset-0 -z-30 transition-[background] duration-700"
        style={{ background: `linear-gradient(120deg, hsl(${item.hue} 70% 24%) 0%, #05060d 75%)` }}
      />
      <img
        src="/banner-nexus.png"
        alt=""
        aria-hidden
        className="absolute right-0 top-14 -z-20 h-[55%] w-full object-contain object-center opacity-50 mix-blend-screen md:top-0 md:h-full md:w-[70%] md:object-right md:opacity-70"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-nx-bg via-nx-bg/70 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-nx-bg/90 via-nx-bg/30 to-transparent" />

      <div className="mx-auto flex min-h-[500px] max-w-[1600px] flex-col justify-end px-4 pb-12 pt-28 md:min-h-[600px] md:px-10 md:pb-16">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-nx-cyan">
          <span>Unggulan</span>
          <span className="text-nx-muted">/</span>
          <span>{typeLabel}</span>
          {item.isDemo && <span className="badge-demo ml-1">DEMO</span>}
        </div>
        <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold leading-tight drop-shadow-lg md:text-6xl">
          {item.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-nx-text/90">
          {item.rating !== undefined && (
            <span className="flex items-center gap-1 font-semibold">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
              {item.rating.toFixed(1)}
            </span>
          )}
          {item.year > 0 && <span>{item.year}</span>}
          {item.schedule && <span className="font-semibold text-nx-cyan">Jadwal: {item.schedule}</span>}
          <span className="text-nx-muted">{item.genres.join(' / ')}</span>
        </div>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-nx-text/85 line-clamp-3 md:text-base">
          {item.synopsis}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={watchTo} className="btn-primary">
            <Play className="h-5 w-5 fill-white" aria-hidden /> Watch Now
          </Link>
          <Link to={`/detail/${item.type}/${item.id}`} className="btn-ghost">
            <Info className="h-5 w-5" aria-hidden /> More Info
          </Link>
        </div>
        {items.length > 1 && (
          <div className="mt-6 flex gap-2" role="tablist" aria-label="Konten unggulan">
            {items.map((it, i) => (
              <button
                key={it.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Tampilkan ${it.title}`}
                onClick={() => setIndex(i)}
                className="flex h-6 items-center"
              >
                <span className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-nx-accent' : 'w-3 bg-white/30'}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
