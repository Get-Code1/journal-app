import Skeleton from "@/components/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-7 w-28" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-64" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
