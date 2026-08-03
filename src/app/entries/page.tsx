import Link from "next/link";
import { getAllEntries } from "@/lib/entries";
import { MOODS } from "@/types";

export const dynamic = "force-dynamic";

function moodEmoji(mood: string | null) {
  return MOODS.find((m) => m.value === mood)?.emoji ?? null;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function preview(content: string): string {
  const flat = content.replace(/\s+/g, " ").trim();
  return flat.length > 160 ? `${flat.slice(0, 160)}…` : flat;
}

export default function EntriesPage() {
  const entries = getAllEntries();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-medium tracking-tight">All entries</h1>

      {entries.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
          <span className="text-3xl">📔</span>
          <p className="text-sm text-foreground-muted">
            No entries yet. Start writing on the Today page.
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {entries.map((entry) => (
          <li key={entry.date}>
            <Link
              href={`/entry/${entry.date}`}
              className="block rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {moodEmoji(entry.mood) && <span>{moodEmoji(entry.mood)}</span>}
                  <span>{formatDate(entry.date)}</span>
                </div>
                <span className="text-xs text-foreground-muted">
                  {entry.wordCount} words
                </span>
              </div>
              <p className="prose-journal text-sm text-foreground-muted">
                {entry.content ? preview(entry.content) : "Empty entry"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
