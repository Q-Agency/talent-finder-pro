import { Resource } from '@/services/resourceApi';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, Sparkles, Award, Search } from 'lucide-react';
import { HighlightText } from './HighlightText';

interface ResourceCardProps {
  resource: Resource;
  searchQuery?: string;
}

const getHiddenFieldMatches = (resource: Resource, query: string) => {
  if (!query) return [];
  const q = query.toLowerCase();
  const matches: { field: string; snippet: string }[] = [];
  
  if (resource.description?.toLowerCase().includes(q)) {
    const cleanDesc = resource.description.replace(/^"|"$/g, '');
    const idx = cleanDesc.toLowerCase().indexOf(q);
    const start = Math.max(0, idx - 30);
    const end = Math.min(cleanDesc.length, idx + query.length + 50);
    const snippet = (start > 0 ? '...' : '') + cleanDesc.slice(start, end).trim() + (end < cleanDesc.length ? '...' : '');
    matches.push({ field: 'Description', snippet });
  }
  if (resource.notes?.toLowerCase().includes(q)) {
    const idx = resource.notes.toLowerCase().indexOf(q);
    const start = Math.max(0, idx - 30);
    const end = Math.min(resource.notes.length, idx + query.length + 50);
    const snippet = (start > 0 ? '...' : '') + resource.notes.slice(start, end).trim() + (end < resource.notes.length ? '...' : '');
    matches.push({ field: 'Notes', snippet });
  }
  if (resource.superior?.toLowerCase().includes(q)) {
    matches.push({ field: 'Superior', snippet: resource.superior });
  }
  
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

export function ResourceCard({ resource, searchQuery = '' }: ResourceCardProps) {
  const allSkills = [
    ...(resource.skills?.senior || []),
    ...(resource.skills?.mid || []),
    ...(resource.skills?.junior || []),
  ];

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <Card className="group shadow-card hover:shadow-card-hover transition-all duration-200 animate-fade-in border-border/50 hover:border-primary/20">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-background shadow-sm">
            {resource.image_url && (
              <AvatarImage src={resource.image_url} alt={resource.resource_name} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(resource.resource_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div>
              <h3 className="font-semibold text-foreground truncate">
                <HighlightText text={resource.resource_name || 'Unknown'} query={searchQuery} />
              </h3>
              <p className="text-sm text-primary font-medium">
                <HighlightText text={resource.role_category || ''} query={searchQuery} />
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                <HighlightText text={resource.technical_domain || ''} query={searchQuery} />
              </span>
              {resource.vertical && (
                <span className="text-muted-foreground/60">
                  • <HighlightText text={resource.vertical} query={searchQuery} />
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-4">
          <Badge className={`text-xs font-semibold px-2.5 py-0.5 ${getEmploymentBadgeClass(resource.employment_type || '')}`}>
            {resource.employment_type || 'Unknown'}
          </Badge>
          <Badge className={`text-xs font-semibold px-2.5 py-0.5 ${getSeniorityBadgeClass(resource.seniority_level || '')}`}>
            {resource.seniority_level || 'Unknown'}
          </Badge>
        </div>

        {allSkills.length > 0 && (
          <div className="mt-4 space-y-2">
            {resource.skills?.senior && resource.skills.senior.length > 0 && (
              <div>
                <p className="text-xs font-medium text-badge-senior mb-1">Senior</p>
                <div className="flex flex-wrap gap-1">
                  {resource.skills.senior.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs font-normal bg-badge-senior/10 text-badge-senior border-badge-senior/20">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {resource.skills?.mid && resource.skills.mid.length > 0 && (
              <div>
                <p className="text-xs font-medium text-badge-mid mb-1">Mid</p>
                <div className="flex flex-wrap gap-1">
                  {resource.skills.mid.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs font-normal bg-badge-mid/10 text-badge-mid border-badge-mid/20">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {resource.skills?.junior && resource.skills.junior.length > 0 && (
              <div>
                <p className="text-xs font-medium text-badge-junior mb-1">Junior</p>
                <div className="flex flex-wrap gap-1">
                  {resource.skills.junior.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs font-normal bg-badge-junior/10 text-badge-junior border-badge-junior/20">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {resource.certificates && resource.certificates.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            <span>{resource.certificates.length} certificate{resource.certificates.length !== 1 ? 's' : ''}</span>
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

        {resource.industries && resource.industries.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Industries: {resource.industries.slice(0, 3).join(', ')}
              {resource.industries.length > 3 && ` +${resource.industries.length - 3}`}
            </p>
          </div>
        )}

        {(() => {
          const hiddenMatches = getHiddenFieldMatches(resource, searchQuery);
          if (hiddenMatches.length === 0) return null;
          return (
            <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
              {hiddenMatches.map((match, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-xs">
                  <Search className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-muted-foreground font-medium">{match.field}: </span>
                    <span className="text-muted-foreground">
                      <HighlightText text={match.snippet} query={searchQuery} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
}
