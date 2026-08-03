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
- **Today** — a distraction-free editor with a 5-option mood picker, autosave with a "Saved" indicator, live word count, and photo attachments. A day can hold more than one entry (e.g. morning/evening) — the common single-entry case still opens straight into the editor; a second entry switches to a day list.
- **Markdown** — a lightweight formatting toolbar (bold, italic, heading, bullet list) and a Write/Preview toggle for each entry.
- **Tags** — tag any entry (`#work`, `#travel`); filter by tag on the All Entries and Search pages.
- **Calendar** — a monthly grid with a mood-coloured dot (and a photo indicator) on any day with an entry, plus a GitHub-style year-at-a-glance heatmap view. Click a day to open it; use the arrows or "Today"/"This year" to navigate.
- **Search** — keyword and/or tag search across all entries, with matching snippets and dates.
- **All entries** — every entry, newest first, with tag filtering.
- **Photos** — attach photos to any entry by drag-and-drop or file picker; view them in a lightbox (arrow keys, Esc to close).
- **Export / Print** — pick a date range and print or save it as a PDF keepsake, independent of your chosen theme.
- **Themes** — Light, Dark, Paper, Midnight, and Forest, switchable from Settings and remembered across restarts; defaults to your system's light/dark preference on first run.
- **Settings** — theme picker, display name, and weekly/monthly writing goals.
- Press **N** anywhere to jump to today's entry. On mobile, the top nav becomes a bottom tab bar.

## Data

Everything lives in a single SQLite file (`data/journal.db`, gitignored):

```ts
// entries — a day can have more than one
{
  id: number;
  date: string;        // "YYYY-MM-DD"
  content: string;     // plain text / lightweight markdown
  mood: "great" | "good" | "okay" | "low" | "rough" | null;
  created_at: string;  // ISO timestamp
  updated_at: string;  // ISO timestamp
}

// images — photo attachments, belong to a specific entry
{
  id: number;
  entry_id: number;
  date: string;        // denormalized, for fast calendar range queries
  filename: string;    // UUID-based, stored under data/images/
  created_at: string;
}

// tags + entry_tags — many-to-many
{
  tags: { id: number; name: string };
  entry_tags: { entry_id: number; tag_id: number };
}

// settings — a single row (id = 1)
{
  display_name: string;
  weekly_goal: number;
  monthly_goal: number;
}
```

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + Node's built-in `node:sqlite` + react-markdown.
