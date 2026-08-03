# Journal

A local, distraction-free daily journal. No accounts, no auth, no network calls — it's meant to run on `localhost` only, with everything stored on disk.

## Running it

Requires Node.js 22.5 or newer (uses the built-in `node:sqlite` module, so there's no native module to compile — no build tools needed on any platform).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app opens on the dashboard.

On first run the database is created at `data/journal.db` and seeded with a few example entries from the past week so the calendar, stats, and mood trend aren't empty.

## Features

- **Dashboard** — a time-of-day greeting, a "write today's entry" prompt, a writing streak, weekly/monthly goal bars, a 30-day mood trend chart, and an "on this day" memory from your journal.
- **Today** — a distraction-free editor with a 5-option mood picker, autosave with a "Saved" indicator, live word count, and photo attachments.
- **Calendar** — a monthly grid with a mood-coloured dot (and a photo indicator) on any day with an entry. Click a day to open it; use the arrows or the "Today" button to navigate months.
- **Search** — keyword search across all entries, with matching snippets and dates.
- **All entries** — every entry, newest first (reachable from the Search page).
- **Photos** — attach photos to any entry by drag-and-drop or file picker; view them in a lightbox (arrow keys, Esc to close).
- **Themes** — Light, Dark, Paper, Midnight, and Forest, switchable from Settings and remembered across restarts; defaults to your system's light/dark preference on first run.
- **Settings** — theme picker, display name, and weekly/monthly writing goals.
- Press **N** anywhere to jump to today's entry. On mobile, the top nav becomes a bottom tab bar.

## Data

Everything lives in a single SQLite file (`data/journal.db`, gitignored) with three tables:

```ts
// entries — one row per day
{
  date: string;        // "YYYY-MM-DD", primary key
  content: string;     // plain text
  mood: "great" | "good" | "okay" | "low" | "rough" | null;
  created_at: string;  // ISO timestamp
  updated_at: string;  // ISO timestamp
}

// images — photo attachments, many per day
{
  id: number;
  date: string;        // references entries.date
  filename: string;    // UUID-based, stored under data/images/
  created_at: string;
}

// settings — a single row (id = 1)
{
  display_name: string;
  weekly_goal: number;
  monthly_goal: number;
}
```

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + Node's built-in `node:sqlite`.
