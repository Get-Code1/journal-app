import Skeleton from "@/components/Skeleton";

export default function EntriesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-7 w-32" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
