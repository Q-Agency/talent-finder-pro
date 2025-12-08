import { Resource } from '@/services/resourceApi';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { HighlightText } from './HighlightText';

interface ResourceListItemProps {
  resource: Resource;
  searchQuery?: string;
  onClick: () => void;
}

const getEmploymentBadgeClass = (type: string) => {
  const normalizedType = type.toLowerCase();
  if (normalizedType === 'employee') {
    return 'bg-badge-employee/10 text-badge-employee border-badge-employee/20';
  }
  if (normalizedType === 'contractor') {
    return 'bg-badge-contractor/10 text-badge-contractor border-badge-contractor/20';
  }
  if (normalizedType === 'student') {
    return 'bg-badge-student/10 text-badge-student border-badge-student/20';
  }
  return '';
};

const getSeniorityBadgeClass = (seniority: string) => {
  const lower = seniority.toLowerCase();
  if (lower.includes('senior')) {
    return 'bg-badge-senior/10 text-badge-senior border-badge-senior/20';
  }
  if (lower.includes('mid')) {
    return 'bg-badge-mid/10 text-badge-mid border-badge-mid/20';
  }
  return 'bg-badge-junior/10 text-badge-junior border-badge-junior/20';
};

export function ResourceListItem({ resource, searchQuery = '', onClick }: ResourceListItemProps) {
  return (
    <div 
      className="flex items-center gap-4 p-3 bg-card border border-border/50 rounded-lg hover:border-primary/20 hover:bg-accent/50 transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
          {resource.resource_name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 flex items-center gap-6">
        <div className="min-w-[180px]">
          <h3 className="font-medium text-foreground text-sm truncate">
            <HighlightText text={resource.resource_name} query={searchQuery} />
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            <HighlightText text={resource.role_category} query={searchQuery} />
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-xs ${getEmploymentBadgeClass(resource.employment_type)}`}>
            {resource.employment_type}
          </Badge>
          <Badge variant="outline" className={`text-xs ${getSeniorityBadgeClass(resource.seniority_level)}`}>
            {resource.seniority_level}
          </Badge>
        </div>

        <span className="text-xs text-muted-foreground hidden lg:block">
          <HighlightText text={resource.technical_domain} query={searchQuery} />
        </span>
      </div>
    </div>
  );
}
