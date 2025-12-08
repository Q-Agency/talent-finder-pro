import { useState, useMemo } from 'react';
import { FilterSidebar, Filters } from '@/components/FilterSidebar';
import { SearchHeader } from '@/components/SearchHeader';
import { EmployeeGrid } from '@/components/EmployeeGrid';
import { mockEmployees, Employee } from '@/data/mockData';
import { ScrollArea } from '@/components/ui/scroll-area';

const initialFilters: Filters = {
  employmentTypes: [],
  seniorities: [],
  roleTitles: [],
  skills: [],
  industries: [],
  certificates: [],
};

const Index = () => {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = useMemo(() => {
    return mockEmployees.filter((employee: Employee) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          employee.name.toLowerCase().includes(query) ||
          employee.roleTitle.toLowerCase().includes(query) ||
          employee.skills.some((skill) => skill.toLowerCase().includes(query)) ||
          employee.email.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Employment type filter
      if (filters.employmentTypes.length > 0) {
        if (!filters.employmentTypes.includes(employee.employmentType)) return false;
      }

      // Seniority filter
      if (filters.seniorities.length > 0) {
        if (!filters.seniorities.includes(employee.seniority)) return false;
      }

      // Role title filter
      if (filters.roleTitles.length > 0) {
        if (!filters.roleTitles.includes(employee.roleTitle)) return false;
      }

      // Skills filter (matches if employee has ANY of the selected skills)
      if (filters.skills.length > 0) {
        if (!filters.skills.some((skill) => employee.skills.includes(skill))) return false;
      }

      // Industries filter
      if (filters.industries.length > 0) {
        if (!filters.industries.some((industry) => employee.industries.includes(industry))) return false;
      }

      // Certificates filter
      if (filters.certificates.length > 0) {
        if (!filters.certificates.some((cert) => employee.certificates.includes(cert))) return false;
      }

      return true;
    });
  }, [filters, searchQuery]);

  return (
    <div className="flex h-screen bg-background">
      <FilterSidebar
        filters={filters}
        onFilterChange={setFilters}
        resultCount={filteredEmployees.length}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <SearchHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <ScrollArea className="flex-1 scrollbar-thin">
          <main className="p-6">
            <EmployeeGrid employees={filteredEmployees} />
          </main>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Index;
