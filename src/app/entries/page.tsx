import Link from "next/link";
import TagChips from "@/components/TagChips";
import { getAllEntries } from "@/lib/entries";
import { getAllTags } from "@/lib/tags";
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

function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function preview(content: string): string {
  const flat = content.replace(/\s+/g, " ").trim();
  return flat.length > 160 ? `${flat.slice(0, 160)}…` : flat;
}

export default async function EntriesPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const entries = getAllEntries(tag);
  const allTags = getAllTags();

  // Same-day entries need their time shown to tell them apart.
  const dateCounts = new Map<string, number>();
  for (const entry of entries) {
    dateCounts.set(entry.date, (dateCounts.get(entry.date) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-medium tracking-tight">All entries</h1>

      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href="/entries"
            className={`rounded-full px-2.5 py-1 text-xs transition-colors duration-150 ${
              !tag
                ? "bg-accent-soft text-accent"
                : "bg-surface-muted text-foreground-muted hover:text-foreground"
            }`}
          >
            All
          </Link>
          {allTags.map((t) => (
            <Link
              key={t.name}
              href={`/entries?tag=${encodeURIComponent(t.name)}`}
              className={`rounded-full px-2.5 py-1 text-xs transition-colors duration-150 ${
                tag === t.name
                  ? "bg-accent-soft text-accent"
                  : "bg-surface-muted text-foreground-muted hover:text-foreground"
              }`}
            >
              #{t.name} <span className="opacity-60">{t.count}</span>
            </Link>
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
          <span className="text-3xl">📔</span>
          <p className="text-sm text-foreground-muted">
            {tag
              ? `No entries tagged #${tag}.`
              : "No entries yet. Start writing on the Today page."}
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {entries.map((entry) => (
          <li key={entry.id}>
            <Link
              href={`/entry/${entry.date}/${entry.id}`}
              className="block rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {moodEmoji(entry.mood) && <span>{moodEmoji(entry.mood)}</span>}
                  <span>
                    {formatDate(entry.date)}
                    {(dateCounts.get(entry.date) ?? 0) > 1 &&
                      ` · ${formatTime(entry.created_at)}`}
                  </span>
                  {entry.hasImages && (
                    <span className="text-xs opacity-60" aria-label="Has photos">
                      📷
                    </span>
                  )}
                </div>
                <span className="text-xs text-foreground-muted">
                  {entry.wordCount} words
                </span>
              </div>
              <p className="prose-journal text-sm text-foreground-muted">
                {entry.content ? preview(entry.content) : "Empty entry"}
              </p>
              <TagChips tags={entry.tags} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
