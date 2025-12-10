import { Assignment } from '@/services/availabilityService';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { differenceInDays, format, max, min, startOfDay, addDays, isWithinInterval } from 'date-fns';

interface MiniTimelineProps {
  resourceId: string;
  assignments: Assignment[];
  rangeStart: Date;
  rangeEnd: Date;
  compact?: boolean;
}

interface DaySegment {
  date: Date;
  isBusy: boolean;
  projectName?: string;
  status?: 'confirmed' | 'tentative' | 'unavailable';
}

export function MiniTimeline({ resourceId, assignments, rangeStart, rangeEnd, compact = false }: MiniTimelineProps) {
  const start = startOfDay(rangeStart);
  const end = startOfDay(rangeEnd);
  const totalDays = differenceInDays(end, start) + 1;
  
  // Build day-by-day segments
  const segments: DaySegment[] = [];
  const resourceAssignments = assignments.filter(a => a.resourceId === resourceId);
  
  for (let i = 0; i < totalDays; i++) {
    const currentDate = addDays(start, i);
    
    // Find if this day is covered by any assignment
    const activeAssignment = resourceAssignments.find(a => 
      isWithinInterval(currentDate, { 
        start: startOfDay(a.startDate), 
        end: startOfDay(a.endDate) 
      })
    );
    
    segments.push({
      date: currentDate,
      isBusy: !!activeAssignment,
      projectName: activeAssignment?.projectName,
      status: activeAssignment?.status,
    });
  }
  
  // Group consecutive days for cleaner rendering
  const groupedSegments: { 
    startIdx: number; 
    endIdx: number; 
    isBusy: boolean; 
    projectName?: string;
    status?: 'confirmed' | 'tentative' | 'unavailable';
  }[] = [];
  
  let currentGroup: typeof groupedSegments[0] | null = null;
  
  segments.forEach((seg, idx) => {
    if (!currentGroup || currentGroup.isBusy !== seg.isBusy || currentGroup.projectName !== seg.projectName) {
      if (currentGroup) groupedSegments.push(currentGroup);
      currentGroup = { 
        startIdx: idx, 
        endIdx: idx, 
        isBusy: seg.isBusy, 
        projectName: seg.projectName,
        status: seg.status 
      };
    } else {
      currentGroup.endIdx = idx;
    }
  });
  if (currentGroup) groupedSegments.push(currentGroup);
  
  const getSegmentColor = (isBusy: boolean, status?: string) => {
    if (!isBusy) return 'bg-emerald-500/70';
    if (status === 'tentative') return 'bg-amber-500/70';
    return 'bg-destructive/70';
  };

  const height = compact ? 'h-1.5' : 'h-2';
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`w-full ${height} bg-muted rounded-full overflow-hidden flex cursor-help`}>
          {groupedSegments.map((group, idx) => {
            const width = ((group.endIdx - group.startIdx + 1) / totalDays) * 100;
            return (
              <div
                key={idx}
                className={`${getSegmentColor(group.isBusy, group.status)} transition-colors`}
                style={{ width: `${width}%` }}
              />
            );
          })}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[250px]">
        <div className="text-xs space-y-1.5">
          <p className="font-medium">
            {format(start, 'MMM d')} - {format(end, 'MMM d, yyyy')}
          </p>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-emerald-500" /> Free
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-destructive" /> Busy
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-amber-500" /> Tentative
            </span>
          </div>
          {groupedSegments.filter(g => g.isBusy).length > 0 && (
            <div className="pt-1 border-t border-border/50 space-y-0.5">
              {groupedSegments.filter(g => g.isBusy).slice(0, 3).map((g, idx) => (
                <p key={idx} className="text-muted-foreground">
                  {g.projectName}: {format(addDays(start, g.startIdx), 'MMM d')} - {format(addDays(start, g.endIdx), 'MMM d')}
                </p>
              ))}
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
