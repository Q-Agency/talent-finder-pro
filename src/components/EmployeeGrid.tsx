import { Employee } from '@/data/mockData';
import { EmployeeCard } from './EmployeeCard';
import { Users } from 'lucide-react';

interface EmployeeGridProps {
  employees: Employee[];
}

export function EmployeeGrid({ employees }: EmployeeGridProps) {
  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">No resources found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Try adjusting your filters or search query to find the right talent.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {employees.map((employee) => (
        <EmployeeCard key={employee.id} employee={employee} />
      ))}
    </div>
  );
}
