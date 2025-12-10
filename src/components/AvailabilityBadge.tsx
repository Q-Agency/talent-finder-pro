import { AvailabilityResult } from '@/services/availabilityService';
import { getAvailabilityBgColor } from '@/hooks/useResourceAvailability';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface AvailabilityBadgeProps {
  availability: AvailabilityResult;
  compact?: boolean;
}

export function AvailabilityBadge({ availability, compact = false }: AvailabilityBadgeProps) {
  const { percentage, currentProject, nextProject, nextAvailableDate, gapAfterCurrent, totalDays, busyDays } = availability;

  const tooltipContent = (
    <div className="space-y-2 text-xs max-w-[220px]">
      <div className="font-medium text-sm">
        {percentage}% Available ({totalDays - busyDays}/{totalDays} days free)
      </div>
      
      {currentProject && (
        <div className="flex items-start gap-2">
          <Clock className="h-3 w-3 mt-0.5 text-muted-foreground" />
          <div>
            <span className="text-muted-foreground">Currently on: </span>
            <span className="font-medium">{currentProject}</span>
          </div>
        </div>
      )}
      
      {nextAvailableDate && (
        <div className="flex items-start gap-2">
          <Calendar className="h-3 w-3 mt-0.5 text-muted-foreground" />
          <div>
            <span className="text-muted-foreground">Available from: </span>
            <span className="font-medium">{format(nextAvailableDate, 'MMM d')}</span>
          </div>
        </div>
      )}
      
      {nextProject && (
        <div className="flex items-start gap-2">
          <ArrowRight className="h-3 w-3 mt-0.5 text-muted-foreground" />
          <div>
            <span className="text-muted-foreground">Next: </span>
            <span className="font-medium">{nextProject}</span>
            {gapAfterCurrent > 0 && (
              <span className="text-muted-foreground"> (in {gapAfterCurrent} days)</span>
            )}
          </div>
        </div>
      )}
      
      {!currentProject && !nextProject && (
        <div className="text-green-600 font-medium">Fully available in selected range</div>
      )}
    </div>
  );

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`text-[10px] px-1.5 py-0 h-5 border cursor-help ${getAvailabilityBgColor(percentage)}`}
          >
            {percentage}%
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className={`text-xs font-semibold cursor-help ${getAvailabilityBgColor(percentage)}`}
        >
          <Calendar className="h-3 w-3 mr-1" />
          {percentage}% Free
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top">
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
}
