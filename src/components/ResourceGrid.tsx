import { useState } from 'react';
import { Resource } from '@/services/resourceApi';
import { ResourceCard } from './ResourceCard';
import { ResourceListItem } from './ResourceListItem';
import { ResourceDetailModal } from './ResourceDetailModal';
import { ResourceCardSkeleton, ResourceListItemSkeleton } from './ResourceSkeleton';
import { Users } from 'lucide-react';
import { ViewMode } from './ViewToggle';
import { SkillLevel } from './FilterSidebar';
import { AvailabilityResult, Assignment } from '@/services/availabilityService';

interface ResourceGridProps {
  resources: Resource[];
  isLoading: boolean;
  viewMode: ViewMode;
  searchQuery?: string;
  onSkillClick?: (skill: string) => void;
  activeSkillFilters?: string[];
  activeSkillLevels?: SkillLevel[];
  availability?: Map<string, AvailabilityResult>;
  assignments?: Assignment[];
  dateRange?: { start: Date; end: Date } | null;
  highlightedResourceId?: string;
}

export function ResourceGrid({ resources, isLoading, viewMode, searchQuery = '', onSkillClick, activeSkillFilters = [], activeSkillLevels = ['senior', 'mid', 'junior'], availability, assignments = [], dateRange, highlightedResourceId }: ResourceGridProps) {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  if (isLoading) {
    return viewMode === 'list' ? (
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <ResourceListItemSkeleton key={i} />
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <ResourceCardSkeleton key={i} />
        ))}
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
            <div
              key={resource.resource_id}
              id={`resource-${resource.resource_id}`}
              className={highlightedResourceId === resource.resource_id ? 'animate-pulse ring-2 ring-primary rounded-lg' : ''}
            >
              <ResourceListItem 
                resource={resource} 
                searchQuery={searchQuery}
                onClick={() => setSelectedResource(resource)}
                activeSkillFilters={activeSkillFilters}
                activeSkillLevels={activeSkillLevels}
                availability={availability?.get(resource.resource_id)}
                assignments={assignments}
                dateRange={dateRange}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <div 
              key={resource.resource_id} 
              id={`resource-${resource.resource_id}`}
              onClick={() => setSelectedResource(resource)} 
              className={`cursor-pointer ${highlightedResourceId === resource.resource_id ? 'animate-pulse ring-2 ring-primary rounded-lg' : ''}`}
            >
              <ResourceCard 
                resource={resource} 
                searchQuery={searchQuery} 
                activeSkillFilters={activeSkillFilters} 
                activeSkillLevels={activeSkillLevels}
                availability={availability?.get(resource.resource_id)}
                assignments={assignments}
                dateRange={dateRange}
              />
            </div>
          ))}
        </div>
      )}

      <ResourceDetailModal
        resource={selectedResource}
        open={!!selectedResource}
        onOpenChange={(open) => !open && setSelectedResource(null)}
        onSkillClick={(skill) => {
          setSelectedResource(null);
          onSkillClick?.(skill);
        }}
      />
    </>
  );
}