import db from "@/lib/db";
import { deleteImage, getEntryIdsWithImages, getImagesForEntry } from "@/lib/images";
import type { Entry, EntrySummary, Mood } from "@/types";

export { todayDateString } from "@/lib/date";

export function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function toSummaries(entries: Entry[]): EntrySummary[] {
  const withImages = getEntryIdsWithImages(entries.map((e) => e.id));
  return entries.map((entry) => ({
    ...entry,
    wordCount: wordCount(entry.content),
    hasImages: withImages.has(entry.id),
  }));
}

export function getEntryById(id: number): Entry | null {
  const row = db
    .prepare("SELECT * FROM entries WHERE id = ?")
    .get(id) as unknown as Entry | undefined;
  return row ?? null;
}

export function getEntriesForDate(date: string): Entry[] {
  return db
    .prepare("SELECT * FROM entries WHERE date = ? ORDER BY created_at ASC")
    .all(date) as unknown as Entry[];
}

// The single mood used to represent a day that may hold several entries
// (calendar dot, mood trend chart): the most recently written entry's mood.
export function getMoodForDate(date: string): Mood | null {
  const entries = getEntriesForDate(date);
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].mood) return entries[i].mood;
  }
  return null;
}

export function createEntry(
  date: string,
  content: string,
  mood: Mood | null
): Entry {
  const now = new Date().toISOString();
  const result = db
    .prepare(
      `INSERT INTO entries (date, content, mood, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`
    )
    .run(date, content, mood, now, now);
  return getEntryById(Number(result.lastInsertRowid))!;
}

export function updateEntry(
  id: number,
  content: string,
  mood: Mood | null
): Entry | null {
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE entries SET content = ?, mood = ?, updated_at = ? WHERE id = ?`
  ).run(content, mood, now, id);
  return getEntryById(id);
}

export function deleteEntry(id: number): boolean {
  for (const image of getImagesForEntry(id)) {
    deleteImage(image.id);
  }
  const result = db.prepare("DELETE FROM entries WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getAllEntries(): EntrySummary[] {
  const rows = db
    .prepare("SELECT * FROM entries ORDER BY date DESC, created_at DESC")
    .all() as unknown as Entry[];
  return toSummaries(rows);
}

export function getEntriesInRange(
  startDate: string,
  endDate: string
): EntrySummary[] {
  const rows = db
    .prepare(
      "SELECT * FROM entries WHERE date >= ? AND date <= ? ORDER BY date ASC, created_at ASC"
    )
    .all(startDate, endDate) as unknown as Entry[];
  return toSummaries(rows);
}

// Distinct days that have at least one entry, within range (inclusive).
// Used for the writing streak and weekly/monthly goals — writing three
// entries in one sitting still only counts as one day.
export function getDatesWrittenInRange(
  startDate: string,
  endDate: string
): Set<string> {
  const rows = db
    .prepare(
      "SELECT DISTINCT date FROM entries WHERE date >= ? AND date <= ?"
    )
    .all(startDate, endDate) as unknown as { date: string }[];
  return new Set(rows.map((r) => r.date));
}

export function getAllDatesWritten(): Set<string> {
  const rows = db
    .prepare("SELECT DISTINCT date FROM entries")
    .all() as unknown as { date: string }[];
  return new Set(rows.map((r) => r.date));
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
      "SELECT * FROM entries WHERE content LIKE ? COLLATE NOCASE ORDER BY date DESC, created_at DESC"
    )
    .all(`%${trimmed}%`) as unknown as Entry[];

  const summaries = toSummaries(rows);
  return summaries.map((summary, i) => ({
    ...summary,
    snippet: buildSnippet(rows[i].content, trimmed),
  }));
}
