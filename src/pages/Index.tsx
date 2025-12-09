import { useState, useEffect, useCallback, useMemo } from 'react';
import { FilterSidebar, Filters } from '@/components/FilterSidebar';
import { SearchHeader } from '@/components/SearchHeader';
import { ResourceGrid } from '@/components/ResourceGrid';
import { ApiModeToggle } from '@/components/ApiModeToggle';
import { ViewToggle, ViewMode } from '@/components/ViewToggle';
import { SortSelect, SortOption } from '@/components/SortSelect';
import { ScrollArea } from '@/components/ui/scroll-area';
import { searchResources, Resource } from '@/services/resourceApi';
import { useToast } from '@/hooks/use-toast';
import { Chatbot } from '@/components/Chatbot';

const initialFilters: Filters = {
  employmentTypes: [],
  seniorities: [],
  roleTitles: [],
  skills: [],
  industries: [],
  certificates: [],
};

const seniorityOrder: Record<string, number> = {
  'senior 2': 1,
  'senior 1': 2,
  'mid 2': 3,
  'mid 1': 4,
  'junior 2': 5,
  'junior 1': 6,
};

const Index = () => {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTestMode, setIsTestMode] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
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

  // Client-side filtering and sorting
  const filteredResources = useMemo(() => {
    let result = [...resources];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((resource) => {
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
    }
    
    // Sort results
    result.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.resource_name.localeCompare(b.resource_name);
        case 'name-desc':
          return b.resource_name.localeCompare(a.resource_name);
        case 'seniority':
          const aOrder = seniorityOrder[a.seniority_level.toLowerCase()] ?? 99;
          const bOrder = seniorityOrder[b.seniority_level.toLowerCase()] ?? 99;
          return aOrder - bOrder;
        case 'employment':
          return a.employment_type.localeCompare(b.employment_type);
        default:
          return 0;
      }
    });
    
    return result;
  }, [resources, searchQuery, sortOption]);

  return (
    <div className="flex h-screen bg-background">
      <FilterSidebar
        filters={filters}
        onFilterChange={setFilters}
        resultCount={filteredResources.length}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <SearchHeader searchQuery={searchQuery} onSearchChange={setSearchQuery}>
          <SortSelect value={sortOption} onChange={setSortOption} />
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <ApiModeToggle isTestMode={isTestMode} onToggle={setIsTestMode} />
        </SearchHeader>

        <ScrollArea className="flex-1 scrollbar-thin">
          <main className="p-6">
            <ResourceGrid resources={filteredResources} isLoading={isLoading} viewMode={viewMode} searchQuery={searchQuery} />
          </main>
        </ScrollArea>
      </div>

      <Chatbot />
    </div>
  );
};

export default Index;
