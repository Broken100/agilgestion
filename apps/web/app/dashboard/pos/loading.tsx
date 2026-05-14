import { Skeleton } from '@/components/ui/skeleton';

export default function POSLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border p-4">
        <Skeleton className="h-10 w-full rounded-md" />
      </header>
      <div className="flex-1 space-y-3 p-4">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  );
}
