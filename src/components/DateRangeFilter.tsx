import { useState } from 'react';
import { format, addDays, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon, X, Percent } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface DateRangeFilterProps {
  value: { start: Date; end: Date } | null;
  onChange: (range: { start: Date; end: Date } | null) => void;
  minAvailability: number;
  onMinAvailabilityChange: (value: number) => void;
  className?: string;
}

export function DateRangeFilter({ 
  value, 
  onChange, 
  minAvailability, 
  onMinAvailabilityChange,
  className 
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onChange({
        start: startOfDay(range.from),
        end: startOfDay(range.to),
      });
      setOpen(false);
    } else if (range?.from) {
      // Single date selected, treat as start of range
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    onMinAvailabilityChange(0);
  };

  const handleQuickSelect = (days: number) => {
    const start = startOfDay(new Date());
    const end = startOfDay(addDays(start, days - 1));
    onChange({ start, end });
    setOpen(false);
  };

  const selected: DateRange | undefined = value
    ? { from: value.start, to: value.end }
    : undefined;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'justify-start text-left font-normal gap-2',
              !value && 'text-muted-foreground',
              value && 'border-primary/50 bg-primary/5'
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            {value ? (
              <span className="text-sm">
                {format(value.start, 'MMM d')} - {format(value.end, 'MMM d, yyyy')}
              </span>
            ) : (
              <span className="text-sm">Check Availability</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b border-border">
            <p className="text-sm font-medium mb-2">Quick Select</p>
            <div className="flex flex-wrap gap-1">
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleQuickSelect(7)}
              >
                Next 7 days
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleQuickSelect(14)}
              >
                Next 2 weeks
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleQuickSelect(30)}
              >
                Next 30 days
              </Badge>
            </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.start || new Date()}
            selected={selected}
            onSelect={handleSelect}
            numberOfMonths={2}
            className={cn('p-3 pointer-events-auto')}
          />
        </PopoverContent>
      </Popover>

      {value && (
        <>
          <div className="flex items-center gap-2 px-2 py-1 rounded-md border border-border bg-muted/30">
            <Percent className="h-3.5 w-3.5 text-muted-foreground" />
            <Slider
              value={[minAvailability]}
              onValueChange={([val]) => onMinAvailabilityChange(val)}
              max={100}
              step={5}
              className="w-24"
            />
            <span className="text-xs font-medium w-8 text-right">
              {minAvailability > 0 ? `≥${minAvailability}%` : 'Any'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
