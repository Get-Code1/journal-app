import db from "@/lib/db";
import { mondayOfWeek, shiftDateString, todayDateString } from "@/lib/date";
import { getDatesWrittenInRange } from "@/lib/entries";
import { getEntryIdsWithImages } from "@/lib/images";
import type { Entry, EntrySummary, Mood } from "@/types";

export interface GoalProgress {
  weeklyCount: number;
  weeklyGoal: number;
  monthlyCount: number;
  monthlyGoal: number;
}

// Counts distinct days written, not raw entry rows — writing three entries
// in one sitting still only counts once toward the goal.
export function getGoalProgress(
  weeklyGoal: number,
  monthlyGoal: number
): GoalProgress {
  const today = todayDateString();
  const weekStart = mondayOfWeek(today);
  const monthStart = `${today.slice(0, 7)}-01`;

  const weeklyCount = getDatesWrittenInRange(weekStart, today).size;
  const monthlyCount = getDatesWrittenInRange(monthStart, today).size;

  return { weeklyCount, weeklyGoal, monthlyCount, monthlyGoal };
}

export interface MoodTrendPoint {
  date: string;
  mood: Mood | null;
}

export function getMoodTrend(days: number): MoodTrendPoint[] {
  const today = todayDateString();
  const start = shiftDateString(today, -(days - 1));

  // Ordered oldest-to-newest so, per date, the last entry with a mood set
  // wins — the same "day's mood = latest entry's mood" rule as the calendar.
  const rows = db
    .prepare(
      "SELECT date, mood FROM entries WHERE date >= ? AND date <= ? ORDER BY date ASC, created_at ASC"
    )
    .all(start, today) as unknown as { date: string; mood: Mood | null }[];

  const moodByDate = new Map<string, Mood | null>();
  for (const row of rows) {
    if (row.mood) moodByDate.set(row.date, row.mood);
  }

  const points: MoodTrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = shiftDateString(today, -i);
    points.push({ date, mood: moodByDate.get(date) ?? null });
  }
  return points;
}

export interface Memory {
  entry: EntrySummary;
  yearsAgo: number | null;
}

function toSummary(entry: Entry): EntrySummary {
  const trimmed = entry.content.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const hasImages = getEntryIdsWithImages([entry.id]).has(entry.id);
  return { ...entry, wordCount, hasImages };
}

export function getMemory(): Memory | null {
  const today = todayDateString();
  const monthDay = today.slice(5); // "MM-DD"

  const onThisDay = db
    .prepare(
      `SELECT * FROM entries WHERE substr(date, 6) = ? AND date != ? AND content != ''
       ORDER BY date DESC, created_at DESC LIMIT 1`
    )
    .get(monthDay, today) as unknown as Entry | undefined;

  if (onThisDay) {
    const yearsAgo = Number(today.slice(0, 4)) - Number(onThisDay.date.slice(0, 4));
    return { entry: toSummary(onThisDay), yearsAgo };
  }

  const randomPast = db
    .prepare(
      `SELECT * FROM entries WHERE date != ? AND content != '' ORDER BY RANDOM() LIMIT 1`
    )
    .get(today) as unknown as Entry | undefined;

  return randomPast ? { entry: toSummary(randomPast), yearsAgo: null } : null;
}
