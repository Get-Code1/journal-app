import Skeleton from "@/components/Skeleton";

export default function SearchLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-11 w-full rounded-full" />
    </div>
  );
}
