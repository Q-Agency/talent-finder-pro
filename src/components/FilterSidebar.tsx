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
import { X, Filter, ChevronDown, Briefcase, GraduationCap, Users, Wrench, Building2, Award, Loader2, Search } from 'lucide-react';
import { employmentTypes, seniorities } from '@/data/mockData';
import { useState, useMemo } from 'react';
import logo from '@/assets/logo.png';

export interface Filters {
  employmentTypes: string[];
  seniorities: string[];
  roleTitles: string[];
  skills: string[];
  industries: string[];
  certificates: string[];
}

interface DynamicOptions {
  roleTitles: string[];
  skills: string[];
  industries: string[];
  certificates: string[];
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

const SEARCH_THRESHOLD = 8; // Show search if more than this many items

function FilterSection({ title, icon, items, selected, onToggle, defaultOpen = true, searchable = false }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedCount = selected.length;
  
  const showSearch = searchable && items.length > SEARCH_THRESHOLD;
  
  const { selectedItems, unselectedItems } = useMemo(() => {
    let itemsToProcess = items;
    
    // Apply search filter if there's a query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      itemsToProcess = items.filter(item => item.toLowerCase().includes(query));
    }
    
    // Separate selected and unselected
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
              {/* Selected items pinned at top */}
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
              
              {/* Divider if there are both selected and unselected items */}
              {selectedItems.length > 0 && unselectedItems.length > 0 && (
                <div className="border-t border-border/30 my-1.5 mx-3" />
              )}
              
              {/* Unselected items */}
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
  const toggleFilter = (category: keyof Filters, item: string) => {
    const currentItems = filters[category];
    const newItems = currentItems.includes(item)
      ? currentItems.filter((i) => i !== item)
      : [...currentItems, item];
    onFilterChange({ ...filters, [category]: newItems });
  };

  const clearAllFilters = () => {
    onFilterChange({
      employmentTypes: [],
      seniorities: [],
      roleTitles: [],
      skills: [],
      industries: [],
      certificates: [],
    });
  };

  const totalFilters = Object.values(filters).flat().length;

  // Use dynamic options if available, otherwise empty arrays
  const roleTitles = dynamicOptions?.roleTitles ?? [];
  const skills = dynamicOptions?.skills ?? [];
  const industries = dynamicOptions?.industries ?? [];
  const certificates = dynamicOptions?.certificates ?? [];

  return (
    <aside className="w-72 bg-gradient-to-b from-card to-card/95 border-r border-border flex flex-col h-full">
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
        <div className="mt-3 p-2.5 rounded-lg bg-accent/30 border border-border/50">
          <p className="text-2xl font-bold text-foreground">{resultCount}</p>
          <p className="text-xs text-muted-foreground">
            {resultCount === 1 ? 'resource' : 'resources'} found
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 scrollbar-thin">
        <div className="p-3 space-y-1">
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

          {isLoadingOptions ? (
            <div className="flex items-center justify-center py-4 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Loading options...</span>
            </div>
          ) : (
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
                title="Skills"
                icon={<Wrench className="h-4 w-4" />}
                items={skills}
                selected={filters.skills}
                onToggle={(item) => toggleFilter('skills', item)}
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
            </>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
