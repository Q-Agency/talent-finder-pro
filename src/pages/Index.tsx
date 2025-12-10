import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FilterSidebar, Filters, SkillLevel } from '@/components/FilterSidebar';
import { SearchHeader } from '@/components/SearchHeader';
import { ResourceGrid } from '@/components/ResourceGrid';
import { ViewToggle, ViewMode } from '@/components/ViewToggle';
import { SortSelect, SortOption } from '@/components/SortSelect';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileMenu } from '@/components/ProfileMenu';
import { RefreshDatasetButton } from '@/components/RefreshDatasetButton';
import { ActiveFiltersBanner, SkillFilterMode } from '@/components/ActiveFiltersBanner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { searchResources, Resource } from '@/services/resourceApi';
import { useToast } from '@/hooks/use-toast';
import { Chatbot } from '@/components/Chatbot';
import { useProperties } from '@/hooks/useProperties';
import { BarChart3 } from 'lucide-react';

const initialFilters: Filters = {
  employmentTypes: [],
  seniorities: [],
  roleTitles: [],
  skills: [],
  industries: [],
  certificates: [],
  verticals: [],
};

const seniorityOrder: Record<string, number> = {
  'senior 2': 1,
  'senior 1': 2,
  'mid 2': 3,
  'mid 1': 4,
  'junior 2': 5,
  'junior 1': 6,
};

const ALL_LEVELS: SkillLevel[] = ['senior', 'mid', 'junior'];

