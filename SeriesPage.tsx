import { Tv } from 'lucide-react';
import CatalogView from '../components/CatalogView';
import { useCatalog } from '../hooks/useCatalog';

export default function SeriesPage() {
  const c = useCatalog();
  return (
    <CatalogView
      title="TV Series"
      subtitle="Serial populer, terbaru, dan trending."
      icon={<Tv className="h-7 w-7" />}
      items={c.series}
      sorts={['popular', 'added', 'trending', 'year']}
    />
  );
}
