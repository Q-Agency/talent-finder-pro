import { Assignment } from '@/services/availabilityService';

// Helper to create dates relative to today
const today = new Date();
const getDate = (daysOffset: number): Date => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysOffset);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Project templates for generating realistic assignments
const projectTemplates = [
  'E-commerce Platform', 'API Integration', 'Mobile App Redesign', 'Brand Guidelines',
  'Q4 Planning', 'Database Migration', 'Security Audit', 'Cloud Migration',
  'Infrastructure Review', 'Frontend Build', 'Testing Phase', 'Deployment',
  'Training Session', 'Client Workshop', 'Data Analytics', 'Performance Optimization',
  'UX Research', 'Backend Refactor', 'DevOps Setup', 'Documentation Sprint'
];

// Seeded random for consistent results per resource ID
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

/**
 * Generate mock assignments for a resource based on their ID
 * Uses seeded randomness so the same resource always gets the same schedule
 */
function generateAssignmentsForResource(resourceId: string): Assignment[] {
  const random = seededRandom(resourceId);
  const assignments: Assignment[] = [];
  
  // Decide resource availability pattern (0-3 assignments)
  const numAssignments = Math.floor(random() * 4);
  
  if (numAssignments === 0) return []; // Fully available
  
  // Generate assignments
  let lastEndDay = -15; // Start from 2 weeks ago
  
  for (let i = 0; i < numAssignments; i++) {
    const gapDays = Math.floor(random() * 10); // 0-9 day gap
    const startDay = lastEndDay + gapDays + 1;
    const duration = Math.floor(random() * 14) + 3; // 3-16 days
    const endDay = startDay + duration;
    
    // Only include if within relevant range (-30 to +60 days)
    if (endDay >= -30 && startDay <= 60) {
      const projectIdx = Math.floor(random() * projectTemplates.length);
      const statusRoll = random();
      
      assignments.push({
        id: `${resourceId}-${i}`,
        resourceId,
        projectName: projectTemplates[projectIdx],
        startDate: getDate(startDay),
        endDate: getDate(endDay),
        status: statusRoll < 0.7 ? 'confirmed' : 'tentative',
      });
    }
    
    lastEndDay = endDay;
  }
  
  return assignments;
}

// Cache for generated assignments
const assignmentCache = new Map<string, Assignment[]>();

/**
 * Get assignments for a specific resource
 * Generates on-demand and caches for consistency
 */
export function getAssignmentsForResource(resourceId: string): Assignment[] {
  if (!assignmentCache.has(resourceId)) {
    assignmentCache.set(resourceId, generateAssignmentsForResource(resourceId));
  }
  return assignmentCache.get(resourceId)!;
}

/**
 * Get all assignments for a list of resource IDs
 * This is the main function to use - pass in your actual resource IDs
 */
export function getAssignmentsForResources(resourceIds: string[]): Assignment[] {
  return resourceIds.flatMap(id => getAssignmentsForResource(id));
}

/**
 * Get all cached assignments
 * For backwards compatibility - but prefer getAssignmentsForResources
 */
export function getAllAssignments(): Assignment[] {
  return Array.from(assignmentCache.values()).flat();
}

/**
 * Clear the cache (useful for testing or forcing regeneration)
 */
export function clearAssignmentCache(): void {
  assignmentCache.clear();
}

// Project colors for visual consistency
export const projectColors: Record<string, string> = {
  'E-commerce Platform': '#22c55e',
  'API Integration': '#eab308',
  'Mobile App Redesign': '#3b82f6',
  'Brand Guidelines': '#8b5cf6',
  'Q4 Planning': '#ec4899',
  'Database Migration': '#f97316',
  'Security Audit': '#6366f1',
  'Cloud Migration': '#14b8a6',
  'Infrastructure Review': '#a855f7',
  'Frontend Build': '#ef4444',
  'Testing Phase': '#84cc16',
  'Deployment': '#06b6d4',
  'Training Session': '#fbbf24',
  'Client Workshop': '#f43f5e',
  'Data Analytics': '#10b981',
  'Performance Optimization': '#0ea5e9',
  'UX Research': '#d946ef',
  'Backend Refactor': '#fb923c',
  'DevOps Setup': '#64748b',
  'Documentation Sprint': '#78716c',
};
