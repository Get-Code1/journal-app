import db from "@/lib/db";
import { mondayOfWeek, shiftDateString, todayDateString } from "@/lib/date";
import { getEntriesInRange } from "@/lib/entries";
import { getDatesWithImages } from "@/lib/images";
import type { Entry, EntrySummary, Mood } from "@/types";

export interface GoalProgress {
  weeklyCount: number;
  weeklyGoal: number;
  monthlyCount: number;
  monthlyGoal: number;
}

export function getGoalProgress(
  weeklyGoal: number,
  monthlyGoal: number
): GoalProgress {
  const today = todayDateString();
  const weekStart = mondayOfWeek(today);
  const monthStart = `${today.slice(0, 7)}-01`;

  const weeklyCount = getEntriesInRange(weekStart, today).length;
  const monthlyCount = getEntriesInRange(monthStart, today).length;

  return { weeklyCount, weeklyGoal, monthlyCount, monthlyGoal };
}

export interface MoodTrendPoint {
  date: string;
  mood: Mood | null;
}

export function getMoodTrend(days: number): MoodTrendPoint[] {
  const today = todayDateString();
  const start = shiftDateString(today, -(days - 1));
  const entries = getEntriesInRange(start, today);
  const moodByDate = new Map(entries.map((e) => [e.date, e.mood]));

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
  const hasImages = getDatesWithImages([entry.date]).has(entry.date);
  return { ...entry, wordCount, hasImages };
}

export function getMemory(): Memory | null {
  const today = todayDateString();
  const monthDay = today.slice(5); // "MM-DD"

  const onThisDay = db
    .prepare(
      `SELECT * FROM entries WHERE substr(date, 6) = ? AND date != ? ORDER BY date DESC LIMIT 1`
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