const Index = () => {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [skillFilterMode, setSkillFilterMode] = useState<SkillFilterMode>(() => {
    const saved = localStorage.getItem('skillFilterMode');
    return (saved === 'and' || saved === 'or') ? saved : 'and';
  });
  const [globalSkillLevels, setGlobalSkillLevels] = useState<SkillLevel[]>(() => {
    const saved = localStorage.getItem('globalSkillLevels');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return ALL_LEVELS;
  });
  const { toast } = useToast();

  // Persist filter mode preference
  useEffect(() => {
    localStorage.setItem('skillFilterMode', skillFilterMode);
  }, [skillFilterMode]);

  // Persist global skill levels preference
  useEffect(() => {
    localStorage.setItem('globalSkillLevels', JSON.stringify(globalSkillLevels));
  }, [globalSkillLevels]);
  
  // Fetch dynamic filter options
  const { properties, isLoading: isLoadingProperties } = useProperties(isTestMode);
  
  const dynamicOptions = useMemo(() => {
    if (!properties) return undefined;
    return {
      roleTitles: properties.roles.map(r => r.value),
      skills: properties.skills.map(s => s.readableValue),
      industries: properties.industries.map(i => i.readableValue),
      certificates: properties.certificates.map(c => c.readableValue),
      verticals: properties.verticals.map(v => v.value),
    };
  }, [properties]);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const apiFilters = {
        ...filters,
        skills: filters.skills,
      };
      const response = await searchResources(apiFilters, '', isTestMode);
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

  // Check if a resource has a skill at any of the global seniority levels
  const resourceHasSkillAtLevels = (resource: Resource, skill: string): boolean => {
    for (const level of globalSkillLevels) {
      if (level === 'senior' && resource.skills.senior.includes(skill)) return true;
      if (level === 'mid' && resource.skills.mid.includes(skill)) return true;
      if (level === 'junior' && resource.skills.junior.includes(skill)) return true;
    }
    return false;
  };

  // Calculate counts for both AND and OR modes (for preview in toggle)
  const skillFilterCounts = useMemo(() => {
    if (filters.skills.length < 2) return { and: 0, or: 0 };
    
    const andCount = resources.filter(resource => 
      filters.skills.every(skill => resourceHasSkillAtLevels(resource, skill))
    ).length;
    
    const orCount = resources.filter(resource => 
      filters.skills.some(skill => resourceHasSkillAtLevels(resource, skill))
    ).length;
    
    return { and: andCount, or: orCount };
  }, [resources, filters.skills, globalSkillLevels]);

  // Calculate per-level counts for selected skills
  const levelCounts = useMemo(() => {
    if (filters.skills.length === 0) return { senior: 0, mid: 0, junior: 0 };
    
    const resourceHasSkillAtLevel = (resource: Resource, level: SkillLevel): boolean => {
      const matchFn = skillFilterMode === 'and' 
        ? filters.skills.every.bind(filters.skills)
        : filters.skills.some.bind(filters.skills);
      
      return matchFn(skill => {
        if (level === 'senior') return resource.skills.senior.includes(skill);
        if (level === 'mid') return resource.skills.mid.includes(skill);
        return resource.skills.junior.includes(skill);
      });
    };
    
    return {
      senior: resources.filter(r => resourceHasSkillAtLevel(r, 'senior')).length,
      mid: resources.filter(r => resourceHasSkillAtLevel(r, 'mid')).length,
      junior: resources.filter(r => resourceHasSkillAtLevel(r, 'junior')).length,
    };
  }, [resources, filters.skills, skillFilterMode]);

  // Client-side filtering and sorting
  const filteredResources = useMemo(() => {
    let result = [...resources];
    
    // Filter by skill seniority levels (client-side)
    if (filters.skills.length > 0) {
      result = result.filter((resource) => {
        const matchFn = skillFilterMode === 'and' 
          ? filters.skills.every.bind(filters.skills)
          : filters.skills.some.bind(filters.skills);
        return matchFn(skill => resourceHasSkillAtLevels(resource, skill));
      });
    }
    
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
          resource.certificates?.some(cert => cert.toLowerCase().includes(query)) ||
          resource.description?.toLowerCase().includes(query) ||
          resource.notes?.toLowerCase().includes(query) ||
          resource.superior?.toLowerCase().includes(query)
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
  }, [resources, searchQuery, sortOption, filters.skills, skillFilterMode, globalSkillLevels]);


  const handleSkillClick = (skill: string) => {
    if (!filters.skills.includes(skill)) {
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  // Check if any filters are active (for showing the banner)
  const hasActiveFilters = 
    filters.skills.length > 0 ||
    filters.employmentTypes.length > 0 ||
    filters.seniorities.length > 0 ||
    filters.roleTitles.length > 0 ||
    filters.industries.length > 0 ||
    filters.certificates.length > 0 ||
    filters.verticals.length > 0;

  return (
    <div className="flex h-screen bg-background">
      <FilterSidebar
        filters={filters}
        onFilterChange={setFilters}
        resultCount={filteredResources.length}
        dynamicOptions={dynamicOptions}
        isLoadingOptions={isLoadingProperties}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <SearchHeader 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery}
          profileMenu={<ProfileMenu isTestMode={isTestMode} onTestModeToggle={setIsTestMode} />}
        >
          <Button variant="outline" size="sm" asChild>
            <Link to="/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Link>
          </Button>
          <ThemeToggle />
          <SortSelect value={sortOption} onChange={setSortOption} />
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <RefreshDatasetButton isTestMode={isTestMode} onRefreshComplete={fetchResources} />
        </SearchHeader>

        {hasActiveFilters && (
          <div className="px-6 pt-4 pb-0 bg-background border-b border-border/50">
            <ActiveFiltersBanner
              filters={filters}
              onFilterChange={setFilters}
              skillFilterMode={skillFilterMode}
              onSkillFilterModeChange={setSkillFilterMode}
              modeCounts={skillFilterCounts}
              globalSkillLevels={globalSkillLevels}
              onGlobalSkillLevelsChange={setGlobalSkillLevels}
              levelCounts={levelCounts}
            />
          </div>
        )}

        <ScrollArea className="flex-1 scrollbar-thin">
          <main className="p-6">
            <ResourceGrid 
              resources={filteredResources} 
              isLoading={isLoading} 
              viewMode={viewMode} 
              searchQuery={searchQuery}
              onSkillClick={handleSkillClick}
              activeSkillFilters={filters.skills}
              activeSkillLevels={globalSkillLevels}
            />
          </main>
        </ScrollArea>
      </div>

      <Chatbot />
    </div>
  );
};

export default Index;