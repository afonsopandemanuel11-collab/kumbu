import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-24 hidden sm:block rounded-xl" />
      </div>

      {/* Hero balance card */}
      <Skeleton className="h-48 w-full rounded-3xl" />

      {/* 2 Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>

      {/* Accounts list */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-36" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>

      {/* Recent activity */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
