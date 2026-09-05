import { Skeleton } from "@/components/ui/skeleton";

export default function RelatoriosLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-28 rounded-3xl" />
      </div>

      <Skeleton className="h-10 w-80 rounded-xl" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
