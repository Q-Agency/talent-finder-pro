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
      {isTestMode ? (
        <FlaskConical className="h-4 w-4 text-amber-500" />
      ) : (
        <Rocket className="h-4 w-4 text-emerald-500" />
      )}
      <Switch
        id="api-mode"
        checked={!isTestMode}
        onCheckedChange={(checked) => onToggle(!checked)}
      />
    </div>
  );
}
