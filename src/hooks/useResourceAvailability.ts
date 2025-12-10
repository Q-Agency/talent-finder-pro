import { useMemo } from 'react';
import { calculateBulkAvailability, AvailabilityResult, Assignment } from '@/services/availabilityService';
import { getAssignmentsForResources } from '@/data/mockResourceSchedule';

interface UseResourceAvailabilityOptions {
  resourceIds: string[];
  dateRange: { start: Date; end: Date } | null;
  enabled?: boolean;
}

interface UseResourceAvailabilityReturn {
  availability: Map<string, AvailabilityResult>;
  assignments: Assignment[];
  isCalculating: boolean;
}

/**
 * Hook to calculate availability for multiple resources
 * 
 * To connect to real data later:
 * 1. Replace getAssignmentsForResources() with an API call (useQuery)
 * 2. Add loading state from the API call
 */
export function useResourceAvailability({
  resourceIds,
  dateRange,
  enabled = true,
}: UseResourceAvailabilityOptions): UseResourceAvailabilityReturn {
  // Generate mock assignments for the actual resource IDs (replace with API data later)
  const assignments = useMemo(
    () => getAssignmentsForResources(resourceIds),
    [resourceIds]
  );

  const availability = useMemo(() => {
    if (!enabled || !dateRange || resourceIds.length === 0) {
      return new Map<string, AvailabilityResult>();
    }

    return calculateBulkAvailability(
      resourceIds,
      assignments,
      dateRange.start,
      dateRange.end
    );
  }, [resourceIds, dateRange, enabled, assignments]);

  return {
    availability,
    assignments,
    isCalculating: false, // Will be true when using async API
  };
}

/**
 * Get availability color based on percentage
 */
export function getAvailabilityColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-500';
  if (percentage >= 50) return 'text-yellow-500';
  if (percentage >= 20) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Get availability background color for badges
 */
export function getAvailabilityBgColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-500/10 text-green-600 border-green-500/20';
  if (percentage >= 50) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
  if (percentage >= 20) return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
  return 'bg-red-500/10 text-red-600 border-red-500/20';
}
