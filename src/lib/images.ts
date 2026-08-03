import db from "@/lib/db";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { ImageAttachment } from "@/types";

const IMAGES_DIR = path.join(process.cwd(), "data", "images");

interface ImageRow {
  id: number;
  date: string;
  filename: string;
  created_at: string;
}

function toAttachment(row: ImageRow): ImageAttachment {
  return {
    id: row.id,
    date: row.date,
    filename: row.filename,
    createdAt: row.created_at,
  };
}

export function imagesDirPath(): string {
  return IMAGES_DIR;
}

function ensureImagesDir(): void {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
}

export function getImagesForDate(date: string): ImageAttachment[] {
  const rows = db
    .prepare("SELECT * FROM images WHERE date = ? ORDER BY id ASC")
    .all(date) as unknown as ImageRow[];
  return rows.map(toAttachment);
}

export function getDatesWithImages(dates: string[]): Set<string> {
  if (dates.length === 0) return new Set();
  const placeholders = dates.map(() => "?").join(",");
  const rows = db
    .prepare(`SELECT DISTINCT date FROM images WHERE date IN (${placeholders})`)
    .all(...dates) as unknown as { date: string }[];
  return new Set(rows.map((r) => r.date));
}

// Unlike getDatesWithImages, this doesn't require the caller to already know
// which dates to check — it finds every image date in a range directly, so
// it also catches dates with photos but no saved text (no entries row yet).
export function getDatesWithImagesInRange(
  startDate: string,
  endDate: string
): Set<string> {
  const rows = db
    .prepare(
      "SELECT DISTINCT date FROM images WHERE date >= ? AND date <= ?"
    )
    .all(startDate, endDate) as unknown as { date: string }[];
  return new Set(rows.map((r) => r.date));
}

export function addImage(
  date: string,
  buffer: Buffer,
  ext: string
): ImageAttachment {
  ensureImagesDir();
  const filename = `${crypto.randomUUID()}${ext}`;
  fs.writeFileSync(path.join(IMAGES_DIR, filename), buffer);

  const now = new Date().toISOString();
  const result = db
    .prepare("INSERT INTO images (date, filename, created_at) VALUES (?, ?, ?)")
    .run(date, filename, now);

  return {
    id: Number(result.lastInsertRowid),
    date,
    filename,
    createdAt: now,
  };
}

export function deleteImage(id: number): boolean {
  const row = db
    .prepare("SELECT * FROM images WHERE id = ?")
    .get(id) as unknown as ImageRow | undefined;
  if (!row) return false;

  db.prepare("DELETE FROM images WHERE id = ?").run(id);

  try {
    fs.unlinkSync(path.join(IMAGES_DIR, row.filename));
  } catch {
    // File already gone; the DB row is what matters for the app's state.
  }

  return true;
}
