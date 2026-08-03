# Journal

A local, distraction-free daily journal. No accounts, no auth, no network calls — it's meant to run on `localhost` only, with everything stored in a SQLite file on disk.

## Running it

Requires Node.js 22.5 or newer (uses the built-in `node:sqlite` module, so there's no native module to compile — no build tools needed on any platform).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app opens on today's entry.

On first run the database is created at `data/journal.db` and seeded with a few example entries from the past week so the calendar and stats aren't empty.

## Features

- **Today** — a plain-text editor for the current day, with a 5-option mood picker, autosave (with a "Saved" indicator), and a live word count.
- **Calendar** — a monthly grid with a mood-coloured dot on any day that has an entry. Click a day to open it; use the arrows or the "Today" button to navigate months.
- **Search** — keyword search across all entries, with matching snippets and dates.
- **All entries** — every entry, newest first.
- **Stats** — current writing streak, total entries, and a mood breakdown for the month, shown on the Calendar page.

## Data

Entries are stored one-per-day in a single SQLite table (`data/journal.db`, gitignored):

```ts
{
  date: string;        // "YYYY-MM-DD", primary key
  content: string;     // plain text
  mood: "great" | "good" | "okay" | "low" | "rough" | null;
  created_at: string;  // ISO timestamp
  updated_at: string;  // ISO timestamp
}
```

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + Node's built-in `node:sqlite`.
