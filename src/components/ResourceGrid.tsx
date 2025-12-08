import { useState } from 'react';
import { Resource } from '@/services/resourceApi';
import { ResourceCard } from './ResourceCard';
import { ResourceListItem } from './ResourceListItem';
import { ResourceDetailModal } from './ResourceDetailModal';
import { Users, Loader2 } from 'lucide-react';
import { ViewMode } from './ViewToggle';

interface ResourceGridProps {
  resources: Resource[];
  isLoading: boolean;
  viewMode: ViewMode;
  searchQuery?: string;
}

export function ResourceGrid({ resources, isLoading, viewMode, searchQuery = '' }: ResourceGridProps) {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

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
    <>
      {viewMode === 'list' ? (
        <div className="flex flex-col gap-1.5">
          {resources.map((resource) => (
          <ResourceListItem 
              key={resource.resource_id} 
              resource={resource} 
              searchQuery={searchQuery}
              onClick={() => setSelectedResource(resource)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {resources.map((resource) => (
          <div key={resource.resource_id} onClick={() => setSelectedResource(resource)} className="cursor-pointer">
              <ResourceCard resource={resource} searchQuery={searchQuery} />
            </div>
          ))}
        </div>
      )}

      <ResourceDetailModal
        resource={selectedResource}
        open={!!selectedResource}
        onOpenChange={(open) => !open && setSelectedResource(null)}
      />
    </>
  );
}
