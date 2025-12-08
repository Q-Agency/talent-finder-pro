import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';
import {
  employmentTypes,
  seniorities,
  roleTitles,
  skills,
  industries,
  certificates,
} from '@/data/mockData';

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
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
}

function FilterSection({ title, items, selected, onToggle }: FilterSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-center space-x-2">
            <Checkbox
              id={`${title}-${item}`}
              checked={selected.includes(item)}
              onCheckedChange={() => onToggle(item)}
              className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label
              htmlFor={`${title}-${item}`}
              className="text-sm font-normal text-foreground/80 cursor-pointer hover:text-foreground transition-colors"
            >
              {item}
            </Label>
          </div>
        ))}
      </div>
    </div>
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
    <aside className="w-72 bg-card border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Filters</h2>
          </div>
          {totalFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Clear all
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {resultCount} {resultCount === 1 ? 'resource' : 'resources'} found
        </p>
      </div>

      <ScrollArea className="flex-1 scrollbar-thin">
        <div className="p-4 space-y-6">
          <FilterSection
            title="Employment Type"
            items={employmentTypes}
            selected={filters.employmentTypes}
            onToggle={(item) => toggleFilter('employmentTypes', item)}
          />

          <Separator />

          <FilterSection
            title="Seniority"
            items={seniorities}
            selected={filters.seniorities}
            onToggle={(item) => toggleFilter('seniorities', item)}
          />

          <Separator />

          <FilterSection
            title="Role Title"
            items={roleTitles}
            selected={filters.roleTitles}
            onToggle={(item) => toggleFilter('roleTitles', item)}
          />

          <Separator />

          <FilterSection
            title="Skills"
            items={skills}
            selected={filters.skills}
            onToggle={(item) => toggleFilter('skills', item)}
          />

          <Separator />

          <FilterSection
            title="Industries"
            items={industries}
            selected={filters.industries}
            onToggle={(item) => toggleFilter('industries', item)}
          />

          <Separator />

          <FilterSection
            title="Certificates"
            items={certificates}
            selected={filters.certificates}
            onToggle={(item) => toggleFilter('certificates', item)}
          />
        </div>
      </ScrollArea>
    </aside>
  );
}
