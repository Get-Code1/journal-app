import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "journal.db");

declare global {
  // eslint-disable-next-line no-var
  var __journalDb: Database.Database | undefined;
}

function createDb(): Database.Database {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS entries (
      date TEXT PRIMARY KEY,
      content TEXT NOT NULL DEFAULT '',
      mood TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  return db;
}

// Reuse a single connection across hot reloads in dev.
const db = global.__journalDb ?? createDb();
if (process.env.NODE_ENV !== "production") {
  global.__journalDb = db;
}

export default db;
