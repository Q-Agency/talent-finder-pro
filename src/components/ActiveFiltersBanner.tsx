import { X, Info, Briefcase, TrendingUp, UserCircle, Building2, Award, MapPin } from 'lucide-react';
import { Filters, SkillLevel } from '@/components/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type SkillFilterMode = 'and' | 'or';

interface ActiveFiltersBannerProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  skillFilterMode: SkillFilterMode;
  onSkillFilterModeChange: (mode: SkillFilterMode) => void;
  modeCounts?: { and: number; or: number };
  globalSkillLevels: SkillLevel[];
  onGlobalSkillLevelsChange: (levels: SkillLevel[]) => void;
  levelCounts: { senior: number; mid: number; junior: number };
}

const levelLabels: Record<SkillLevel, string> = {
  senior: 'S',
  mid: 'M',
  junior: 'J',
};

const levelColors: Record<SkillLevel, string> = {
  senior: 'bg-badge-senior text-white',
  mid: 'bg-badge-mid text-white',
  junior: 'bg-badge-junior text-white',
};

const levelColorsInactive = 'bg-muted text-muted-foreground';

type FilterCategory = 'employmentTypes' | 'seniorities' | 'roleTitles' | 'industries' | 'certificates' | 'verticals';

const filterConfig: Record<FilterCategory, { label: string; icon: React.ElementType; color: string }> = {
  employmentTypes: { label: 'Employment', icon: Briefcase, color: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30' },
  seniorities: { label: 'Seniority', icon: TrendingUp, color: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30' },
  roleTitles: { label: 'Role', icon: UserCircle, color: 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30' },
  industries: { label: 'Industry', icon: Building2, color: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30' },
  certificates: { label: 'Certificate', icon: Award, color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30' },
  verticals: { label: 'Vertical', icon: MapPin, color: 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30' },
};

export function ActiveFiltersBanner({
  filters,
  onFilterChange,
  skillFilterMode,
  onSkillFilterModeChange,
  modeCounts,
  globalSkillLevels,
  onGlobalSkillLevelsChange,
  levelCounts,
}: ActiveFiltersBannerProps) {
  const hasSkillFilters = filters.skills.length > 0;
  const hasOtherFilters = 
    filters.employmentTypes.length > 0 ||
    filters.seniorities.length > 0 ||
    filters.roleTitles.length > 0 ||
    filters.industries.length > 0 ||
    filters.certificates.length > 0 ||
    filters.verticals.length > 0;

  if (!hasSkillFilters && !hasOtherFilters) return null;

  const handleRemoveSkill = (skill: string) => {
    onFilterChange({
      ...filters,
      skills: filters.skills.filter(s => s !== skill)
    });
  };

  const handleToggleGlobalLevel = (level: SkillLevel) => {
    const hasLevel = globalSkillLevels.includes(level);
    // Don't allow removing the last level
    if (hasLevel && globalSkillLevels.length === 1) return;
    
    if (hasLevel) {
      onGlobalSkillLevelsChange(globalSkillLevels.filter(l => l !== level));
    } else {
      onGlobalSkillLevelsChange([...globalSkillLevels, level]);
    }
  };

  const handleRemoveFilter = (category: FilterCategory, value: string) => {
    onFilterChange({
      ...filters,
      [category]: filters[category].filter(v => v !== value)
    });
  };

  const handleClearAll = () => {
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

  return (
    <div className="bg-card/50 border border-border/50 rounded-lg p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {/* Global skill levels toggle - only show when skills are selected */}
          {hasSkillFilters && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Skill Levels:</span>
              <div className="flex gap-1">
                {(['senior', 'mid', 'junior'] as const).map((level) => {
                  const isActive = globalSkillLevels.includes(level);
                  const count = levelCounts[level];
                  return (
                    <button
                      key={level}
                      onClick={() => handleToggleGlobalLevel(level)}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        isActive ? levelColors[level] : levelColorsInactive
                      }`}
                      title={`${level.charAt(0).toUpperCase() + level.slice(1)} level - ${count} resource${count !== 1 ? 's' : ''}`}
                    >
                      {levelLabels[level]}
                      <span className={`text-[9px] ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[220px]">
                    <p className="text-xs">
                      <strong>S</strong> = Senior level skills<br />
                      <strong>M</strong> = Mid level skills<br />
                      <strong>J</strong> = Junior level skills<br />
                      <span className="text-muted-foreground mt-1 block">Numbers show resources with selected skills at each level</span>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* AND/OR mode toggle */}
          {filters.skills.length > 1 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-background/80 border border-border rounded-md p-0.5">
                <button
                  onClick={() => onSkillFilterModeChange('and')}
                  className={`px-2 py-0.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                    skillFilterMode === 'and'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  ALL
                  {modeCounts && (
                    <span className={`text-[10px] ${skillFilterMode === 'and' ? 'opacity-80' : 'opacity-60'}`}>
                      ({modeCounts.and})
                    </span>
                  )}
                </button>
                <button
                  onClick={() => onSkillFilterModeChange('or')}
                  className={`px-2 py-0.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                    skillFilterMode === 'or'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  ANY
                  {modeCounts && (
                    <span className={`text-[10px] ${skillFilterMode === 'or' ? 'opacity-80' : 'opacity-60'}`}>
                      ({modeCounts.or})
                    </span>
                  )}
                </button>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px]">
                    <p className="text-xs">
                      <strong>ALL:</strong> Resources must have every selected skill<br />
                      <strong>ANY:</strong> Resources need at least one selected skill
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Skill filters as simple chips */}
        {filters.skills.map((skill) => (
          <div
            key={skill}
            className="flex items-center gap-1 bg-background/80 border border-border rounded-md px-2 py-1"
          >
            <span className="text-sm font-medium">{skill}</span>
            <button
              onClick={() => handleRemoveSkill(skill)}
              className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Other filters as simple chips */}
        {(Object.keys(filterConfig) as FilterCategory[]).map(category => 
          filters[category].map(value => {
            const config = filterConfig[category];
            const Icon = config.icon;
            return (
              <div
                key={`${category}-${value}`}
                className={`flex items-center gap-1.5 border rounded-md px-2 py-1 ${config.color}`}
              >
                <Icon className="w-3 h-3" />
                <span className="text-xs font-medium">{value}</span>
                <button
                  onClick={() => handleRemoveFilter(category, value)}
                  className="ml-0.5 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
