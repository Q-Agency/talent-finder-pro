export type EmploymentType = 'Employee' | 'Contractor' | 'Student';
export type Seniority = 'Senior 1' | 'Senior 2' | 'Mid 1' | 'Mid 2' | 'Junior 1' | 'Junior 2';

export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar: string;
  employmentType: EmploymentType;
  seniority: Seniority;
  roleTitle: string;
  skills: string[];
  industries: string[];
  certificates: string[];
  availability: 'Available' | 'Partially Available' | 'Unavailable';
  location: string;
}

export const roleTitles = [
  'Software Engineer',
  'Product Designer',
  'Data Analyst',
  'Project Manager',
  'DevOps Engineer',
  'UX Researcher',
  'Business Analyst',
  'QA Engineer',
  'Scrum Master',
  'Technical Writer',
];

export const skills = [
  'React',
  'TypeScript',
  'Python',
  'AWS',
  'Figma',
  'SQL',
  'Node.js',
  'Kubernetes',
  'Machine Learning',
  'Agile',
  'Data Analysis',
  'UI/UX Design',
  'Java',
  'Docker',
  'GraphQL',
];

export const industries = [
  'Healthcare',
  'Finance',
  'E-commerce',
  'Education',
  'Manufacturing',
  'Retail',
  'Technology',
  'Energy',
  'Telecommunications',
  'Automotive',
];

export const certificates = [
  'AWS Solutions Architect',
  'PMP',
  'Scrum Master',
  'Google Cloud Professional',
  'Azure Administrator',
  'CISSP',
  'Six Sigma',
  'TOGAF',
  'Kubernetes Administrator',
  'Data Science Certificate',
];

export const employmentTypes: EmploymentType[] = ['Employee', 'Contractor', 'Student'];
export const seniorities: Seniority[] = ['Senior 1', 'Senior 2', 'Mid 1', 'Mid 2', 'Junior 1', 'Junior 2'];

const avatars = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
];

const names = [
  'Alex Johnson', 'Sarah Chen', 'Michael Brown', 'Emily Davis',
  'James Wilson', 'Lisa Anderson', 'David Martinez', 'Jennifer Taylor',
  'Robert Garcia', 'Amanda White', 'Chris Lee', 'Rachel Kim',
  'Daniel Thompson', 'Jessica Harris', 'Kevin Robinson', 'Nicole Clark',
];

const locations = [
  'New York, US', 'London, UK', 'Berlin, DE', 'Toronto, CA',
  'Sydney, AU', 'Singapore, SG', 'Amsterdam, NL', 'Dublin, IE',
];

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const mockEmployees: Employee[] = names.map((name, index) => ({
  id: `emp-${index + 1}`,
  name,
  email: `${name.toLowerCase().replace(' ', '.')}@company.com`,
  avatar: avatars[index % avatars.length],
  employmentType: getRandomItem(employmentTypes),
  seniority: getRandomItem(seniorities),
  roleTitle: getRandomItem(roleTitles),
  skills: getRandomItems(skills, Math.floor(Math.random() * 4) + 2),
  industries: getRandomItems(industries, Math.floor(Math.random() * 3) + 1),
  certificates: getRandomItems(certificates, Math.floor(Math.random() * 3)),
  availability: getRandomItem(['Available', 'Partially Available', 'Unavailable'] as const),
  location: getRandomItem(locations),
}));
