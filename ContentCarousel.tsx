import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CardData } from '../types';
import ContentCard from './ContentCard';

interface Props {
  title: string;
  items: CardData[];
  /** Tautan "Lihat semua" */
  to?: string;
}

export default function ContentCarousel({ title, items, to }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  if (items.length === 0) return null;

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <section className="group/row relative py-3">
      <div className="mb-3 flex items-end justify-between px-4 md:px-10">
        <h2 className="font-display text-lg font-bold md:text-xl">{title}</h2>
        {to && (
          <Link to={to} className="text-xs font-medium text-nx-cyan hover:underline">
            Lihat semua
          </Link>
        )}
      </div>
      <div className="relative">
        <button
          type="button"
          aria-label="Geser ke kiri"
          onClick={() => scroll(-1)}
          className="absolute left-2 top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 opacity-0 backdrop-blur transition hover:bg-nx-accent group-hover/row:opacity-100 md:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div
          ref={ref}
          className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 md:gap-4 md:px-10"
        >
          {items.map((item) => (
            <ContentCard key={item.key} item={item} />
          ))}
        </div>
        <button
          type="button"
          aria-label="Geser ke kanan"
          onClick={() => scroll(1)}
          className="absolute right-2 top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 opacity-0 backdrop-blur transition hover:bg-nx-accent group-hover/row:opacity-100 md:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
