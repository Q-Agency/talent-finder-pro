import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { refreshDataset } from '@/services/refreshApi';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const LAST_SYNC_KEY = 'ganttic_last_sync';

interface RefreshDatasetButtonProps {
  isTestMode: boolean;
  onRefreshComplete?: () => void;
}

export function RefreshDatasetButton({ isTestMode, onRefreshComplete }: RefreshDatasetButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(LAST_SYNC_KEY);
    if (stored) {
      setLastSync(new Date(stored));
    }
  }, []);

  const handleRefresh = async () => {
    setShowConfirm(false);
    setIsRefreshing(true);
    try {
      await refreshDataset(isTestMode);
      const now = new Date();
      localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
      setLastSync(now);
      toast.success('Dataset synced successfully');
      onRefreshComplete?.();
    } catch (error) {
      console.error('Failed to sync dataset:', error);
      toast.error('Failed to sync dataset. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastSync = () => {
    if (!lastSync) return null;
    return formatDistanceToNow(lastSync, { addSuffix: true });
  };

  return (
    <div className="flex items-center gap-2">
      {lastSync && (
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Synced {formatLastSync()}
        </span>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(true)}
        disabled={isRefreshing}
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Sync Ganttic
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sync with Ganttic?</DialogTitle>
            <DialogDescription>
              This will refresh the dataset from Ganttic. The process may take <strong>10-20 seconds</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefresh}>
              Sync Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loading Dialog */}
      <Dialog open={isRefreshing} onOpenChange={() => {}}>
        <DialogContent 
          className="sm:max-w-md" 
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Syncing with Ganttic
            </DialogTitle>
            <DialogDescription className="pt-2">
              Please wait while we refresh the dataset. This may take <strong>10-20 seconds</strong>.
              <br /><br />
              Do not close this window or navigate away.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
