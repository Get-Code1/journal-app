import db from "@/lib/db";

export interface TagCount {
  name: string;
  count: number;
}

export function normalizeTagName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/\s+/g, "-");
}

export function getTagsForEntry(entryId: number): string[] {
  const rows = db
    .prepare(
      `SELECT tags.name as name FROM entry_tags
       JOIN tags ON tags.id = entry_tags.tag_id
       WHERE entry_tags.entry_id = ?
       ORDER BY tags.name ASC`
    )
    .all(entryId) as unknown as { name: string }[];
  return rows.map((r) => r.name);
}

export function getTagsForEntries(entryIds: number[]): Map<number, string[]> {
  const map = new Map<number, string[]>();
  if (entryIds.length === 0) return map;

  const placeholders = entryIds.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT entry_tags.entry_id as entryId, tags.name as name
       FROM entry_tags JOIN tags ON tags.id = entry_tags.tag_id
       WHERE entry_tags.entry_id IN (${placeholders})
       ORDER BY tags.name ASC`
    )
    .all(...entryIds) as unknown as { entryId: number; name: string }[];

  for (const row of rows) {
    const list = map.get(row.entryId) ?? [];
    list.push(row.name);
    map.set(row.entryId, list);
  }
  return map;
}

// Replaces the full tag set for an entry with the given list (order-agnostic,
// case/space normalized, deduplicated) — simplest model for a small editable
// chip list where the client always sends the current full set.
export function setTagsForEntry(entryId: number, tagNames: string[]): void {
  const normalized = Array.from(
    new Set(tagNames.map(normalizeTagName).filter(Boolean))
  );

  db.prepare(`DELETE FROM entry_tags WHERE entry_id = ?`).run(entryId);

  for (const name of normalized) {
    const existing = db
      .prepare(`SELECT id FROM tags WHERE name = ?`)
      .get(name) as unknown as { id: number } | undefined;

    const tagId = existing
      ? existing.id
      : Number(
          db.prepare(`INSERT INTO tags (name) VALUES (?)`).run(name)
            .lastInsertRowid
        );

    db.prepare(
      `INSERT OR IGNORE INTO entry_tags (entry_id, tag_id) VALUES (?, ?)`
    ).run(entryId, tagId);
  }
}

// All tags currently in use, most-used first — powers the filter chips.
export function getAllTags(): TagCount[] {
  return db
    .prepare(
      `SELECT tags.name as name, COUNT(entry_tags.entry_id) as count
       FROM tags
       JOIN entry_tags ON entry_tags.tag_id = tags.id
       GROUP BY tags.id
       ORDER BY count DESC, tags.name ASC`
    )
    .all() as unknown as TagCount[];
}

export function getEntryIdsForTag(tagName: string): Set<number> {
  const name = normalizeTagName(tagName);
  const rows = db
    .prepare(
      `SELECT entry_tags.entry_id as id FROM entry_tags
       JOIN tags ON tags.id = entry_tags.tag_id
       WHERE tags.name = ?`
    )
    .all(name) as unknown as { id: number }[];
  return new Set(rows.map((r) => r.id));
}
