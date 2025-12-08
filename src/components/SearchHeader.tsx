import { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  children?: ReactNode;
}

export function SearchHeader({ searchQuery, onSearchChange, children }: SearchHeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Resourcing Hub</h1>
            <p className="text-sm text-muted-foreground">Find the right talent for your project</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {children}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, role, or skill..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-background border-border focus:ring-primary/20"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
