import db from "@/lib/db";
import { todayDateString } from "@/lib/entries";
import type { Mood } from "@/types";

function dateStringToDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function shiftDateString(dateStr: string, deltaDays: number): string {
  const d = dateStringToDate(dateStr);
  d.setDate(d.getDate() + deltaDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getWritingStreak(): number {
  const rows = db
    .prepare("SELECT date FROM entries ORDER BY date DESC")
    .all() as { date: string }[];
  const dates = new Set(rows.map((r) => r.date));

  const today = todayDateString();
  let cursor = today;

  // Streak counts consecutive days ending today or yesterday
  // (so it doesn't reset to 0 before you've written today).
  if (!dates.has(cursor)) {
    cursor = shiftDateString(cursor, -1);
    if (!dates.has(cursor)) return 0;
  }

  let streak = 0;
  while (dates.has(cursor)) {
    streak++;
    cursor = shiftDateString(cursor, -1);
  }
  return streak;
}

export function getTotalEntries(): number {
  const row = db.prepare("SELECT COUNT(*) as count FROM entries").get() as {
    count: number;
  };
  return row.count;
}

export function getMoodBreakdownForMonth(
  year: number,
  month: number // 1-12
): Record<Mood, number> {
  const monthStr = String(month).padStart(2, "0");
  const prefix = `${year}-${monthStr}`;
  const rows = db
    .prepare("SELECT mood FROM entries WHERE date LIKE ? AND mood IS NOT NULL")
    .all(`${prefix}-%`) as { mood: Mood }[];

  const breakdown: Record<Mood, number> = {
    great: 0,
    good: 0,
    okay: 0,
    low: 0,
    rough: 0,
  };
  for (const row of rows) {
    breakdown[row.mood]++;
  }
  return breakdown;
}

export interface Stats {
  streak: number;
  totalEntries: number;
  moodBreakdown: Record<Mood, number>;
}

export function getStats(year: number, month: number): Stats {
  return {
    streak: getWritingStreak(),
    totalEntries: getTotalEntries(),
    moodBreakdown: getMoodBreakdownForMonth(year, month),
  };
}
