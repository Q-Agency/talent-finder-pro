export interface ScheduleAssignment {
  id: string;
  resourceId: string;
  projectName: string;
  startDate: Date;
  endDate: Date;
  status: 'confirmed' | 'tentative' | 'unavailable';
  color: string;
  notes?: string;
}

export interface ScheduleResource {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
}

// Generate dates relative to today
const today = new Date();
const getDate = (daysOffset: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysOffset);
  return date;
};

export const mockScheduleResources: ScheduleResource[] = [
  { id: '1', name: 'Sarah Chen', role: 'Senior Developer', imageUrl: '' },
  { id: '2', name: 'Marcus Johnson', role: 'UX Designer', imageUrl: '' },
  { id: '3', name: 'Emily Rodriguez', role: 'Project Manager', imageUrl: '' },
  { id: '4', name: 'David Kim', role: 'Backend Developer', imageUrl: '' },
  { id: '5', name: 'Lisa Thompson', role: 'QA Engineer', imageUrl: '' },
  { id: '6', name: 'James Wilson', role: 'DevOps Engineer', imageUrl: '' },
  { id: '7', name: 'Anna Petrov', role: 'Frontend Developer', imageUrl: '' },
  { id: '8', name: 'Michael Brown', role: 'Data Analyst', imageUrl: '' },
  { id: '9', name: 'Sophie Martin', role: 'Tech Lead', imageUrl: '' },
  { id: '10', name: 'Robert Taylor', role: 'Solutions Architect', imageUrl: '' },
];

export const mockAssignments: ScheduleAssignment[] = [
  // Sarah Chen
  { id: 'a1', resourceId: '1', projectName: 'E-commerce Platform', startDate: getDate(-5), endDate: getDate(10), status: 'confirmed', color: '#22c55e' },
  { id: 'a2', resourceId: '1', projectName: 'API Integration', startDate: getDate(12), endDate: getDate(20), status: 'tentative', color: '#eab308' },
  
  // Marcus Johnson
  { id: 'a3', resourceId: '2', projectName: 'Mobile App Redesign', startDate: getDate(-2), endDate: getDate(14), status: 'confirmed', color: '#3b82f6' },
  { id: 'a4', resourceId: '2', projectName: 'Brand Guidelines', startDate: getDate(16), endDate: getDate(25), status: 'confirmed', color: '#8b5cf6' },
  
  // Emily Rodriguez
  { id: 'a5', resourceId: '3', projectName: 'Q4 Planning', startDate: getDate(0), endDate: getDate(5), status: 'confirmed', color: '#ec4899' },
  { id: 'a6', resourceId: '3', projectName: 'Client Onboarding', startDate: getDate(7), endDate: getDate(18), status: 'confirmed', color: '#14b8a6' },
  
  // David Kim
  { id: 'a7', resourceId: '4', projectName: 'Database Migration', startDate: getDate(-10), endDate: getDate(3), status: 'confirmed', color: '#f97316' },
  { id: 'a8', resourceId: '4', projectName: 'Microservices Setup', startDate: getDate(5), endDate: getDate(22), status: 'tentative', color: '#6366f1' },
  
  // Lisa Thompson
  { id: 'a9', resourceId: '5', projectName: 'Release Testing', startDate: getDate(2), endDate: getDate(8), status: 'confirmed', color: '#ef4444' },
  { id: 'a10', resourceId: '5', projectName: 'Automation Framework', startDate: getDate(10), endDate: getDate(28), status: 'confirmed', color: '#84cc16' },
  
  // James Wilson
  { id: 'a11', resourceId: '6', projectName: 'CI/CD Pipeline', startDate: getDate(-3), endDate: getDate(12), status: 'confirmed', color: '#06b6d4' },
  { id: 'a12', resourceId: '6', projectName: 'Infrastructure Audit', startDate: getDate(15), endDate: getDate(19), status: 'tentative', color: '#a855f7' },
  
  // Anna Petrov
  { id: 'a13', resourceId: '7', projectName: 'Dashboard UI', startDate: getDate(1), endDate: getDate(16), status: 'confirmed', color: '#f43f5e' },
  
  // Michael Brown
  { id: 'a14', resourceId: '8', projectName: 'Analytics Report', startDate: getDate(-7), endDate: getDate(2), status: 'confirmed', color: '#10b981' },
  { id: 'a15', resourceId: '8', projectName: 'Data Warehouse', startDate: getDate(4), endDate: getDate(21), status: 'confirmed', color: '#0ea5e9' },
  
  // Sophie Martin
  { id: 'a16', resourceId: '9', projectName: 'Architecture Review', startDate: getDate(0), endDate: getDate(7), status: 'confirmed', color: '#d946ef' },
  { id: 'a17', resourceId: '9', projectName: 'Team Training', startDate: getDate(9), endDate: getDate(11), status: 'confirmed', color: '#fbbf24' },
  
  // Robert Taylor
  { id: 'a18', resourceId: '10', projectName: 'Cloud Migration', startDate: getDate(-8), endDate: getDate(15), status: 'confirmed', color: '#4ade80' },
  { id: 'a19', resourceId: '10', projectName: 'Security Assessment', startDate: getDate(18), endDate: getDate(26), status: 'tentative', color: '#fb923c' },
];

export const projectColors = [
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f97316', '#6366f1', '#ef4444', '#84cc16', '#06b6d4',
  '#a855f7', '#f43f5e', '#10b981', '#0ea5e9', '#d946ef',
  '#fbbf24', '#4ade80', '#fb923c'
];
