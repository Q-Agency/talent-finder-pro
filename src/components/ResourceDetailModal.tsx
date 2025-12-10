import { Resource } from '@/services/resourceApi';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Briefcase, Award, Building2, GraduationCap, Sparkles, MapPin, User, FileText, StickyNote, Users, UserCheck, Crown, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

interface ResourceDetailModalProps {
  resource: Resource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSkillClick?: (skill: string) => void;
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

export function ResourceDetailModal({ resource, open, onOpenChange, onSkillClick }: ResourceDetailModalProps) {
  if (!resource) return null;

  const allSkills = [
    ...resource.skills.senior,
    ...resource.skills.mid,
    ...resource.skills.junior,
  ];

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  const handleSkillClick = (skill: string) => {
    const { dismiss } = toast({
      title: `Filter by "${skill}"?`,
      description: "This will add the skill to your active filters with all seniority levels.",
      action: (
        <button
          className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          onClick={() => {
            onSkillClick?.(skill);
            dismiss();
          }}
        >
          Confirm
        </button>
      ),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 pb-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
          
          <div className="relative flex items-start gap-5">
            <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl">
              {resource.image_url && (
                <AvatarImage src={resource.image_url} alt={resource.resource_name} />
              )}
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
              
              {resource.email && (
                <a 
                  href={`mailto:${resource.email}`} 
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {resource.email}
                </a>
              )}
              
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

            {resource.superior && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Superior</p>
                  <p className="font-medium text-sm">{resource.superior}</p>
                </div>
              </div>
            )}

            {resource.department && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium text-sm">{resource.department}</p>
                </div>
              </div>
            )}

            {resource.el && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">EL</p>
                  <p className="font-medium text-sm">{resource.el}</p>
                </div>
              </div>
            )}

            {resource.eh && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">EH</p>
                  <p className="font-medium text-sm">{resource.eh}</p>
                </div>
              </div>
            )}

            {resource.director && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Crown className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Director</p>
                  <p className="font-medium text-sm">{resource.director}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description Section */}
          {resource.description && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-sm">Description</h4>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-line pl-9">
                {resource.description.replace(/^"|"$/g, '')}
              </p>
            </div>
          )}

          {/* Notes Section */}
          {resource.notes && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <StickyNote className="h-3.5 w-3.5 text-orange-600" />
                </div>
                <h4 className="font-semibold text-sm">Notes</h4>
              </div>
              <p className="text-sm text-muted-foreground pl-9">
                {resource.notes}
              </p>
            </div>
          )}

          <Separator />

          {/* Skills Section */}
          {allSkills.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center">
                  <GraduationCap className="h-3.5 w-3.5 text-secondary-foreground" />
                </div>
                <h4 className="font-semibold text-sm">Skills</h4>
                <span className="text-xs text-muted-foreground">({allSkills.length})</span>
              </div>
              
              <div className="space-y-3 pl-9">
                {resource.skills.senior.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-badge-senior mb-1.5">Senior Level</p>
                    <div className="flex flex-wrap gap-1.5">
                      {resource.skills.senior.map((skill) => (
                        <Badge 
                          key={skill} 
                          variant="outline" 
                          className="text-xs px-2 py-0.5 bg-badge-senior/10 text-badge-senior border-badge-senior/20 cursor-pointer hover:bg-badge-senior/20 transition-colors"
                          onClick={() => handleSkillClick(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {resource.skills.mid.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-badge-mid mb-1.5">Mid Level</p>
                    <div className="flex flex-wrap gap-1.5">
                      {resource.skills.mid.map((skill) => (
                        <Badge 
                          key={skill} 
                          variant="outline" 
                          className="text-xs px-2 py-0.5 bg-badge-mid/10 text-badge-mid border-badge-mid/20 cursor-pointer hover:bg-badge-mid/20 transition-colors"
                          onClick={() => handleSkillClick(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {resource.skills.junior.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-badge-junior mb-1.5">Junior Level</p>
                    <div className="flex flex-wrap gap-1.5">
                      {resource.skills.junior.map((skill) => (
                        <Badge 
                          key={skill} 
                          variant="outline" 
                          className="text-xs px-2 py-0.5 bg-badge-junior/10 text-badge-junior border-badge-junior/20 cursor-pointer hover:bg-badge-junior/20 transition-colors"
                          onClick={() => handleSkillClick(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
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
