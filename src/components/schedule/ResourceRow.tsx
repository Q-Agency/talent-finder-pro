import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScheduleResource, ScheduleAssignment } from '@/data/mockScheduleData';
import { ScheduleBar } from './ScheduleBar';
import { differenceInDays, isSameDay } from 'date-fns';

interface ResourceRowProps {
  resource: ScheduleResource;
  assignments: ScheduleAssignment[];
  dates: Date[];
  cellWidth: number;
}

export function ResourceRow({ resource, assignments, dates, cellWidth }: ResourceRowProps) {
  const today = new Date();
  const startDate = dates[0];
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const calculateBarPosition = (assignment: ScheduleAssignment) => {
    const assignmentStart = assignment.startDate;
    const assignmentEnd = assignment.endDate;
    
    const startOffset = differenceInDays(assignmentStart, startDate);
    const duration = differenceInDays(assignmentEnd, assignmentStart) + 1;
    
    const left = Math.max(0, startOffset * cellWidth);
    const width = duration * cellWidth;
    
    // Only show if the bar is within visible range
    const endOffset = startOffset + duration;
    if (endOffset < 0 || startOffset > dates.length) return null;
    
    return { left, width };
  };

  return (
    <div className="flex border-b border-border/50 hover:bg-muted/20 transition-colors">
      {/* Resource info - fixed left column */}
      <div className="w-56 flex-shrink-0 flex items-center gap-3 px-4 py-3 border-r border-border bg-background sticky left-0 z-10">
        <Avatar className="h-9 w-9">
          <AvatarImage src={resource.imageUrl} alt={resource.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {getInitials(resource.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{resource.name}</p>
          <p className="text-xs text-muted-foreground truncate">{resource.role}</p>
        </div>
      </div>
      
      {/* Timeline area */}
      <div className="flex-1 relative h-14">
        {/* Grid background */}
        <div className="absolute inset-0 flex">
          {dates.map((date, index) => {
            const isToday = isSameDay(date, today);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            return (
              <div
                key={index}
                className={`flex-shrink-0 border-r border-border/30 ${
                  isToday ? 'bg-primary/5' : isWeekend ? 'bg-muted/30' : ''
                }`}
                style={{ width: cellWidth }}
              />
            );
          })}
        </div>
        
        {/* Today marker */}
        {dates.some(d => isSameDay(d, today)) && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-primary z-20"
            style={{ 
              left: `${differenceInDays(today, startDate) * cellWidth + cellWidth / 2}px` 
            }}
          />
        )}
        
        {/* Assignment bars */}
        {assignments.map(assignment => {
          const position = calculateBarPosition(assignment);
          if (!position) return null;
          
          return (
            <ScheduleBar
              key={assignment.id}
              assignment={assignment}
              left={position.left}
              width={position.width}
              cellWidth={cellWidth}
            />
          );
        })}
      </div>
    </div>
  );
}
