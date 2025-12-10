import { useState } from 'react';
import { Link } from 'react-router-dom';
import { addDays, subDays, startOfWeek, format } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, LayoutGrid, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GanttChart } from '@/components/schedule/GanttChart';
import { mockScheduleResources, mockAssignments } from '@/data/mockScheduleData';
import { ThemeToggle } from '@/components/ThemeToggle';

type ViewMode = 'week' | 'month';

export default function Schedule() {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const handlePrevious = () => {
    setCurrentDate(prev => subDays(prev, viewMode === 'week' ? 7 : 14));
  };

  const handleNext = () => {
    setCurrentDate(prev => addDays(prev, viewMode === 'week' ? 7 : 14));
  };

  const handleToday = () => {
    setCurrentDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Hub
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Schedule Timeline
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className="text-xs"
                >
                  2 Weeks
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className="text-xs"
                >
                  Month
                </Button>
              </div>
              
              {/* Date Navigation */}
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleToday} className="px-3">
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="h-6 w-px bg-border" />
              
              {/* Current Date Range */}
              <span className="text-sm text-muted-foreground">
                {format(currentDate, 'MMM d')} - {format(addDays(currentDate, viewMode === 'week' ? 13 : 30), 'MMM d, yyyy')}
              </span>
              
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">{mockScheduleResources.length}</div>
            <div className="text-sm text-muted-foreground">Total Resources</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-green-500">
              {mockAssignments.filter(a => a.status === 'confirmed').length}
            </div>
            <div className="text-sm text-muted-foreground">Confirmed Assignments</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-500">
              {mockAssignments.filter(a => a.status === 'tentative').length}
            </div>
            <div className="text-sm text-muted-foreground">Tentative Assignments</div>
          </div>
        </div>

        {/* Gantt Chart */}
        <GanttChart
          resources={mockScheduleResources}
          assignments={mockAssignments}
          viewMode={viewMode}
          startDate={currentDate}
        />
        
        {/* Legend */}
        <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/10 border-2 border-primary" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted/50" />
            <span>Weekend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-green-500" />
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded border-2 border-dashed border-yellow-500 bg-yellow-500/50" />
            <span>Tentative</span>
          </div>
        </div>
      </main>
    </div>
  );
}
