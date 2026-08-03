import db from "@/lib/db";
import { todayDateString } from "@/lib/entries";
import { getTotalEntries } from "@/lib/stats";
import type { Mood } from "@/types";

function shiftDateString(dateStr: string, deltaDays: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + deltaDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

const SEED_ENTRIES: { daysAgo: number; mood: Mood; content: string }[] = [
  {
    daysAgo: 6,
    mood: "good",
    content:
      "Started the week feeling pretty settled. Went for a walk after dinner and the air finally felt like autumn.\n\nMade a short list of things to focus on this week instead of trying to do everything at once. Small wins.",
  },
  {
    daysAgo: 4,
    mood: "rough",
    content:
      "Long day. Meetings back to back and I didn't get to the things that actually mattered.\n\nFeeling a bit behind, but I know tomorrow is a fresh start. Going to bed early tonight.",
  },
  {
    daysAgo: 2,
    mood: "great",
    content:
      "Really good day today. Finished a project I'd been putting off for weeks and it felt great to finally clear it off my plate.\n\nHad dinner with an old friend, first time in months. Good conversation, good food. Grateful for days like this.",
  },
  {
    daysAgo: 1,
    mood: "okay",
    content:
      "Nothing remarkable today, just a steady, ordinary day. Did some reading in the evening.\n\nMood was fairly neutral, energy a bit low but not bad. Looking forward to the weekend.",
  },
];

export function seedIfEmpty(): void {
  if (getTotalEntries() > 0) return;

  const today = todayDateString();
  const insert = db.prepare(
    `INSERT INTO entries (date, content, mood, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`
  );

  for (const seed of SEED_ENTRIES) {
    const date = shiftDateString(today, -seed.daysAgo);
    const timestamp = new Date(`${date}T20:00:00`).toISOString();
    insert.run(date, seed.content, seed.mood, timestamp, timestamp);
  }
}
