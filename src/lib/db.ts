import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "journal.db");

declare global {
  var __journalDb: DatabaseSync | undefined;
}

function tableExists(db: DatabaseSync, table: string): boolean {
  return !!db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(table);
}

function tableHasColumn(db: DatabaseSync, table: string, column: string): boolean {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as unknown as {
    name: string;
  }[];
  return rows.some((r) => r.name === column);
}

// Pre-multi-entry installs have `entries.date` as the primary key (one row
// per day). This reshapes it to an auto-increment id so a day can hold
// several entries, preserving every existing row.
function migrateEntriesToMultiEntry(db: DatabaseSync): void {
  if (!tableExists(db, "entries") || tableHasColumn(db, "entries", "id")) return;

  db.exec("BEGIN");
  try {
    db.exec("ALTER TABLE entries RENAME TO entries_old;");
    db.exec(`
      CREATE TABLE entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        mood TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    db.exec(`
      INSERT INTO entries (date, content, mood, created_at, updated_at)
      SELECT date, content, mood, created_at, updated_at FROM entries_old ORDER BY date ASC;
    `);
    db.exec("DROP TABLE entries_old;");
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

// Images used to be keyed only by date. Now that a date can have several
// entries, images belong to a specific entry_id. Backfills existing rows by
// matching on date (unambiguous pre-migration, since dates were unique then);
// a date with photos but no entry text yet gets an empty placeholder entry so
// its images have somewhere to attach.
function migrateImagesToEntryId(db: DatabaseSync): void {
  if (!tableExists(db, "images") || tableHasColumn(db, "images", "entry_id")) return;

  db.exec("ALTER TABLE images ADD COLUMN entry_id INTEGER;");

  const orphanDates = db
    .prepare(
      `SELECT DISTINCT images.date as date
       FROM images
       LEFT JOIN entries ON entries.date = images.date
       WHERE entries.id IS NULL`
    )
    .all() as unknown as { date: string }[];

  const now = new Date().toISOString();
  for (const row of orphanDates) {
    db.prepare(
      `INSERT INTO entries (date, content, mood, created_at, updated_at) VALUES (?, '', NULL, ?, ?)`
    ).run(row.date, now, now);
  }

  db.exec(`
    UPDATE images
    SET entry_id = (
      SELECT id FROM entries WHERE entries.date = images.date
      ORDER BY entries.id ASC LIMIT 1
    )
    WHERE entry_id IS NULL;
  `);
}

function createDb(): DatabaseSync {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");

  migrateEntriesToMultiEntry(db);

  db.exec(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      mood TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_entries_date ON entries (date);`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      display_name TEXT NOT NULL DEFAULT '',
      weekly_goal INTEGER NOT NULL DEFAULT 5,
      monthly_goal INTEGER NOT NULL DEFAULT 20
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      filename TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  migrateImagesToEntryId(db);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_images_date ON images (date);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_images_entry_id ON images (entry_id);`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS entry_tags (
      entry_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (entry_id, tag_id)
    );
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_entry_tags_tag ON entry_tags (tag_id);`);

  return db;
}

// Reuse a single connection across hot reloads in dev.
const db = global.__journalDb ?? createDb();
if (process.env.NODE_ENV !== "production") {
  global.__journalDb = db;
}

export default db;
