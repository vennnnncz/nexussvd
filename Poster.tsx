import { useState } from 'react';
import { Clapperboard, Radio, Trophy, Tv } from 'lucide-react';
import type { CardData } from '../types';

interface Props {
  hue: number;
  title: string;
  type: CardData['type'];
  src?: string;
  className?: string;
}

const icons = {
  movie: Clapperboard,
  series: Tv,
  anime: Tv,
  channel: Radio,
  sports: Trophy,
} as const;

/** Poster dengan fallback gradien generatif bila gambar tidak ada / gagal dimuat. */
export default function Poster({ hue, title, type, src, className = '' }: Props) {
  const [failed, setFailed] = useState(false);
  const Icon = icons[type];
  const showImage = !!src && !failed;

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(155deg, hsl(${hue} 75% 42%) 0%, hsl(${(hue + 50) % 360} 70% 18%) 70%, #05060d 100%)`,
      }}
    >
      {showImage ? (
        <img
          src={src}
          alt={title}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-between p-3 text-center">
          <Icon className="mt-4 h-8 w-8 text-white/70" aria-hidden />
          <span className="font-display text-sm font-bold leading-tight text-white drop-shadow line-clamp-4">
            {title}
          </span>
          <span className="h-4" />
        </div>
      )}
    </div>
  );
}
