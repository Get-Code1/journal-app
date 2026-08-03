import db from "@/lib/db";
import { getDatesWithImages } from "@/lib/images";
import type { Entry, EntrySummary, Mood } from "@/types";

export { todayDateString } from "@/lib/date";

export function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function toSummaries(entries: Entry[]): EntrySummary[] {
  const withImages = getDatesWithImages(entries.map((e) => e.date));
  return entries.map((entry) => ({
    ...entry,
    wordCount: wordCount(entry.content),
    hasImages: withImages.has(entry.date),
  }));
}

export function getEntry(date: string): Entry | null {
  const row = db
    .prepare("SELECT * FROM entries WHERE date = ?")
    .get(date) as unknown as Entry | undefined;
  return row ?? null;
}

export function upsertEntry(
  date: string,
  content: string,
  mood: Mood | null
): Entry {
  const now = new Date().toISOString();
  const existing = getEntry(date);

  if (existing) {
    db.prepare(
      `UPDATE entries SET content = ?, mood = ?, updated_at = ? WHERE date = ?`
    ).run(content, mood, now, date);
  } else {
    db.prepare(
      `INSERT INTO entries (date, content, mood, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`
    ).run(date, content, mood, now, now);
  }

  return getEntry(date)!;
}

export function getAllEntries(): EntrySummary[] {
  const rows = db
    .prepare("SELECT * FROM entries ORDER BY date DESC")
    .all() as unknown as Entry[];
  return toSummaries(rows);
}

export function getEntriesInRange(
  startDate: string,
  endDate: string
): EntrySummary[] {
  const rows = db
    .prepare(
      "SELECT * FROM entries WHERE date >= ? AND date <= ? ORDER BY date ASC"
    )
    .all(startDate, endDate) as unknown as Entry[];
  return toSummaries(rows);
}

export interface SearchResult extends EntrySummary {
  snippet: string;
}

function buildSnippet(content: string, query: string): string {
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerContent.indexOf(lowerQuery);
  if (idx === -1) {
    return content.slice(0, 140).replace(/\s+/g, " ").trim();
  }
  const radius = 60;
  const start = Math.max(0, idx - radius);
  const end = Math.min(content.length, idx + query.length + radius);
  let snippet = content.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) snippet = `…${snippet}`;
  if (end < content.length) snippet = `${snippet}…`;
  return snippet;
}

export function searchEntries(query: string): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const rows = db
    .prepare(
      "SELECT * FROM entries WHERE content LIKE ? COLLATE NOCASE ORDER BY date DESC"
    )
    .all(`%${trimmed}%`) as unknown as Entry[];

  const summaries = toSummaries(rows);
  return summaries.map((summary, i) => ({
    ...summary,
    snippet: buildSnippet(rows[i].content, trimmed),
  }));
}
