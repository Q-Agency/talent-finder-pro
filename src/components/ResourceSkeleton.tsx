import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ResourceCardSkeleton() {
  return (
    <Card className="shadow-card border-border/50 animate-pulse">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3 mt-2" />
          </div>
        </div>

        <div className="flex gap-1.5 mt-4">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        <div className="mt-4 space-y-2">
          <Skeleton className="h-3 w-12" />
          <div className="flex gap-1 flex-wrap">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-18 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border/50">
          <Skeleton className="h-3 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ResourceListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3 bg-card border border-border/50 rounded-lg animate-pulse">
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1 flex items-center gap-6">
        <div className="min-w-[180px] space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-28 hidden lg:block" />
      </div>
    </div>
  );
}
