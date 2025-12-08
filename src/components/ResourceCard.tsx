import { Resource } from '@/services/resourceApi';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Briefcase, Sparkles } from 'lucide-react';

interface ResourceCardProps {
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

export function ResourceCard({ resource }: ResourceCardProps) {
  const allSkills = [
    ...resource.skills.senior,
    ...resource.skills.mid,
    ...resource.skills.junior,
  ];

  return (
    <Card className="group shadow-card hover:shadow-card-hover transition-all duration-200 animate-fade-in border-border/50 hover:border-primary/20">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-background shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {resource.resource_name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div>
              <h3 className="font-semibold text-foreground truncate">{resource.resource_name}</h3>
              <p className="text-sm text-primary font-medium">{resource.role_category}</p>
            </div>
            
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {resource.technical_domain}
              </span>
              {resource.vertical && (
                <span className="text-muted-foreground/60">• {resource.vertical}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-4">
          <Badge variant="outline" className={`text-xs font-medium ${getEmploymentBadgeClass(resource.employment_type)}`}>
            {resource.employment_type}
          </Badge>
          <Badge variant="outline" className={`text-xs font-medium ${getSeniorityBadgeClass(resource.seniority_level)}`}>
            {resource.seniority_level}
          </Badge>
        </div>

        {allSkills.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Skills</p>
            <div className="flex flex-wrap gap-1">
              {allSkills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs font-normal">
                  {skill}
                </Badge>
              ))}
              {allSkills.length > 5 && (
                <Badge variant="secondary" className="text-xs font-normal">
                  +{allSkills.length - 5}
                </Badge>
              )}
            </div>
          </div>
        )}

        {resource.match_reasons && resource.match_reasons.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary mt-0.5 shrink-0" />
              <span>{resource.match_reasons.slice(0, 2).join(' • ')}</span>
            </div>
          </div>
        )}

        {resource.industries.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Industries: {resource.industries.slice(0, 3).join(', ')}
              {resource.industries.length > 3 && ` +${resource.industries.length - 3}`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
