import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FlaskConical, Rocket } from 'lucide-react';

interface ApiModeToggleProps {
  isTestMode: boolean;
  onToggle: (isTest: boolean) => void;
}

export function ApiModeToggle({ isTestMode, onToggle }: ApiModeToggleProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg border border-border">
      <div className="flex items-center gap-2">
        {isTestMode ? (
          <FlaskConical className="h-4 w-4 text-amber-500" />
        ) : (
          <Rocket className="h-4 w-4 text-emerald-500" />
        )}
        <Label htmlFor="api-mode" className="text-sm font-medium cursor-pointer">
          {isTestMode ? 'Test Mode' : 'Production'}
        </Label>
      </div>
      <Switch
        id="api-mode"
        checked={!isTestMode}
        onCheckedChange={(checked) => onToggle(!checked)}
      />
    </div>
  );
}
