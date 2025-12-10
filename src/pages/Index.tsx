import { useState, useEffect, useCallback, useMemo } from 'react';
import { FilterSidebar, Filters, SkillFilter } from '@/components/FilterSidebar';
import { SearchHeader } from '@/components/SearchHeader';
import { ResourceGrid } from '@/components/ResourceGrid';
import { ViewToggle, ViewMode } from '@/components/ViewToggle';
import { SortSelect, SortOption } from '@/components/SortSelect';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileMenu } from '@/components/ProfileMenu';
import { RefreshDatasetButton } from '@/components/RefreshDatasetButton';
import { ActiveSkillFiltersBanner, SkillFilterMode } from '@/components/ActiveSkillFiltersBanner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { searchResources, Resource, ApiFilters } from '@/services/resourceApi';
import { useToast } from '@/hooks/use-toast';
import { Chatbot } from '@/components/Chatbot';
import { useProperties } from '@/hooks/useProperties';

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

const Index = () => {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [skillFilterMode, setSkillFilterMode] = useState<SkillFilterMode>('and');
  const { toast } = useToast();
  
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
      // Extract just skill names for API (seniority filtering is client-side)
      const skillNames = filters.skills.map(sf => sf.skill);
      const apiFilters = {
        ...filters,
        skills: skillNames,
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

  // Check if a resource has a skill at the specified seniority levels
  const resourceHasSkillAtLevels = (resource: Resource, skillFilter: SkillFilter): boolean => {
    const { skill, levels } = skillFilter;
    
    for (const level of levels) {
      if (level === 'senior' && resource.skills.senior.includes(skill)) return true;
      if (level === 'mid' && resource.skills.mid.includes(skill)) return true;
      if (level === 'junior' && resource.skills.junior.includes(skill)) return true;
    }
    return false;
  };

  // Client-side filtering and sorting
  const filteredResources = useMemo(() => {
    let result = [...resources];
    
    // Filter by skill seniority levels (client-side)
    if (filters.skills.length > 0) {
      result = result.filter((resource) => {
        // AND: Resource must match ALL selected skill filters
        // OR: Resource must match at least ONE selected skill filter
        const matchFn = skillFilterMode === 'and' 
          ? filters.skills.every.bind(filters.skills)
          : filters.skills.some.bind(filters.skills);
        return matchFn(skillFilter => resourceHasSkillAtLevels(resource, skillFilter));
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
  }, [resources, searchQuery, sortOption, filters.skills, skillFilterMode]);

  const handleSkillClick = (skill: string) => {
    // Check if skill already exists in filters
    const existingSkill = filters.skills.find(sf => sf.skill === skill);
    if (!existingSkill) {
      // Add skill with all levels selected
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, { skill, levels: ['senior', 'mid', 'junior'] }]
      }));
    }
  };

  const handleRemoveSkillFilter = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(sf => sf.skill !== skill)
    }));
  };

  const handleToggleSkillLevel = (skill: string, level: 'senior' | 'mid' | 'junior') => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.map(sf => {
        if (sf.skill !== skill) return sf;
        const hasLevel = sf.levels.includes(level);
        if (hasLevel && sf.levels.length === 1) return sf; // Prevent removing last level
        return {
          ...sf,
          levels: hasLevel
            ? sf.levels.filter(l => l !== level)
            : [...sf.levels, level]
        };
      })
    }));
  };

  const handleClearAllSkillFilters = () => {
    setFilters(prev => ({ ...prev, skills: [] }));
  };

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
          <ThemeToggle />
          <SortSelect value={sortOption} onChange={setSortOption} />
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <RefreshDatasetButton isTestMode={isTestMode} onRefreshComplete={fetchResources} />
        </SearchHeader>

        {filters.skills.length > 0 && (
          <div className="px-6 pt-4 pb-0 bg-background border-b border-border/50">
          <ActiveSkillFiltersBanner
              skillFilters={filters.skills}
              onRemoveSkill={handleRemoveSkillFilter}
              onToggleLevel={handleToggleSkillLevel}
              onClearAll={handleClearAllSkillFilters}
              filterMode={skillFilterMode}
              onFilterModeChange={setSkillFilterMode}
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
            />
          </main>
        </ScrollArea>
      </div>

      <Chatbot />
    </div>
  );
};

export default Index;
