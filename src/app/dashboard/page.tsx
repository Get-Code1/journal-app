import Link from "next/link";
import MoodTrendChart from "@/components/MoodTrendChart";
import { getGoalProgress, getMemory, getMoodTrend } from "@/lib/dashboard";
import { getEntriesForDate, getMoodForDate, todayDateString } from "@/lib/entries";
import { getSettings } from "@/lib/settings";
import { getWritingStreak } from "@/lib/stats";
import { MOODS } from "@/types";

export const dynamic = "force-dynamic";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatToday(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function moodEmoji(mood: string | null) {
  return MOODS.find((m) => m.value === mood)?.emoji ?? null;
}

export default function DashboardPage() {
  const settings = getSettings();
  const today = todayDateString();
  const todayEntries = getEntriesForDate(today);
  const hasWrittenToday = todayEntries.some((e) => e.content.trim());
  const todayMood = getMoodForDate(today);

  const streak = getWritingStreak();
  const goals = getGoalProgress(settings.weeklyGoal, settings.monthlyGoal);
  const trend = getMoodTrend(30);
  const memory = getMemory();

  const namePart = settings.displayName ? `, ${settings.displayName}` : "";

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">
          {greeting()}
          {namePart}
        </h1>
        <p className="text-sm text-foreground-muted">{formatToday()}</p>
      </div>

      {hasWrittenToday ? (
        <Link
          href="/today"
          className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="text-sm text-foreground-muted">
            ✓ You&rsquo;ve written today
            {todayMood && <> · {moodEmoji(todayMood)}</>}
          </span>
          <span className="text-sm font-medium text-accent">Review →</span>
        </Link>
      ) : (
        <Link
          href="/today"
          className="flex items-center justify-between gap-3 rounded-2xl bg-accent p-5 text-accent-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
        >
          <span className="text-base font-medium">Write today&rsquo;s entry</span>
          <span aria-hidden>→</span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
          <span className="text-3xl">🔥</span>
          <span className="text-2xl font-semibold tracking-tight">
            {streak}
          </span>
          <span className="text-xs text-foreground-muted">
            day{streak === 1 ? "" : "s"} streak
          </span>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
          <GoalBar
            label="This week"
            count={goals.weeklyCount}
            goal={goals.weeklyGoal}
          />
          <GoalBar
            label="This month"
            count={goals.monthlyCount}
            goal={goals.monthlyGoal}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
        <h2 className="text-sm font-medium">Mood, last 30 days</h2>
        <MoodTrendChart points={trend} />
      </div>

      {memory ? (
        <Link
          href={`/entry/${memory.entry.date}/${memory.entry.id}`}
          className="flex flex-col gap-2 rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="text-sm font-medium">
            {memory.yearsAgo
              ? `On this day, ${memory.yearsAgo} year${memory.yearsAgo === 1 ? "" : "s"} ago`
              : "A memory from your journal"}
          </h2>
          <p className="text-xs text-foreground-muted">
            {formatDate(memory.entry.date)}
            {memory.entry.mood && <> · {moodEmoji(memory.entry.mood)}</>}
          </p>
          <p className="prose-journal text-sm text-foreground-muted">
            {memory.entry.content.replace(/\s+/g, " ").trim().slice(0, 200)}
            {memory.entry.content.length > 200 ? "…" : ""}
          </p>
        </Link>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-12 text-center">
          <span className="text-2xl">🌱</span>
          <p className="text-sm text-foreground-muted">
            Memories will appear here once you&rsquo;ve written a few entries.
          </p>
        </div>
      )}
    </div>
  );
}

function GoalBar({
  label,
  count,
  goal,
}: {
  label: string;
  count: number;
  goal: number;
}) {
  const pct = Math.min(100, (count / goal) * 100);
  const met = count >= goal;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-foreground-muted">{label}</span>
        <span className={met ? "font-medium text-accent" : "text-foreground-muted"}>
          {count}/{goal}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
