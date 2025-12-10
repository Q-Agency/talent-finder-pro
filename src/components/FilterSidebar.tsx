import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { X, Filter, ChevronDown, Briefcase, GraduationCap, Users, Wrench, Building2, Award, Loader2, Search, MapPin, ChevronRight } from 'lucide-react';
import { employmentTypes, seniorities } from '@/data/mockData';
import { useState, useMemo, useEffect, useRef } from 'react';
import logo from '@/assets/logo.png';

export type SkillLevel = 'senior' | 'mid' | 'junior';

export interface Filters {
  employmentTypes: string[];
  seniorities: string[];
  roleTitles: string[];
  skills: string[];
  industries: string[];
  certificates: string[];
  verticals: string[];
}

interface DynamicOptions {
  roleTitles: string[];
  skills: string[];
  industries: string[];
  certificates: string[];
  verticals: string[];
}

interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  resultCount: number;
  dynamicOptions?: DynamicOptions;
  isLoadingOptions?: boolean;
}

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
  defaultOpen?: boolean;
  searchable?: boolean;
}

interface GroupedFilterSectionProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  selectedSkills: string[];
  onToggleSkill: (skill: string) => void;
  onToggleMultiple: (items: string[], select: boolean) => void;
  defaultOpen?: boolean;
}

const SEARCH_THRESHOLD = 8;
const ALL_LEVELS: SkillLevel[] = ['senior', 'mid', 'junior'];

// Parse skills into categories based on "Category - SkillName" pattern
function parseSkillCategories(skills: string[]): Map<string, string[]> {
  const categories = new Map<string, string[]>();
  
  skills.forEach(skill => {
    const parts = skill.split(' - ');
    const category = parts.length > 1 ? parts[0].trim() : 'Other';
    
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(skill);
  });
  
  // Sort categories alphabetically, but put "Other" at the end
  const sortedCategories = new Map(
    [...categories.entries()].sort((a, b) => {
      if (a[0] === 'Other') return 1;
      if (b[0] === 'Other') return -1;
      return a[0].localeCompare(b[0]);
    })
  );
  
  return sortedCategories;
}

