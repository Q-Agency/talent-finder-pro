import { useMemo, useRef } from 'react';
import { addDays, startOfDay } from 'date-fns';
import { TimelineHeader } from './TimelineHeader';
import { ResourceRow } from './ResourceRow';
import { ScheduleResource, ScheduleAssignment } from '@/data/mockScheduleData';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface GanttChartProps {
  resources: ScheduleResource[];
  assignments: ScheduleAssignment[];
  viewMode: 'week' | 'month';
  startDate: Date;
}

export function GanttChart({ resources, assignments, viewMode, startDate }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const cellWidth = viewMode === 'week' ? 60 : 40;
  const daysToShow = viewMode === 'week' ? 14 : 31;
  
  const dates = useMemo(() => {
    const start = startOfDay(startDate);
    return Array.from({ length: daysToShow }, (_, i) => addDays(start, i));
  }, [startDate, daysToShow]);

  const getResourceAssignments = (resourceId: string) => {
    return assignments.filter(a => a.resourceId === resourceId);
  };

  const totalWidth = dates.length * cellWidth;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card" ref={containerRef}>
      <ScrollArea className="w-full">
        <div style={{ minWidth: totalWidth + 224 }}>
          {/* Header */}
          <div className="flex sticky top-0 z-20 bg-card">
            <div className="w-56 flex-shrink-0 px-4 py-3 border-r border-b border-border bg-muted/50 font-medium text-sm sticky left-0 z-30">
              Resources
            </div>
            <TimelineHeader dates={dates} cellWidth={cellWidth} />
          </div>
          
          {/* Resource rows */}
          <div>
            {resources.map(resource => (
              <ResourceRow
                key={resource.id}
                resource={resource}
                assignments={getResourceAssignments(resource.id)}
                dates={dates}
                cellWidth={cellWidth}
              />
            ))}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
