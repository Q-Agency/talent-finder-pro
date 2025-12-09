import { Resource } from '@/services/resourceApi';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Briefcase, Award, Building2, GraduationCap, Sparkles, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 pb-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
          
          <div className="relative flex items-start gap-5">
            <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xl">
                {getInitials(resource.resource_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 pt-1">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {resource.resource_name}
              </h2>
              <p className="text-primary font-semibold text-lg mt-0.5">
                {resource.role_category}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className={`font-medium ${getEmploymentBadgeClass(resource.employment_type)}`}>
                  {resource.employment_type}
                </Badge>
                <Badge variant="outline" className={`font-medium ${getSeniorityBadgeClass(resource.seniority_level)}`}>
                  {resource.seniority_level}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Technical Domain</p>
                <p className="font-medium text-sm">{resource.technical_domain}</p>
              </div>
            </div>
            
            {resource.vertical && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vertical</p>
                  <p className="font-medium text-sm">{resource.vertical}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Skills Section */}
          {allSkills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center">
                  <GraduationCap className="h-3.5 w-3.5 text-secondary-foreground" />
                </div>
                <h4 className="font-semibold text-sm">Skills</h4>
                <span className="text-xs text-muted-foreground">({allSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allSkills.map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="secondary" 
                    className="text-sm px-3 py-1 hover:bg-secondary/80 transition-colors"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Certificates Section */}
          {resource.certificates && resource.certificates.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Award className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <h4 className="font-semibold text-sm">Certificates</h4>
                <span className="text-xs text-muted-foreground">({resource.certificates.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {resource.certificates.map((cert) => (
                  <Badge 
                    key={cert} 
                    variant="outline" 
                    className="text-sm px-3 py-1 bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                  >
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Industries Section */}
          {resource.industries.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-sm">Industries</h4>
                <span className="text-xs text-muted-foreground">({resource.industries.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {resource.industries.map((industry) => (
                  <Badge 
                    key={industry} 
                    variant="outline" 
                    className="text-sm px-3 py-1 hover:bg-accent transition-colors"
                  >
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Match Reasons */}
          {resource.match_reasons && resource.match_reasons.length > 0 && (
            <>
              <Separator />
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm text-primary">Why this match?</h4>
                </div>
                <ul className="space-y-1">
                  {resource.match_reasons.map((reason, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
