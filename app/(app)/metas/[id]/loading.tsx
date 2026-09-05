import { Skeleton } from "@/components/ui/skeleton";

export default function GoalDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-4 w-36" />

      {/* Hero card */}
      <div className="rounded-3xl border border-kumbu-100 bg-white p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-xl" />
            <Skeleton className="h-9 w-36 rounded-xl" />
          </div>
        </div>

        <Skeleton className="h-24 rounded-2xl" />
      </div>

      {/* Pace card */}
      <Skeleton className="h-20 rounded-2xl" />

      {/* Contributions list */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
