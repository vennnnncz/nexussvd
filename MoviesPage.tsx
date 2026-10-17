import { Clapperboard } from 'lucide-react';
import CatalogView from '../components/CatalogView';
import { useCatalog } from '../hooks/useCatalog';

export default function MoviesPage() {
  const c = useCatalog();
  return (
    <CatalogView
      title="Movies"
      subtitle="Jelajahi film berdasarkan judul, genre, tahun, dan popularitas."
      icon={<Clapperboard className="h-7 w-7" />}
      items={c.movieOnly}
      sorts={['popular', 'year', 'added']}
    />
  );
}
