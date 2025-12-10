import { ScheduleAssignment } from '@/data/mockScheduleData';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface ScheduleBarProps {
  assignment: ScheduleAssignment;
  left: number;
  width: number;
  cellWidth: number;
}

export function ScheduleBar({ assignment, left, width }: ScheduleBarProps) {
  const isTentative = assignment.status === 'tentative';
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-md cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${
            isTentative ? 'opacity-70 border-2 border-dashed' : ''
          }`}
          style={{
            left: `${left}px`,
            width: `${Math.max(width - 4, 20)}px`,
            backgroundColor: assignment.color,
            borderColor: isTentative ? assignment.color : undefined,
          }}
        >
          <div className="px-2 py-1 overflow-hidden">
            <span className="text-xs font-medium text-white truncate block drop-shadow-sm">
              {assignment.projectName}
            </span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-semibold">{assignment.projectName}</p>
          <p className="text-xs text-muted-foreground">
            {format(assignment.startDate, 'MMM d')} - {format(assignment.endDate, 'MMM d, yyyy')}
          </p>
          <div className="flex items-center gap-1.5">
            <span 
              className={`inline-block w-2 h-2 rounded-full ${
                assignment.status === 'confirmed' ? 'bg-green-500' : 
                assignment.status === 'tentative' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
            <span className="text-xs capitalize">{assignment.status}</span>
          </div>
          {assignment.notes && (
            <p className="text-xs text-muted-foreground">{assignment.notes}</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
