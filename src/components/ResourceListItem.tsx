import { Resource } from '@/services/resourceApi';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Briefcase, Award } from 'lucide-react';

interface ResourceListItemProps {
  resource: Resource;
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

export function ResourceListItem({ resource }: ResourceListItemProps) {
  const allSkills = [
    ...resource.skills.senior,
    ...resource.skills.mid,
    ...resource.skills.junior,
  ];

  return (
    <div className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-lg hover:border-primary/20 transition-all duration-200 animate-fade-in">
      <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
          {resource.resource_name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 grid grid-cols-[200px_1fr_1fr_auto] gap-4 items-center">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground truncate">{resource.resource_name}</h3>
          <p className="text-sm text-primary font-medium truncate">{resource.role_category}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className={`text-xs font-medium ${getEmploymentBadgeClass(resource.employment_type)}`}>
            {resource.employment_type}
          </Badge>
          <Badge variant="outline" className={`text-xs font-medium ${getSeniorityBadgeClass(resource.seniority_level)}`}>
            {resource.seniority_level}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Briefcase className="h-3 w-3" />
            {resource.technical_domain}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 max-w-md">
          {allSkills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs font-normal">
              {skill}
            </Badge>
          ))}
          {allSkills.length > 4 && (
            <Badge variant="secondary" className="text-xs font-normal">
              +{allSkills.length - 4}
            </Badge>
          )}
          {resource.certificates && resource.certificates.length > 0 && (
            <>
              {resource.certificates.slice(0, 2).map((cert) => (
                <Badge key={cert} variant="outline" className="text-xs font-normal bg-amber-500/10 text-amber-600 border-amber-500/20">
                  <Award className="h-3 w-3 mr-1" />
                  {cert}
                </Badge>
              ))}
              {resource.certificates.length > 2 && (
                <Badge variant="outline" className="text-xs font-normal bg-amber-500/10 text-amber-600 border-amber-500/20">
                  +{resource.certificates.length - 2}
                </Badge>
              )}
            </>
          )}
        </div>

        {resource.industries.length > 0 && (
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {resource.industries.slice(0, 2).join(', ')}
            {resource.industries.length > 2 && ` +${resource.industries.length - 2}`}
          </p>
        )}
      </div>
    </div>
  );
}