function GroupedFilterSection({ 
  title, 
  icon, 
  items, 
  selectedSkills, 
  onToggleSkill,
  onToggleMultiple,
  defaultOpen = false 
}: GroupedFilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const selectedCount = selectedSkills.length;
  const showSearch = items.length > SEARCH_THRESHOLD;
  
  const categories = useMemo(() => parseSkillCategories(items), [items]);
  
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    
    const query = searchQuery.toLowerCase();
    const filtered = new Map<string, string[]>();
    
    categories.forEach((skills, category) => {
      const matchingSkills = skills.filter(skill => 
        skill.toLowerCase().includes(query) || category.toLowerCase().includes(query)
      );
      if (matchingSkills.length > 0) {
        filtered.set(category, matchingSkills);
      }
    });
    
    return filtered;
  }, [categories, searchQuery]);

  const isSkillSelected = (skillName: string): boolean => {
    return selectedSkills.includes(skillName);
  };
  
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };
  
  const getCategorySelectionState = (categorySkills: string[]) => {
    const selectedInCategory = categorySkills.filter(s => selectedSkills.includes(s));
    if (selectedInCategory.length === 0) return 'none';
    if (selectedInCategory.length === categorySkills.length) return 'all';
    return 'partial';
  };
  
  const handleSelectAllCategory = (categorySkills: string[], currentState: string) => {
    if (currentState === 'all') {
      // Deselect all in category
      onToggleMultiple(categorySkills, false);
    } else {
      // Select all in category
      onToggleMultiple(categorySkills, true);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors group">
        <div className="flex items-center gap-2">
          <span className="text-primary/70 group-hover:text-primary transition-colors">
            {icon}
          </span>
          <span className="font-medium text-sm text-foreground">{title}</span>
          {selectedCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs font-medium bg-primary/10 text-primary">
              {selectedCount}
            </Badge>
          )}
        </div>
        <ChevronDown 
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1 pb-2">
        {showSearch && (
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 pl-7 pr-7 text-xs bg-background border-border/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )}
        
        <div className="space-y-1 ml-1">
          {filteredCategories.size === 0 ? (
            <p className="text-xs text-muted-foreground px-3 py-2">No matches found</p>
          ) : (
            Array.from(filteredCategories.entries()).map(([category, categorySkills]) => {
              const isExpanded = expandedCategories.has(category) || searchQuery.trim() !== '';
              const selectionState = getCategorySelectionState(categorySkills);
              const selectedInCategory = categorySkills.filter(s => selectedSkills.includes(s)).length;
              
              return (
                <div key={category} className="border border-border/30 rounded-md overflow-hidden">
                  {/* Category Header */}
                  <div 
                    className="flex items-center gap-2 py-1.5 px-2 bg-accent/20 hover:bg-accent/40 cursor-pointer transition-colors"
                    onClick={() => toggleCategory(category)}
                  >
                    <ChevronRight 
                      className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    />
                    <Checkbox
                      checked={selectionState === 'all'}
                      ref={(el) => {
                        if (el) {
                          (el as HTMLButtonElement).dataset.state = selectionState === 'partial' ? 'indeterminate' : (selectionState === 'all' ? 'checked' : 'unchecked');
                        }
                      }}
                      className={`border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary ${selectionState === 'partial' ? 'bg-primary/50 border-primary' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAllCategory(categorySkills, selectionState);
                      }}
                      onCheckedChange={() => {}}
                    />
                    <span className="text-xs font-semibold text-foreground flex-1">{category}</span>
                    <Badge variant="outline" className="h-4 px-1 text-[10px] text-muted-foreground border-border/50">
                      {selectedInCategory}/{categorySkills.length}
                    </Badge>
                  </div>
                  
                  {/* Category Skills */}
                  {isExpanded && (
                    <div className="py-1 bg-background/50">
                    {categorySkills.map((skill) => {
                        const isSelected = isSkillSelected(skill);
                        const skillName = skill.includes(' - ') ? skill.split(' - ').slice(1).join(' - ') : skill;
                        const inputId = `skill-${skill}`.replace(/\s+/g, '-');
                        
                        return (
                          <div 
                            key={skill}
                            className={`flex items-center py-1.5 px-3 pl-8 transition-colors ${
                              isSelected ? 'bg-primary/5' : 'hover:bg-accent/30'
                            }`}
                          >
                            <label 
                              htmlFor={inputId}
                              className="flex items-center space-x-2 cursor-pointer flex-1 min-w-0"
                            >
                              <Checkbox
                                id={inputId}
                                checked={isSelected}
                                onCheckedChange={() => onToggleSkill(skill)}
                                className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <span className={`text-xs truncate ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                {skillName}
                              </span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function FilterSection({ title, icon, items, selected, onToggle, defaultOpen = true, searchable = false }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedCount = selected.length;
  
  const showSearch = searchable && items.length > SEARCH_THRESHOLD;
  
  const { selectedItems, unselectedItems } = useMemo(() => {
    let itemsToProcess = items;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      itemsToProcess = items.filter(item => item.toLowerCase().includes(query));
    }
    
    const selectedItems = itemsToProcess.filter(item => selected.includes(item));
    const unselectedItems = itemsToProcess.filter(item => !selected.includes(item));
    
    return { selectedItems, unselectedItems };
  }, [items, searchQuery, selected]);
  
  const hasNoResults = selectedItems.length === 0 && unselectedItems.length === 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors group">
        <div className="flex items-center gap-2">
          <span className="text-primary/70 group-hover:text-primary transition-colors">
            {icon}
          </span>
          <span className="font-medium text-sm text-foreground">{title}</span>
          {selectedCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs font-medium bg-primary/10 text-primary">
              {selectedCount}
            </Badge>
          )}
        </div>
        <ChevronDown 
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1 pb-2">
        {showSearch && (
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 pl-7 pr-7 text-xs bg-background border-border/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )}
        <div className={`space-y-0.5 ml-1 ${searchQuery ? 'max-h-48 overflow-y-auto scrollbar-thin' : ''}`}>
          {hasNoResults ? (
            <p className="text-xs text-muted-foreground px-3 py-2">No matches found</p>
          ) : (
            <>
              {selectedItems.map((item) => {
                const inputId = `${title}-${item}`.replace(/\s+/g, '-');
                return (
                  <label 
                    key={item}
                    htmlFor={inputId}
                    className="flex items-center space-x-2.5 py-1.5 px-3 rounded-md cursor-pointer transition-colors bg-primary/5"
                  >
                    <Checkbox
                      id={inputId}
                      checked={true}
                      onCheckedChange={() => onToggle(item)}
                      className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-sm text-foreground font-medium">
                      {item}
                    </span>
                  </label>
                );
              })}
              
              {selectedItems.length > 0 && unselectedItems.length > 0 && (
                <div className="border-t border-border/30 my-1.5 mx-3" />
              )}
              
              {unselectedItems.map((item) => {
                const inputId = `${title}-${item}`.replace(/\s+/g, '-');
                return (
                  <label 
                    key={item}
                    htmlFor={inputId}
                    className="flex items-center space-x-2.5 py-1.5 px-3 rounded-md cursor-pointer transition-colors hover:bg-accent/30"
                  >
                    <Checkbox
                      id={inputId}
                      checked={false}
                      onCheckedChange={() => onToggle(item)}
                      className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-sm text-muted-foreground">
                      {item}
                    </span>
                  </label>
                );
              })}
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function FilterSidebar({ filters, onFilterChange, resultCount, dynamicOptions, isLoadingOptions }: FilterSidebarProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayCount, setDisplayCount] = useState(resultCount);
  const prevCountRef = useRef(resultCount);

  useEffect(() => {
    if (prevCountRef.current !== resultCount) {
      const startCount = prevCountRef.current;
      const endCount = resultCount;
      const diff = Math.abs(endCount - startCount);
      
      if (diff > 0) {
        const duration = Math.min(400, Math.max(150, diff * 10));
        const startTime = performance.now();
        
        // Ease-out cubic: decelerates at the end for natural feel
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        
        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeOutCubic(progress);
          
          const currentValue = Math.round(startCount + (endCount - startCount) * easedProgress);
          setDisplayCount(currentValue);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        requestAnimationFrame(animate);
        
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 400);
        prevCountRef.current = resultCount;
        
        return () => clearTimeout(timer);
      }
      
      prevCountRef.current = resultCount;
    }
  }, [resultCount]);
  const toggleFilter = (category: keyof Omit<Filters, 'skills'>, item: string) => {
    const currentItems = filters[category] as string[];
    const newItems = currentItems.includes(item)
      ? currentItems.filter((i) => i !== item)
      : [...currentItems, item];
    onFilterChange({ ...filters, [category]: newItems });
  };

  const toggleSkill = (skill: string) => {
    const isSelected = filters.skills.includes(skill);
    if (isSelected) {
      onFilterChange({ ...filters, skills: filters.skills.filter(s => s !== skill) });
    } else {
      onFilterChange({ ...filters, skills: [...filters.skills, skill] });
    }
  };

  const toggleMultipleSkills = (skillNames: string[], select: boolean) => {
    if (select) {
      const skillsToAdd = skillNames.filter(skill => !filters.skills.includes(skill));
      onFilterChange({ ...filters, skills: [...filters.skills, ...skillsToAdd] });
    } else {
      onFilterChange({ ...filters, skills: filters.skills.filter(s => !skillNames.includes(s)) });
    }
  };

  const clearAllFilters = () => {
    onFilterChange({
      employmentTypes: [],
      seniorities: [],
      roleTitles: [],
      skills: [],
      industries: [],
      certificates: [],
      verticals: [],
    });
  };

  const totalFilters = 
    filters.employmentTypes.length +
    filters.seniorities.length +
    filters.roleTitles.length +
    filters.skills.length +
    filters.industries.length +
    filters.certificates.length +
    filters.verticals.length;

  // Use dynamic options if available, otherwise empty arrays
  const roleTitles = dynamicOptions?.roleTitles ?? [];
  const skills = dynamicOptions?.skills ?? [];
  const industries = dynamicOptions?.industries ?? [];
  const certificates = dynamicOptions?.certificates ?? [];
  const verticals = dynamicOptions?.verticals ?? [];

  return (
    <aside className="w-80 bg-gradient-to-b from-card to-card/95 border-r border-border flex flex-col h-full">
      {/* Logo Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Company Logo" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="font-bold text-foreground">Resourcing Hub</h1>
            <p className="text-xs text-muted-foreground">Find the right talent</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Filters</h2>
            {totalFilters > 0 && (
              <Badge className="h-5 px-1.5 text-xs font-medium bg-primary text-primary-foreground">
                {totalFilters}
              </Badge>
            )}
          </div>
          {totalFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <div className={`mt-3 p-4 rounded-xl border shadow-sm transition-all duration-300 ${
          resultCount === 0 
            ? 'bg-muted/50 border-border/50' 
            : 'bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border-primary/20'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-14 h-14 rounded-xl shadow-md transition-colors duration-300 ${
              resultCount === 0 
                ? 'bg-muted-foreground/20 text-muted-foreground' 
                : 'bg-primary text-primary-foreground'
            } ${isAnimating ? 'animate-pop' : ''}`}>
              <span className="text-2xl font-bold">{displayCount}</span>
            </div>
            <div>
              <p className={`text-lg font-bold leading-tight transition-colors ${
                resultCount === 0 ? 'text-muted-foreground' : 'text-foreground'
              }`}>
                {resultCount === 0 ? 'No Resources' : 'Resources Found'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {resultCount === 0 
                  ? 'Try adjusting your filters' 
                  : resultCount === 1 
                    ? 'Match for your criteria' 
                    : 'Matching your criteria'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 scrollbar-thin">
        <div className="p-3 space-y-1">
          {isLoadingOptions ? (
            <div className="flex items-center justify-center py-4 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Loading options...</span>
            </div>
          ) : (
            <GroupedFilterSection
              title="Skills"
              icon={<Wrench className="h-4 w-4" />}
              items={skills}
              selectedSkills={filters.skills}
              onToggleSkill={toggleSkill}
              onToggleMultiple={toggleMultipleSkills}
              defaultOpen={true}
            />
          )}

          <FilterSection
            title="Employment Type"
            icon={<Briefcase className="h-4 w-4" />}
            items={employmentTypes}
            selected={filters.employmentTypes}
            onToggle={(item) => toggleFilter('employmentTypes', item)}
          />

          <FilterSection
            title="Seniority"
            icon={<GraduationCap className="h-4 w-4" />}
            items={seniorities}
            selected={filters.seniorities}
            onToggle={(item) => toggleFilter('seniorities', item)}
          />

          {!isLoadingOptions && (
            <>
              <FilterSection
                title="Role Title"
                icon={<Users className="h-4 w-4" />}
                items={roleTitles}
                selected={filters.roleTitles}
                onToggle={(item) => toggleFilter('roleTitles', item)}
                defaultOpen={false}
                searchable
              />

              <FilterSection
                title="Industries"
                icon={<Building2 className="h-4 w-4" />}
                items={industries}
                selected={filters.industries}
                onToggle={(item) => toggleFilter('industries', item)}
                defaultOpen={false}
                searchable
              />

              <FilterSection
                title="Certificates"
                icon={<Award className="h-4 w-4" />}
                items={certificates}
                selected={filters.certificates}
                onToggle={(item) => toggleFilter('certificates', item)}
                defaultOpen={false}
                searchable
              />

              <FilterSection
                title="Verticals"
                icon={<MapPin className="h-4 w-4" />}
                items={verticals}
                selected={filters.verticals}
                onToggle={(item) => toggleFilter('verticals', item)}
                defaultOpen={false}
                searchable
              />
            </>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
