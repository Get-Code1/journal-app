import Link from "next/link";
import CalendarGrid from "@/components/CalendarGrid";
import StatsPanel from "@/components/StatsPanel";
import { getEntriesInRange, todayDateString } from "@/lib/entries";
import { getDatesWithImagesInRange } from "@/lib/images";
import { getStats } from "@/lib/stats";
import type { Mood } from "@/types";

export const dynamic = "force-dynamic";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function shiftMonth(year: number, month: number, delta: number) {
  const total = year * 12 + (month - 1) + delta;
  const newYear = Math.floor(total / 12);
  const newMonth = (total % 12) + 1;
  return { year: newYear, month: newMonth };
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = Number(params.year) || now.getFullYear();
  const month = Number(params.month) || now.getMonth() + 1;

  const daysInMonth = new Date(year, month, 0).getDate();
  const startDate = `${year}-${pad(month)}-01`;
  const endDate = `${year}-${pad(month)}-${pad(daysInMonth)}`;

  const entries = getEntriesInRange(startDate, endDate);
  const moodByDate: Record<string, Mood | null> = {};
  for (const entry of entries) {
    moodByDate[entry.date] = entry.mood;
  }
  const imageDates = getDatesWithImagesInRange(startDate, endDate);

  const stats = getStats(year, month);
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" }
  );

  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const todayStr = todayDateString();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Link
            href={`/calendar?year=${prev.year}&month=${prev.month}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted transition-all duration-150 hover:bg-surface-hover active:scale-90"
            aria-label="Previous month"
          >
            ‹
          </Link>
          <h1 className="w-44 text-center text-lg font-medium tracking-tight">
            {monthLabel}
          </h1>
          <Link
            href={`/calendar?year=${next.year}&month=${next.month}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted transition-all duration-150 hover:bg-surface-hover active:scale-90"
            aria-label="Next month"
          >
            ›
          </Link>
        </div>
        <Link
          href="/calendar"
          className="rounded-full border border-border-subtle px-3 py-1.5 text-sm text-foreground-muted transition-all duration-150 hover:bg-surface-hover active:scale-95"
        >
          Today
        </Link>
      </div>

      <CalendarGrid
        year={year}
        month={month}
        moodByDate={moodByDate}
        imageDates={imageDates}
        todayStr={todayStr}
      />

      <StatsPanel stats={stats} monthLabel={monthLabel} />
    </div>
  );
}
