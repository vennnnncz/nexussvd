import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Play, Plus, Star } from 'lucide-react';
import type { AnyContent } from '../lib/catalog';
import { toCard } from '../lib/catalog';
import { useBack } from '../hooks/useBack';
import { useMyList } from '../hooks/useMyList';
import Poster from './Poster';

interface Props {
  item: AnyContent;
  meta: string[];
  watchTo: string;
  watchLabel?: string;
  /** Tombol tambahan (mis. Continue Watching) */
  extraAction?: ReactNode;
  children?: ReactNode;
}

export default function DetailHero({ item, meta, watchTo, watchLabel = 'Watch Now', extraAction, children }: Props) {
  const back = useBack();
  const { has, toggle } = useMyList();
  const inList = has(item.type, item.id);
  const card = toCard(item);

  return (
    <section className="relative isolate overflow-hidden">
      <div
        className="absolute inset-0 -z-20"
        style={{ background: `linear-gradient(135deg, hsl(${item.hue} 70% 26%) 0%, hsl(${(item.hue + 50) % 360} 60% 10%) 55%, #05060d 100%)` }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-nx-bg via-nx-bg/50 to-transparent" />

      <div className="mx-auto max-w-[1600px] px-4 pb-10 pt-20 md:px-10 md:pt-28">
        <button type="button" onClick={back} className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm text-nx-muted transition hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Kembali
        </button>

        <div className="flex flex-col gap-6 md:flex-row md:gap-10">
          <div className="mx-auto w-44 shrink-0 md:mx-0 md:w-64">
            <div className="aspect-[2/3] overflow-hidden rounded-2xl shadow-2xl shadow-black/60 ring-1 ring-white/10">
              <Poster hue={item.hue} title={item.title} type={card.type} src={item.poster} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {item.isDemo && <span className="badge-demo">DEMO</span>}
              {item.genres.map((g) => (
                <span key={g} className="chip">
                  {g}
                </span>
              ))}
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight md:text-5xl">{item.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-nx-text/80">
              {item.rating !== undefined && (
                <span className="flex items-center gap-1 font-semibold">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                  {item.rating.toFixed(1)}
                </span>
              )}
              {meta.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-nx-text/85 md:text-base">{item.synopsis}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={watchTo} className="btn-primary">
                <Play className="h-5 w-5 fill-white" aria-hidden /> {watchLabel}
              </Link>
              {extraAction}
              <button type="button" onClick={() => toggle(item.type, item.id)} aria-pressed={inList} className="btn-ghost">
                {inList ? <Check className="h-5 w-5" aria-hidden /> : <Plus className="h-5 w-5" aria-hidden />}
                {inList ? 'In My List' : 'Add to My List'}
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
