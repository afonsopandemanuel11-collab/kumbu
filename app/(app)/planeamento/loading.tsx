import { Skeleton } from "@/components/ui/skeleton";

export default function PlaneamentoLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-28 rounded-3xl" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Skeleton className="h-72 rounded-2xl" />
        </div>
        <div className="lg:col-span-5">
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
