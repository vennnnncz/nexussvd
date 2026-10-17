import { Link } from 'react-router-dom';
import { Check, Plus, Star } from 'lucide-react';
import type { CardData, ListType } from '../types';
import { useMyList } from '../hooks/useMyList';
import Poster from './Poster';

interface Props {
  item: CardData;
  /** Isi lebar penuh kolom (untuk grid). */
  fluid?: boolean;
}

export default function ContentCard({ item, fluid = false }: Props) {
  const { has, toggle } = useMyList();
  const wide = item.type === 'channel' || item.type === 'sports';
  const listType: ListType | null = item.type === 'sports' ? null : item.type;
  const inList = listType ? has(listType, item.id) : false;

  const width = fluid
    ? 'w-full'
    : wide
      ? 'w-[220px] sm:w-[250px]'
      : 'w-[140px] sm:w-[165px] lg:w-[185px]';

  return (
    <div className={`group relative shrink-0 snap-start ${width}`}>
      <Link to={item.to} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-nx-accent rounded-xl">
        <div
          className={`relative overflow-hidden rounded-xl ring-1 ring-white/5 transition duration-300 md:group-hover:-translate-y-1 md:group-hover:scale-[1.03] md:group-hover:shadow-glow md:group-hover:ring-nx-accent/60 ${
            wide ? 'aspect-video' : 'aspect-[2/3]'
          }`}
        >
          <Poster hue={item.hue} title={item.title} type={item.type} src={item.poster} />
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {item.isLive && (
              <span className="flex items-center gap-1 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                LIVE
              </span>
            )}
            {item.isDemo && <span className="badge-demo">DEMO</span>}
          </div>
          {item.rating !== undefined && (
            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold backdrop-blur">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
              {item.rating.toFixed(1)}
            </span>
          )}
          {item.progress !== undefined && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
              <div className="h-full bg-nx-accent" style={{ width: `${Math.min(100, Math.round(item.progress * 100))}%` }} />
            </div>
          )}
        </div>
        <div className="mt-2 px-0.5">
          <p className="truncate text-sm font-semibold">{item.title}</p>
          <p className="truncate text-xs text-nx-muted">
            {item.subtitle ?? [item.year, item.genres[0]].filter(Boolean).join(' - ')}
          </p>
        </div>
      </Link>
      {listType && (
        <button
          type="button"
          aria-label={inList ? `Hapus ${item.title} dari My List` : `Tambah ${item.title} ke My List`}
          onClick={() => toggle(listType, item.id)}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-nx-accent md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100"
        >
          {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
