import Link from "next/link";
import { MOOD_COLORS, MOODS } from "@/types";
import type { Mood } from "@/types";

const WEEKS = 53;
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface DayCell {
  date: string | null;
}

export default function YearHeatmap({
  year,
  moodByDate,
  todayStr,
}: {
  year: number;
  moodByDate: Record<string, Mood>;
  todayStr: string;
}) {
  const jan1 = new Date(year, 0, 1);
  const gridStart = new Date(year, 0, 1 - jan1.getDay());

  const columns: DayCell[][] = [];
  const monthLabelForColumn: (string | null)[] = [];

  for (let w = 0; w < WEEKS; w++) {
    const col: DayCell[] = [];
    let monthLabel: string | null = null;
    for (let d = 0; d < 7; d++) {
      const current = new Date(gridStart);
      current.setDate(gridStart.getDate() + w * 7 + d);
      const inYear = current.getFullYear() === year;
      col.push({ date: inYear ? toDateString(current) : null });
      if (inYear && current.getDate() === 1) {
        monthLabel = MONTH_LABELS[current.getMonth()];
      }
    }
    columns.push(col);
    monthLabelForColumn.push(monthLabel);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex flex-col gap-1">
          <div className="flex gap-[3px]">
            {columns.map((_, w) => (
              <div
                key={w}
                className="w-[11px] text-center text-[9px] leading-none text-foreground-muted"
              >
                {monthLabelForColumn[w] ?? ""}
              </div>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {columns.map((col, w) => (
              <div key={w} className="flex flex-col gap-[3px]">
                {col.map((cell, d) => {
                  if (!cell.date) {
                    return <div key={d} className="h-[11px] w-[11px]" />;
                  }
                  const mood = moodByDate[cell.date];
                  const isToday = cell.date === todayStr;
                  const label = mood
                    ? MOODS.find((m) => m.value === mood)?.label
                    : "No entry";
                  return (
                    <Link
                      key={d}
                      href={`/entry/${cell.date}`}
                      title={`${cell.date}: ${label}`}
                      className={`h-[11px] w-[11px] rounded-[3px] transition-transform duration-100 hover:scale-125 ${
                        isToday ? "ring-1 ring-accent" : ""
                      }`}
                      style={{
                        backgroundColor: mood
                          ? MOOD_COLORS[mood]
                          : "var(--surface-muted)",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {MOODS.map((m) => (
          <span
            key={m.value}
            className="flex items-center gap-1 text-xs text-foreground-muted"
          >
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: MOOD_COLORS[m.value] }}
            />
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
