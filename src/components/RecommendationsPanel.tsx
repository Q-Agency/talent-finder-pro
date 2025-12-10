import { useState, useMemo } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Target, Clock, Award, X } from 'lucide-react';
import { Resource } from '@/services/resourceApi';
import { AvailabilityResult } from '@/services/availabilityService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface RecommendationsPanelProps {
  resources: Resource[];
  availability: Map<string, AvailabilityResult>;
  selectedSkills: string[];
  dateRange: { start: Date; end: Date } | null;
  onResourceClick: (resource: Resource) => void;
  className?: string;
}

interface ScoredResource {
  resource: Resource;
  score: number;
  reasons: string[];
  skillMatchCount: number;
  availabilityScore: number;
}

function calculateResourceScore(
  resource: Resource,
  selectedSkills: string[],
  availability: Map<string, AvailabilityResult>,
  dateRange: { start: Date; end: Date } | null
): ScoredResource {
  let score = 0;
  const reasons: string[] = [];
  
  // Skill matching (40% weight)
  const resourceSkillNames = [
    ...(resource.skills?.senior || []),
    ...(resource.skills?.mid || []),
    ...(resource.skills?.junior || []),
  ].map(s => s.toLowerCase());
  
  const matchedSkills = selectedSkills.filter(skill => {
    const skillName = skill.includes(' - ') ? skill.split(' - ')[1] : skill;
    return resourceSkillNames.some(rs => rs.toLowerCase().includes(skillName.toLowerCase()));
  });
  
  const skillMatchCount = matchedSkills.length;
  const skillScore = selectedSkills.length > 0 
    ? (skillMatchCount / selectedSkills.length) * 40 
    : 20; // Base score if no skills selected
  score += skillScore;
  
  if (skillMatchCount > 0) {
    reasons.push(`${skillMatchCount}/${selectedSkills.length} skills match`);
  }
  
  // Senior skill bonus
  const seniorMatches = selectedSkills.filter(skill => {
    const skillName = skill.includes(' - ') ? skill.split(' - ')[1] : skill;
    return (resource.skills?.senior || []).some(s => 
      s.toLowerCase().includes(skillName.toLowerCase())
    );
  }).length;
  
  if (seniorMatches > 0) {
    score += seniorMatches * 5;
    reasons.push(`${seniorMatches} at senior level`);
  }
  
  // Availability (40% weight)
  let availabilityScore = 20; // Default if no date range
  if (dateRange) {
    const avail = availability.get(resource.resource_id);
    if (avail) {
      availabilityScore = (avail.percentage / 100) * 40;
      if (avail.percentage >= 80) {
        reasons.push(`${avail.percentage}% available`);
      } else if (avail.percentage >= 50) {
        reasons.push(`${avail.percentage}% available`);
      }
    }
  }
  score += availabilityScore;
  
  // Seniority bonus (20% weight)
  const seniorityScore = resource.seniority_level?.toLowerCase().includes('senior') ? 20 :
                         resource.seniority_level?.toLowerCase().includes('mid') ? 15 : 10;
  score += seniorityScore;
  
  // Certificate bonus
  if (resource.certificates && resource.certificates.length > 0) {
    score += Math.min(resource.certificates.length * 2, 10);
    if (resource.certificates.length >= 2) {
      reasons.push(`${resource.certificates.length} certifications`);
    }
  }
  
  return {
    resource,
    score: Math.min(score, 100),
    reasons,
    skillMatchCount,
    availabilityScore,
  };
}

export function RecommendationsPanel({
  resources,
  availability,
  selectedSkills,
  dateRange,
  onResourceClick,
  className,
}: RecommendationsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  
  const recommendations = useMemo(() => {
    if (resources.length === 0) return [];
    
    const scored = resources.map(resource => 
      calculateResourceScore(resource, selectedSkills, availability, dateRange)
    );
    
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [resources, selectedSkills, availability, dateRange]);
  
  // Only show if there are skills or date range selected
  const shouldShow = (selectedSkills.length > 0 || dateRange) && !isDismissed;
  
  if (!shouldShow || recommendations.length === 0) return null;
  
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-orange-500';
  };
  
  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-500/10 border-green-500/20';
    if (score >= 50) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-orange-500/10 border-orange-500/20';
  };

  return (
    <div className={cn(
      "bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-lg overflow-hidden",
      className
    )}>
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-primary/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Smart Recommendations</span>
          <Badge variant="secondary" className="text-xs">
            Top {recommendations.length} matches
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          <p className="text-xs text-muted-foreground mb-3">
            Based on {selectedSkills.length > 0 ? `${selectedSkills.length} selected skills` : ''}
            {selectedSkills.length > 0 && dateRange ? ' and ' : ''}
            {dateRange ? 'availability in selected date range' : ''}
          </p>
          
          <div className="grid gap-2">
            {recommendations.map(({ resource, score, reasons }, index) => (
              <div
                key={resource.resource_id}
                className="flex items-center gap-3 p-3 bg-background/60 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-background/80 cursor-pointer transition-all group"
                onClick={() => onResourceClick(resource)}
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold">
                  {index + 1}
                </div>
                
                <Avatar className="h-9 w-9">
                  <AvatarImage src={resource.image_url} alt={resource.resource_name} />
                  <AvatarFallback className="text-xs">
                    {resource.resource_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {resource.resource_name}
                    </span>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {resource.role_category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {reasons.slice(0, 3).map((reason, i) => (
                      <span key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                        {i === 0 && <Target className="h-3 w-3" />}
                        {i === 1 && <Clock className="h-3 w-3" />}
                        {i === 2 && <Award className="h-3 w-3" />}
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-bold",
                  getScoreBg(score),
                  getScoreColor(score)
                )}>
                  {Math.round(score)}%
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground mt-2 italic">
            Score combines skill matches, availability, seniority level, and certifications
          </p>
        </div>
      )}
    </div>
  );
}
