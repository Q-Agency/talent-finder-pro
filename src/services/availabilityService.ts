import { differenceInDays, isWithinInterval, max, min, startOfDay, addDays } from 'date-fns';

export interface Assignment {
  id: string;
  resourceId: string;
  projectName: string;
  startDate: Date;
  endDate: Date;
  status: 'confirmed' | 'tentative' | 'unavailable';
}

export interface AvailabilityResult {
  resourceId: string;
  percentage: number; // 0-100, free days in range
  busyDays: number;
  totalDays: number;
  // Gap-aware metrics
  nextAvailableDate: Date | null; // When current project ends
  gapAfterCurrent: number; // Days until next assignment after current project ends
  hasUpcomingAssignment: boolean;
  currentProject: string | null;
  nextProject: string | null;
}

/**
 * Calculate availability for a single resource in a date range
 */
export function calculateResourceAvailability(
  resourceId: string,
  assignments: Assignment[],
  rangeStart: Date,
  rangeEnd: Date
): AvailabilityResult {
  const start = startOfDay(rangeStart);
  const end = startOfDay(rangeEnd);
  const totalDays = differenceInDays(end, start) + 1;
  
  const resourceAssignments = assignments
    .filter(a => a.resourceId === resourceId)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  // Calculate busy days (count days that overlap with any assignment)
  const busyDaysSet = new Set<string>();
  
  for (const assignment of resourceAssignments) {
    const assignStart = max([startOfDay(assignment.startDate), start]);
    const assignEnd = min([startOfDay(assignment.endDate), end]);
    
    if (assignStart <= assignEnd) {
      let current = assignStart;
      while (current <= assignEnd) {
        busyDaysSet.add(current.toISOString());
        current = addDays(current, 1);
      }
    }
  }

  const busyDays = busyDaysSet.size;
  const freeDays = totalDays - busyDays;
  const percentage = Math.round((freeDays / totalDays) * 100);

  // Gap-aware: Find current project and next available date
  const today = startOfDay(new Date());
  let currentProject: string | null = null;
  let nextAvailableDate: Date | null = null;
  let nextProject: string | null = null;
  let gapAfterCurrent = 0;

  // Find current active assignment
  const currentAssignment = resourceAssignments.find(a => 
    isWithinInterval(today, { start: startOfDay(a.startDate), end: startOfDay(a.endDate) })
  );

  if (currentAssignment) {
    currentProject = currentAssignment.projectName;
    nextAvailableDate = addDays(startOfDay(currentAssignment.endDate), 1);
    
    // Find next assignment after current ends
    const futureAssignments = resourceAssignments.filter(a => 
      startOfDay(a.startDate) > startOfDay(currentAssignment.endDate)
    );
    
    if (futureAssignments.length > 0) {
      const nextAssignment = futureAssignments[0];
      nextProject = nextAssignment.projectName;
      gapAfterCurrent = differenceInDays(startOfDay(nextAssignment.startDate), nextAvailableDate);
    } else {
      gapAfterCurrent = -1; // No next assignment, fully available after current
    }
  } else {
    // Not currently assigned, find next future assignment
    const futureAssignments = resourceAssignments.filter(a => 
      startOfDay(a.startDate) > today
    );
    
    if (futureAssignments.length > 0) {
      nextProject = futureAssignments[0].projectName;
      gapAfterCurrent = differenceInDays(startOfDay(futureAssignments[0].startDate), today);
    }
    nextAvailableDate = today;
  }

  return {
    resourceId,
    percentage,
    busyDays,
    totalDays,
    nextAvailableDate,
    gapAfterCurrent,
    hasUpcomingAssignment: nextProject !== null,
    currentProject,
    nextProject,
  };
}

/**
 * Calculate availability for multiple resources
 */
export function calculateBulkAvailability(
  resourceIds: string[],
  assignments: Assignment[],
  rangeStart: Date,
  rangeEnd: Date
): Map<string, AvailabilityResult> {
  const results = new Map<string, AvailabilityResult>();
  
  for (const resourceId of resourceIds) {
    results.set(resourceId, calculateResourceAvailability(resourceId, assignments, rangeStart, rangeEnd));
  }
  
  return results;
}

/**
 * Sort resources by availability (most available first)
 */
export function sortByAvailability(
  availability: Map<string, AvailabilityResult>,
  resourceIds: string[]
): string[] {
  return [...resourceIds].sort((a, b) => {
    const availA = availability.get(a);
    const availB = availability.get(b);
    if (!availA || !availB) return 0;
    
    // Primary: Higher percentage first
    if (availB.percentage !== availA.percentage) {
      return availB.percentage - availA.percentage;
    }
    
    // Secondary: Larger gap after current project (more flexible scheduling)
    return availB.gapAfterCurrent - availA.gapAfterCurrent;
  });
}
