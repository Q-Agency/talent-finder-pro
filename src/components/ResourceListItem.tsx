import { Resource } from '@/services/resourceApi';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HighlightText } from './HighlightText';
import { Search, Building2, TrendingUp, Info, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SkillLevel } from './FilterSidebar';
import { AvailabilityBadge } from './AvailabilityBadge';
import { MiniTimeline } from './MiniTimeline';
import { AvailabilityResult, Assignment } from '@/services/availabilityService';

interface ResourceListItemProps {
  resource: Resource;
  searchQuery?: string;
  onClick: () => void;
  activeSkillFilters?: string[];
  activeSkillLevels?: SkillLevel[];
  availability?: AvailabilityResult;
  assignments?: Assignment[];
  dateRange?: { start: Date; end: Date } | null;
}

const getHiddenFieldMatches = (resource: Resource, query: string) => {
  if (!query) return [];
  const q = query.toLowerCase();
  const matches: string[] = [];
  
  if (resource.description?.toLowerCase().includes(q)) matches.push('Description');
  if (resource.notes?.toLowerCase().includes(q)) matches.push('Notes');
  if (resource.superior?.toLowerCase().includes(q)) matches.push('Superior');
  
  return matches;
};

const getEmploymentBadgeClass = (type: string) => {
  const normalizedType = type.toLowerCase();
  if (normalizedType === 'employee') {
    return 'bg-badge-employee/20 text-badge-employee border border-badge-employee/30';
  }
  if (normalizedType === 'contractor') {
    return 'bg-badge-contractor/20 text-badge-contractor border border-badge-contractor/30';
  }
  if (normalizedType === 'student') {
    return 'bg-badge-student/20 text-badge-student border border-badge-student/30';
  }
  return '';
};

const getSeniorityBadgeClass = (seniority: string) => {
  const lower = seniority.toLowerCase();
  if (lower.includes('senior')) {
    return 'bg-badge-senior/20 text-badge-senior border border-badge-senior/30';
  }
  if (lower.includes('mid')) {
    return 'bg-badge-mid/20 text-badge-mid border border-badge-mid/30';
  }
  return 'bg-badge-junior/20 text-badge-junior border border-badge-junior/30';
};

// Check if a skill at a given level is part of the active filter
function isSkillMatchingFilter(
  skill: string, 
  level: SkillLevel, 
  activeFilters: string[],
  activeLevels: SkillLevel[]
): boolean {
  return activeFilters.includes(skill) && activeLevels.includes(level);
}

export function ResourceListItem({ resource, searchQuery = '', onClick, activeSkillFilters = [], activeSkillLevels = ['senior', 'mid', 'junior'], availability, assignments = [], dateRange }: ResourceListItemProps) {
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div 
      className="flex items-center gap-4 p-3 bg-card border border-border/50 rounded-lg hover:border-primary/20 hover:bg-accent/50 transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm shrink-0">
        {resource.image_url && (
          <AvatarImage src={resource.image_url} alt={resource.resource_name} />
        )}
        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
          {getInitials(resource.resource_name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 flex items-center gap-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="min-w-[180px]">
              <h3 className="font-medium text-foreground text-sm truncate">
                <HighlightText text={resource.resource_name || 'Unknown'} query={searchQuery} />
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                <HighlightText text={resource.role_category || ''} query={searchQuery} />
              </p>
            </div>
          </TooltipTrigger>
          {resource.technical_domain && (
            <TooltipContent>
              <p>{resource.technical_domain}</p>
            </TooltipContent>
          )}
        </Tooltip>

        <div className="flex items-center gap-2">
          {availability && (
            <AvailabilityBadge availability={availability} compact />
          )}
          <Badge className={`text-xs font-semibold px-2.5 py-0.5 ${getEmploymentBadgeClass(resource.employment_type || '')}`}>
            <Building2 className="h-3 w-3 mr-1" />
            {resource.employment_type || 'Unknown'}
          </Badge>
          <Badge className={`text-xs font-semibold px-2.5 py-0.5 ${getSeniorityBadgeClass(resource.seniority_level || '')}`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {resource.seniority_level || 'Unknown'}
          </Badge>
        </div>

        {dateRange && (
          <div className="hidden lg:block w-32">
            <MiniTimeline
              resourceId={resource.resource_id}
              assignments={assignments}
              rangeStart={dateRange.start}
              rangeEnd={dateRange.end}
              compact
            />
          </div>
        )}


        {resource.skills && (
          <div className="hidden xl:flex items-center gap-1.5 max-w-[280px]">
            <div className="flex items-center gap-1 flex-wrap">
              {(() => {
                const getSkillName = (skill: string) => skill.includes(' - ') ? skill.split(' - ')[1] : skill;
                const seniorSkills = resource.skills.senior || [];
                const midSkills = resource.skills.mid || [];
                const juniorSkills = resource.skills.junior || [];
                
                const allSkills: { name: string; fullName: string; level: SkillLevel }[] = [
                  ...seniorSkills.map(s => ({ name: getSkillName(s), fullName: s, level: 'senior' as const })),
                  ...midSkills.map(s => ({ name: getSkillName(s), fullName: s, level: 'mid' as const })),
                  ...juniorSkills.map(s => ({ name: getSkillName(s), fullName: s, level: 'junior' as const }))
                ];
                
                const displaySkills = allSkills.slice(0, 3);
                const hiddenSkills = allSkills.slice(3);

                const levelStyles = {
                  senior: 'bg-badge-senior/20 text-badge-senior border-badge-senior/30',
                  mid: 'bg-badge-mid/20 text-badge-mid border-badge-mid/30',
                  junior: 'bg-badge-junior/20 text-badge-junior border-badge-junior/30'
                };

                const renderSkillBadge = (skill: { name: string; fullName: string; level: SkillLevel }, idx: number) => {
                  const isMatching = isSkillMatchingFilter(skill.fullName, skill.level, activeSkillFilters, activeSkillLevels);
                  return (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className={`text-[10px] px-1.5 py-0 h-5 border ${levelStyles[skill.level]} ${
                        isMatching ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
                      }`}
                    >
                      {isMatching && <Check className="h-2.5 w-2.5 mr-0.5 text-primary" />}
                      {skill.name}
                    </Badge>
                  );
                };

                return (
                  <>
                    {displaySkills.map((skill, idx) => renderSkillBadge(skill, idx))}
                    {hiddenSkills.length > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-[10px] text-muted-foreground cursor-help hover:text-foreground">+{hiddenSkills.length}</span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px]">
                          <div className="flex flex-wrap gap-1">
                            {hiddenSkills.map((skill, idx) => renderSkillBadge(skill, idx + displaySkills.length))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </>
                );
              })()}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help shrink-0" />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <div className="flex flex-col gap-1">
                  <span className="font-medium mb-1">Skill Levels</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-badge-senior" />
                    <span>Senior</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-badge-mid" />
                    <span>Mid</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-badge-junior" />
                    <span>Junior</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {(() => {
          const hiddenMatches = getHiddenFieldMatches(resource, searchQuery);
          if (hiddenMatches.length === 0) return null;
          return (
            <span className="hidden md:flex items-center gap-1 text-xs text-primary shrink-0">
              <Search className="h-3 w-3" />
              <span className="text-muted-foreground">in {hiddenMatches.join(', ')}</span>
            </span>
          );
        })()}
      </div>
    </div>
  );
}