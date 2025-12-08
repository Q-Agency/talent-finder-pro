import { useState, useEffect, useCallback, useMemo } from 'react';
import { FilterSidebar, Filters } from '@/components/FilterSidebar';
import { SearchHeader } from '@/components/SearchHeader';
import { ResourceGrid } from '@/components/ResourceGrid';
import { ApiModeToggle } from '@/components/ApiModeToggle';
import { ViewToggle, ViewMode } from '@/components/ViewToggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { searchResources, Resource } from '@/services/resourceApi';
import { useToast } from '@/hooks/use-toast';

const initialFilters: Filters = {
  employmentTypes: [],
  seniorities: [],
  roleTitles: [],
  skills: [],
  industries: [],
  certificates: [],
};

const Index = () => {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTestMode, setIsTestMode] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { toast } = useToast();

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await searchResources(filters, '', isTestMode);
      if (response.success) {
        setResources(response.results);
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch resources. Please try again.',
        variant: 'destructive',
      });
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, isTestMode, toast]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchResources();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [fetchResources]);

  // Client-side filtering based on search query
  const filteredResources = useMemo(() => {
    if (!searchQuery.trim()) return resources;
    
    const query = searchQuery.toLowerCase();
    return resources.filter((resource) => {
      const allSkills = [
        ...resource.skills.senior,
        ...resource.skills.mid,
        ...resource.skills.junior,
      ];
      
      return (
        resource.resource_name.toLowerCase().includes(query) ||
        resource.role_category.toLowerCase().includes(query) ||
        resource.technical_domain.toLowerCase().includes(query) ||
        resource.seniority_level.toLowerCase().includes(query) ||
        resource.employment_type.toLowerCase().includes(query) ||
        resource.vertical?.toLowerCase().includes(query) ||
        allSkills.some(skill => skill.toLowerCase().includes(query)) ||
        resource.industries.some(industry => industry.toLowerCase().includes(query)) ||
        resource.certificates?.some(cert => cert.toLowerCase().includes(query))
      );
    });
  }, [resources, searchQuery]);

  return (
    <div className="flex h-screen bg-background">
      <FilterSidebar
        filters={filters}
        onFilterChange={setFilters}
        resultCount={filteredResources.length}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <SearchHeader searchQuery={searchQuery} onSearchChange={setSearchQuery}>
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <ApiModeToggle isTestMode={isTestMode} onToggle={setIsTestMode} />
        </SearchHeader>

        <ScrollArea className="flex-1 scrollbar-thin">
          <main className="p-6">
            <ResourceGrid resources={filteredResources} isLoading={isLoading} viewMode={viewMode} searchQuery={searchQuery} />
          </main>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Index;
