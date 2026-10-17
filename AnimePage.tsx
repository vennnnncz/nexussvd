import { Sparkles } from 'lucide-react';
import CatalogView from '../components/CatalogView';
import { useCatalog } from '../hooks/useCatalog';
import type { AnyContent } from '../lib/catalog';

const quickFilters = [
  { label: 'Anime Movies', test: (i: AnyContent) => i.type === 'anime' && i.format === 'movie' },
  { label: 'Anime Series', test: (i: AnyContent) => i.type === 'anime' && i.format === 'series' },
];

export default function AnimePage() {
  const c = useCatalog();
  return (
    <CatalogView
      title="Anime"
      subtitle="Anime populer dan terbaru, film maupun serial."
      icon={<Sparkles className="h-7 w-7" />}
      items={c.anime}
      sorts={['popular', 'added', 'trending', 'year']}
      quickFilters={quickFilters}
    />
  );
}
