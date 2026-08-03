import Link from "next/link";
import YearHeatmap from "@/components/YearHeatmap";
import { getMoodByDateInRange, todayDateString } from "@/lib/entries";

export const dynamic = "force-dynamic";

export default async function YearCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const now = new Date();
  const year = Number(yearParam) || now.getFullYear();

  const moodByDate = getMoodByDateInRange(`${year}-01-01`, `${year}-12-31`);
  const todayStr = todayDateString();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Link
            href={`/calendar/year?year=${year - 1}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted transition-all duration-150 hover:bg-surface-hover active:scale-90"
            aria-label="Previous year"
          >
            ‹
          </Link>
          <h1 className="w-20 text-center text-lg font-medium tracking-tight">
            {year}
          </h1>
          <Link
            href={`/calendar/year?year=${year + 1}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted transition-all duration-150 hover:bg-surface-hover active:scale-90"
            aria-label="Next year"
          >
            ›
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/calendar"
            className="rounded-full border border-border-subtle px-3 py-1.5 text-sm text-foreground-muted transition-all duration-150 hover:bg-surface-hover active:scale-95"
          >
            Month view
          </Link>
          <Link
            href="/calendar/year"
            className="rounded-full border border-border-subtle px-3 py-1.5 text-sm text-foreground-muted transition-all duration-150 hover:bg-surface-hover active:scale-95"
          >
            This year
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
        <YearHeatmap year={year} moodByDate={moodByDate} todayStr={todayStr} />
      </div>
    </div>
  );
}
