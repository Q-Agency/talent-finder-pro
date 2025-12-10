import { Resource } from '@/services/resourceApi';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HighlightText } from './HighlightText';
import { Search, Building2, TrendingUp } from 'lucide-react';

interface ResourceListItemProps {
  resource: Resource;
  searchQuery?: string;
  onClick: () => void;
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

export function ResourceListItem({ resource, searchQuery = '', onClick }: ResourceListItemProps) {
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
        <div className="min-w-[180px]">
          <h3 className="font-medium text-foreground text-sm truncate">
            <HighlightText text={resource.resource_name || 'Unknown'} query={searchQuery} />
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            <HighlightText text={resource.role_category || ''} query={searchQuery} />
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={`text-xs font-semibold px-2.5 py-0.5 ${getEmploymentBadgeClass(resource.employment_type || '')}`}>
            <Building2 className="h-3 w-3 mr-1" />
            {resource.employment_type || 'Unknown'}
          </Badge>
          <Badge className={`text-xs font-semibold px-2.5 py-0.5 ${getSeniorityBadgeClass(resource.seniority_level || '')}`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {resource.seniority_level || 'Unknown'}
          </Badge>
        </div>


        {resource.skills && (
          <div className="hidden xl:flex items-center gap-1 flex-wrap max-w-[200px]">
            {(() => {
              const allSkills = [
                ...(resource.skills.senior || []),
                ...(resource.skills.mid || []),
                ...(resource.skills.junior || [])
              ];
              return (
                <>
                  {allSkills.slice(0, 3).map((skill, idx) => {
                    const skillName = skill.includes(' - ') ? skill.split(' - ')[1] : skill;
                    return (
                      <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-muted/50">
                        {skillName}
                      </Badge>
                    );
                  })}
                  {allSkills.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{allSkills.length - 3}</span>
                  )}
                </>
              );
            })()}
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
