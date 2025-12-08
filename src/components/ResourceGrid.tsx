import { Resource } from '@/services/resourceApi';
import { ResourceCard } from './ResourceCard';
import { Users, Loader2 } from 'lucide-react';

interface ResourceGridProps {
  resources: Resource[];
  isLoading: boolean;
}

export function ResourceGrid({ resources, isLoading }: ResourceGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Searching resources...</p>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Users className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No resources found</p>
        <p className="text-sm mt-1">Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {resources.map((resource) => (
        <ResourceCard key={resource.resource_id} resource={resource} />
      ))}
    </div>
  );
}
