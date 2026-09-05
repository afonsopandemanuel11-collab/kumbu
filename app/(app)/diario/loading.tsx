import { Skeleton } from "@/components/ui/skeleton";

export default function DiarioLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      <Skeleton className="h-24 rounded-2xl" />

      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
