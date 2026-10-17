import { BookOpen } from 'lucide-react';
import CatalogView from '../components/CatalogView';
import { useCatalog } from '../hooks/useCatalog';

export default function DocumentariesPage() {
  const c = useCatalog();
  return (
    <CatalogView
      title="Documentaries"
      subtitle="Nature, Science, History, Technology, dan Biography."
      icon={<BookOpen className="h-7 w-7" />}
      items={c.documentaries}
    />
  );
}
