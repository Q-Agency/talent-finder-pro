import { format, isSameDay } from 'date-fns';

interface TimelineHeaderProps {
  dates: Date[];
  cellWidth: number;
}

export function TimelineHeader({ dates, cellWidth }: TimelineHeaderProps) {
  const today = new Date();
  
  return (
    <div className="flex border-b border-border bg-muted/30">
      {dates.map((date, index) => {
        const isToday = isSameDay(date, today);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        return (
          <div
            key={index}
            className={`flex-shrink-0 text-center py-2 border-r border-border/50 ${
              isToday ? 'bg-primary/10' : isWeekend ? 'bg-muted/50' : ''
            }`}
            style={{ width: cellWidth }}
          >
            <div className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
              {format(date, 'EEE')}
            </div>
            <div className={`text-sm font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>
              {format(date, 'd')}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {format(date, 'MMM')}
            </div>
          </div>
        );
      })}
    </div>
  );
}
