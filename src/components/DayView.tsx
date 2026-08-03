import Link from "next/link";
import TagChips from "@/components/TagChips";
import type { EntrySummary } from "@/types";
import { MOODS } from "@/types";

function formatDateHeading(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
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

function moodEmoji(mood: string | null) {
  return MOODS.find((m) => m.value === mood)?.emoji ?? null;
}

function preview(content: string): string {
  const flat = content.replace(/\s+/g, " ").trim();
  return flat.length > 140 ? `${flat.slice(0, 140)}…` : flat;
}

export default function DayView({
  date,
  entries,
  isToday,
}: {
  date: string;
  entries: EntrySummary[];
  isToday?: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium tracking-tight">
            {isToday ? "Today" : formatDateHeading(date)}
          </h1>
          {isToday && (
            <p className="text-sm text-foreground-muted">
              {formatDateHeading(date)}
            </p>
          )}
        </div>
        <Link
          href={`/entry/${date}/new`}
          className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover active:scale-95"
        >
          + Add entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
          <span className="text-2xl">📔</span>
          <p className="text-sm text-foreground-muted">
            No entries for this day yet.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/entry/${date}/${entry.id}`}
                className="block rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {moodEmoji(entry.mood) && <span>{moodEmoji(entry.mood)}</span>}
                    <span>{formatTime(entry.created_at)}</span>
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
      )}
    </div>
  );
}
