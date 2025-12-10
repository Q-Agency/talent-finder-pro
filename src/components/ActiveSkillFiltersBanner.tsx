import { X } from 'lucide-react';
import { SkillFilter } from '@/components/FilterSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ActiveSkillFiltersBannerProps {
  skillFilters: SkillFilter[];
  onRemoveSkill: (skill: string) => void;
  onToggleLevel: (skill: string, level: 'senior' | 'mid' | 'junior') => void;
  onClearAll: () => void;
}

const levelLabels: Record<string, string> = {
  senior: 'S',
  mid: 'M',
  junior: 'J',
};

const levelColors: Record<string, string> = {
  senior: 'bg-badge-senior text-white',
  mid: 'bg-badge-mid text-white',
  junior: 'bg-badge-junior text-white',
};

const levelColorsInactive = 'bg-muted text-muted-foreground';

export function ActiveSkillFiltersBanner({
  skillFilters,
  onRemoveSkill,
  onToggleLevel,
  onClearAll,
}: ActiveSkillFiltersBannerProps) {
  if (skillFilters.length === 0) return null;

  return (
    <div className="bg-card/50 border border-border/50 rounded-lg p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Active Skill Filters
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skillFilters.map(({ skill, levels }) => (
          <div
            key={skill}
            className="flex items-center gap-1 bg-background/80 border border-border rounded-md px-2 py-1"
          >
            <span className="text-sm font-medium mr-1">{skill}</span>
            <div className="flex gap-0.5">
              {(['senior', 'mid', 'junior'] as const).map((level) => {
                const isActive = levels.includes(level);
                return (
                  <button
                    key={level}
                    onClick={() => onToggleLevel(skill, level)}
                    className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center transition-colors ${
                      isActive ? levelColors[level] : levelColorsInactive
                    }`}
                    title={`${level.charAt(0).toUpperCase() + level.slice(1)} level`}
                  >
                    {levelLabels[level]}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => onRemoveSkill(skill)}
              className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
