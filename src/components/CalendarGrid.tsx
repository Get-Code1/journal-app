import Link from "next/link";
import type { Mood } from "@/types";
import { MOOD_COLORS, MOODS } from "@/types";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

interface CalendarGridProps {
  year: number;
  month: number; // 1-12
  moodByDate: Record<string, Mood | null>;
  imageDates?: Set<string>;
  todayStr: string;
}

export default function CalendarGrid({
  year,
  month,
  moodByDate,
  imageDates,
  todayStr,
}: CalendarGridProps) {
  const firstOfMonth = new Date(year, month - 1, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startWeekday + 1;
    cells.push(dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null);
  }

  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {WEEKDAY_LABELS.map((label) => (
        <div
          key={label}
          className="pb-1 text-center text-xs font-medium text-foreground-muted"
        >
          {label}
        </div>
      ))}
      {cells.map((day, idx) => {
        if (day === null) {
          return <div key={`empty-${idx}`} />;
        }
        const dateStr = `${year}-${pad(month)}-${pad(day)}`;
        const mood = moodByDate[dateStr];
        const hasImages = imageDates?.has(dateStr);
        const isToday = dateStr === todayStr;

        const moodLabel = mood
          ? MOODS.find((m) => m.value === mood)?.label
          : undefined;

        return (
          <Link
            key={dateStr}
            href={`/entry/${dateStr}`}
            title={moodLabel ? `${dateStr}: ${moodLabel}` : dateStr}
            className={`relative flex aspect-square flex-col items-center justify-center gap-1 rounded-xl text-sm transition-all duration-150 hover:scale-[1.04] hover:bg-surface-hover active:scale-95 ${
              isToday ? "ring-1 ring-accent" : ""
            }`}
          >
            {hasImages && (
              <span className="absolute right-1 top-1 text-[9px] leading-none opacity-70">
                📷
              </span>
            )}
            <span
              className={isToday ? "font-semibold text-accent" : "text-foreground/80"}
            >
              {day}
            </span>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: mood ? MOOD_COLORS[mood] : "transparent",
              }}
            />
          </Link>
        );
      })}
    </div>
  );
}
