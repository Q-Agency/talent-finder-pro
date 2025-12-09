import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { refreshDataset } from '@/services/refreshApi';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RefreshDatasetButtonProps {
  isTestMode: boolean;
  onRefreshComplete?: () => void;
}

export function RefreshDatasetButton({ isTestMode, onRefreshComplete }: RefreshDatasetButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshDataset(isTestMode);
      toast.success('Dataset refreshed successfully');
      onRefreshComplete?.();
    } catch (error) {
      console.error('Failed to refresh dataset:', error);
      toast.error('Failed to refresh dataset. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh Data
      </Button>

      <Dialog open={isRefreshing} onOpenChange={() => {}}>
        <DialogContent 
          className="sm:max-w-md" 
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Syncing Data with Ganttic
            </DialogTitle>
            <DialogDescription className="pt-2">
              Please wait while we refresh the dataset. This process may take <strong>10-20 seconds</strong>.
              <br /><br />
              Do not close this window or navigate away.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
                <RefreshCw className="absolute inset-0 m-auto h-8 w-8 text-primary animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">Syncing resources...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
