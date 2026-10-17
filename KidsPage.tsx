import { Baby } from 'lucide-react';
import CatalogView from '../components/CatalogView';
import { useCatalog } from '../hooks/useCatalog';

export default function KidsPage() {
  const c = useCatalog();
  return (
    <CatalogView
      title="Kids & Family"
      subtitle="Animation, Family Movies, dan Educational Content yang sesuai usia."
      icon={<Baby className="h-7 w-7" />}
      items={c.kidsContent}
    />
  );
}
