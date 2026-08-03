import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "journal.db");

declare global {
  var __journalDb: DatabaseSync | undefined;
}

function createDb(): DatabaseSync {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");

  db.exec(`
    CREATE TABLE IF NOT EXISTS entries (
      date TEXT PRIMARY KEY,
      content TEXT NOT NULL DEFAULT '',
      mood TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

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
      date TEXT NOT NULL,
      filename TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_images_date ON images (date);`);

  return db;
}

// Reuse a single connection across hot reloads in dev.
const db = global.__journalDb ?? createDb();
if (process.env.NODE_ENV !== "production") {
  global.__journalDb = db;
}

export default db;
