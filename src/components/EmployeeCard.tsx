import { Employee } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Mail, Award } from 'lucide-react';

interface EmployeeCardProps {
  employee: Employee;
}

const getEmploymentBadgeClass = (type: string) => {
  switch (type) {
    case 'Employee':
      return 'bg-badge-employee/10 text-badge-employee border-badge-employee/20';
    case 'Contractor':
      return 'bg-badge-contractor/10 text-badge-contractor border-badge-contractor/20';
    case 'Student':
      return 'bg-badge-student/10 text-badge-student border-badge-student/20';
    default:
      return '';
  }
};

const getSeniorityBadgeClass = (seniority: string) => {
  if (seniority.includes('Senior')) {
    return 'bg-badge-senior/10 text-badge-senior border-badge-senior/20';
  }
  if (seniority.includes('Mid')) {
    return 'bg-badge-mid/10 text-badge-mid border-badge-mid/20';
  }
  return 'bg-badge-junior/10 text-badge-junior border-badge-junior/20';
};

const getAvailabilityClass = (availability: string) => {
  switch (availability) {
    case 'Available':
      return 'bg-emerald-500';
    case 'Partially Available':
      return 'bg-amber-500';
    case 'Unavailable':
      return 'bg-red-500';
    default:
      return 'bg-muted';
  }
};

export function EmployeeCard({ employee }: EmployeeCardProps) {
  return (
    <Card className="group shadow-card hover:shadow-card-hover transition-all duration-200 animate-fade-in border-border/50 hover:border-primary/20">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-14 w-14 ring-2 ring-background shadow-sm">
              <AvatarImage src={employee.avatar} alt={employee.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full ring-2 ring-card ${getAvailabilityClass(employee.availability)}`}
              title={employee.availability}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground truncate">{employee.name}</h3>
                <p className="text-sm text-primary font-medium">{employee.roleTitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {employee.location}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {employee.email.split('@')[0]}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-4">
          <Badge variant="outline" className={`text-xs font-medium ${getEmploymentBadgeClass(employee.employmentType)}`}>
            {employee.employmentType}
          </Badge>
          <Badge variant="outline" className={`text-xs font-medium ${getSeniorityBadgeClass(employee.seniority)}`}>
            {employee.seniority}
          </Badge>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Skills</p>
          <div className="flex flex-wrap gap-1">
            {employee.skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs font-normal">
                {skill}
              </Badge>
            ))}
            {employee.skills.length > 4 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{employee.skills.length - 4}
              </Badge>
            )}
          </div>
        </div>

        {employee.certificates.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Award className="h-3 w-3" />
              <span>{employee.certificates.slice(0, 2).join(', ')}</span>
              {employee.certificates.length > 2 && (
                <span className="text-primary">+{employee.certificates.length - 2} more</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
