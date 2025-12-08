import { Resource } from '@/services/resourceApi';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Briefcase, Award, Building2, GraduationCap } from 'lucide-react';

interface ResourceDetailModalProps {
  resource: Resource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function ResourceDetailModal({ resource, open, onOpenChange }: ResourceDetailModalProps) {
  if (!resource) return null;

  const allSkills = [
    ...resource.skills.senior,
    ...resource.skills.mid,
    ...resource.skills.junior,
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-background shadow-sm">
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                {resource.resource_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">{resource.resource_name}</DialogTitle>
              <p className="text-primary font-medium mt-1">{resource.role_category}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={`font-medium ${getEmploymentBadgeClass(resource.employment_type)}`}>
              {resource.employment_type}
            </Badge>
            <Badge variant="outline" className={`font-medium ${getSeniorityBadgeClass(resource.seniority_level)}`}>
              {resource.seniority_level}
            </Badge>
          </div>

          {/* Domain & Vertical */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Domain:</span>
              <span className="font-medium">{resource.technical_domain}</span>
            </div>
            {resource.vertical && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Vertical:</span>
                <span className="font-medium">{resource.vertical}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {allSkills.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {allSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {resource.certificates && resource.certificates.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Certificates
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {resource.certificates.map((cert) => (
                  <Badge key={cert} variant="outline" className="text-sm bg-amber-500/10 text-amber-600 border-amber-500/20">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Industries */}
          {resource.industries.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Industries
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {resource.industries.map((industry) => (
                  <Badge key={industry} variant="outline" className="text-sm">
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
