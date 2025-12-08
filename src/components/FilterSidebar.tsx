import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { X, Filter, ChevronDown, Briefcase, GraduationCap, Users, Wrench, Building2, Award } from 'lucide-react';
import {
  employmentTypes,
  seniorities,
  roleTitles,
  skills,
  industries,
  certificates,
} from '@/data/mockData';
import { useState } from 'react';

export interface Filters {
  employmentTypes: string[];
  seniorities: string[];
  roleTitles: string[];
  skills: string[];
  industries: string[];
  certificates: string[];
}

interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  resultCount: number;
}

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
  defaultOpen?: boolean;
}

function FilterSection({ title, icon, items, selected, onToggle, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const selectedCount = selected.length;

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
        <div className="space-y-0.5 ml-1">
          {items.map((item) => {
            const isChecked = selected.includes(item);
            return (
              <div 
                key={item} 
                className={`flex items-center space-x-2.5 py-1.5 px-3 rounded-md cursor-pointer transition-colors ${
                  isChecked ? 'bg-primary/5' : 'hover:bg-accent/30'
                }`}
                onClick={() => onToggle(item)}
              >
                <Checkbox
                  id={`${title}-${item}`}
                  checked={isChecked}
                  onCheckedChange={() => onToggle(item)}
                  className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor={`${title}-${item}`}
                  className={`text-sm cursor-pointer transition-colors ${
                    isChecked ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {item}
                </Label>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function FilterSidebar({ filters, onFilterChange, resultCount }: FilterSidebarProps) {
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

  return (
    <aside className="w-72 bg-gradient-to-b from-card to-card/95 border-r border-border flex flex-col h-full">
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

          <FilterSection
            title="Role Title"
            icon={<Users className="h-4 w-4" />}
            items={roleTitles}
            selected={filters.roleTitles}
            onToggle={(item) => toggleFilter('roleTitles', item)}
            defaultOpen={false}
          />

          <FilterSection
            title="Skills"
            icon={<Wrench className="h-4 w-4" />}
            items={skills}
            selected={filters.skills}
            onToggle={(item) => toggleFilter('skills', item)}
            defaultOpen={false}
          />

          <FilterSection
            title="Industries"
            icon={<Building2 className="h-4 w-4" />}
            items={industries}
            selected={filters.industries}
            onToggle={(item) => toggleFilter('industries', item)}
            defaultOpen={false}
          />

          <FilterSection
            title="Certificates"
            icon={<Award className="h-4 w-4" />}
            items={certificates}
            selected={filters.certificates}
            onToggle={(item) => toggleFilter('certificates', item)}
            defaultOpen={false}
          />
        </div>
      </ScrollArea>
    </aside>
  );
}
