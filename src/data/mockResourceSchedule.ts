import { Assignment } from '@/services/availabilityService';

// Helper to create dates relative to today
const today = new Date();
const getDate = (daysOffset: number): Date => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysOffset);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Mock assignments that map to resource IDs from the API
 * Resource IDs should match the `resource_id` field from the real API
 * 
 * To connect to real data later:
 * 1. Replace this file's export with an API call
 * 2. Or fetch from Ganttic API and transform to this shape
 */
export const mockResourceAssignments: Assignment[] = [
  // Simulating assignments for various resource IDs
  // These IDs will need to match your actual API resource IDs
  
  // Resource fully booked for next 2 weeks
  { id: 'a1', resourceId: 'res-001', projectName: 'E-commerce Platform', startDate: getDate(-5), endDate: getDate(10), status: 'confirmed' },
  { id: 'a2', resourceId: 'res-001', projectName: 'API Integration', startDate: getDate(12), endDate: getDate(25), status: 'tentative' },
  
  // Resource with gap next week
  { id: 'a3', resourceId: 'res-002', projectName: 'Mobile App Redesign', startDate: getDate(-10), endDate: getDate(3), status: 'confirmed' },
  { id: 'a4', resourceId: 'res-002', projectName: 'Brand Guidelines', startDate: getDate(15), endDate: getDate(28), status: 'confirmed' },
  
  // Resource currently free, has assignment in future
  { id: 'a5', resourceId: 'res-003', projectName: 'Q4 Planning', startDate: getDate(7), endDate: getDate(14), status: 'confirmed' },
  
  // Resource with short assignment this week
  { id: 'a6', resourceId: 'res-004', projectName: 'Database Migration', startDate: getDate(0), endDate: getDate(4), status: 'confirmed' },
  { id: 'a7', resourceId: 'res-004', projectName: 'Security Audit', startDate: getDate(20), endDate: getDate(30), status: 'tentative' },
  
  // Resource fully available (no assignments)
  // res-005 has no entries = 100% available
  
  // Resource with overlapping tentative assignments
  { id: 'a8', resourceId: 'res-006', projectName: 'Cloud Migration', startDate: getDate(-3), endDate: getDate(8), status: 'confirmed' },
  { id: 'a9', resourceId: 'res-006', projectName: 'Infrastructure Review', startDate: getDate(6), endDate: getDate(12), status: 'tentative' },
  
  // Resource with back-to-back projects (no gaps)
  { id: 'a10', resourceId: 'res-007', projectName: 'Frontend Build', startDate: getDate(-7), endDate: getDate(5), status: 'confirmed' },
  { id: 'a11', resourceId: 'res-007', projectName: 'Testing Phase', startDate: getDate(6), endDate: getDate(15), status: 'confirmed' },
  { id: 'a12', resourceId: 'res-007', projectName: 'Deployment', startDate: getDate(16), endDate: getDate(20), status: 'confirmed' },
  
  // Resource mostly free with small assignment
  { id: 'a13', resourceId: 'res-008', projectName: 'Training Session', startDate: getDate(10), endDate: getDate(11), status: 'confirmed' },
  
  // Add some assignments for numeric IDs (common in APIs)
  { id: 'a14', resourceId: '1', projectName: 'Project Alpha', startDate: getDate(-2), endDate: getDate(7), status: 'confirmed' },
  { id: 'a15', resourceId: '2', projectName: 'Project Beta', startDate: getDate(0), endDate: getDate(14), status: 'confirmed' },
  { id: 'a16', resourceId: '3', projectName: 'Project Gamma', startDate: getDate(5), endDate: getDate(18), status: 'tentative' },
  { id: 'a17', resourceId: '4', projectName: 'Project Delta', startDate: getDate(-5), endDate: getDate(2), status: 'confirmed' },
  { id: 'a18', resourceId: '4', projectName: 'Project Epsilon', startDate: getDate(10), endDate: getDate(22), status: 'tentative' },
];

/**
 * Get assignments for a specific resource
 * This function can be replaced with an API call later
 */
export function getAssignmentsForResource(resourceId: string): Assignment[] {
  return mockResourceAssignments.filter(a => a.resourceId === resourceId);
}

/**
 * Get all assignments
 * Replace this with API fetch when connecting to real data
 */
export function getAllAssignments(): Assignment[] {
  return mockResourceAssignments;
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
  'Project Alpha': '#f43f5e',
  'Project Beta': '#10b981',
  'Project Gamma': '#0ea5e9',
  'Project Delta': '#d946ef',
  'Project Epsilon': '#fb923c',
};
