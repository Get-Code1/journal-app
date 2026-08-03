import Link from "next/link";
import { searchEntries } from "@/lib/entries";
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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? searchEntries(query) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-medium tracking-tight">Search</h1>
        <Link
          href="/entries"
          className="text-sm text-foreground-muted transition-colors hover:text-foreground"
        >
          Browse all entries →
        </Link>
      </div>

      <form method="GET" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search your entries…"
          autoFocus
          className="flex-1 rounded-full border border-border-subtle bg-surface px-4 py-2.5 text-sm shadow-sm transition-shadow focus:border-accent focus:shadow-md focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover active:scale-95"
        >
          Search
        </button>
      </form>

      {query && (
        <p className="text-sm text-foreground-muted">
          {`${results.length} result${results.length === 1 ? "" : "s"} for “${query}”`}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {results.map((result) => (
          <li key={result.date}>
            <Link
              href={`/entry/${result.date}`}
              className="block rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
            >
              <div className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                {moodEmoji(result.mood) && <span>{moodEmoji(result.mood)}</span>}
                <span>{formatDate(result.date)}</span>
                {result.hasImages && (
                  <span className="text-xs opacity-60" aria-label="Has photos">
                    📷
                  </span>
                )}
              </div>
              <p className="prose-journal text-sm text-foreground-muted">
                {result.snippet}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {query && results.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
          <span className="text-3xl">🔍</span>
          <p className="text-sm text-foreground-muted">
            No entries match &ldquo;{query}&rdquo;.
          </p>
        </div>
      )}

      {!query && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
          <span className="text-3xl">📝</span>
          <p className="text-sm text-foreground-muted">
            Search for a word or phrase from any of your entries.
          </p>
        </div>
      )}
    </div>
  );
}
