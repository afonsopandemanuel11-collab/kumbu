import { Skeleton } from "@/components/ui/skeleton";

export default function RendimentosLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-28 rounded-3xl" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <div className="lg:col-span-7">
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
