import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

export type SortOption = 'name-asc' | 'name-desc' | 'seniority' | 'employment';

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px] h-9 text-sm">
        <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
        <SelectItem value="seniority">Seniority</SelectItem>
        <SelectItem value="employment">Employment Type</SelectItem>
      </SelectContent>
    </Select>
  );
}
