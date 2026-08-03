import { MOODS } from "@/types";
import type { Stats } from "@/lib/stats";

export default function StatsPanel({
  stats,
  monthLabel,
}: {
  stats: Stats;
  monthLabel: string;
}) {
  const maxCount = Math.max(1, ...Object.values(stats.moodBreakdown));

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div>
          <div className="text-2xl font-semibold tracking-tight">
            {stats.streak}
          </div>
          <div className="text-xs text-foreground-muted">
            day{stats.streak === 1 ? "" : "s"} writing streak
          </div>
        </div>
        <div>
          <div className="text-2xl font-semibold tracking-tight">
            {stats.totalEntries}
          </div>
          <div className="text-xs text-foreground-muted">total entries</div>
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-medium text-foreground-muted">
          Mood in {monthLabel}
        </div>
        <div className="flex flex-col gap-1.5">
          {MOODS.map((m) => {
            const count = stats.moodBreakdown[m.value];
            const widthPct = (count / maxCount) * 100;
            return (
              <div key={m.value} className="flex items-center gap-2">
                <span className="w-5 text-center text-sm">{m.emoji}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
                    style={{ width: count > 0 ? `${widthPct}%` : "0%" }}
                  />
                </div>
                <span className="w-4 text-right text-xs text-foreground-muted">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
