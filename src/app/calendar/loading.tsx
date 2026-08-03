import Skeleton from "@/components/Skeleton";

export default function CalendarLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}
