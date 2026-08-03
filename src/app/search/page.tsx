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
      <h1 className="text-xl font-medium tracking-tight">Search</h1>

      <form method="GET" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search your entries…"
          autoFocus
          className="flex-1 rounded-full border border-border-subtle bg-surface px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white"
        >
          Search
        </button>
      </form>

      {query && (
        <p className="text-sm text-foreground/50">
          {`${results.length} result${results.length === 1 ? "" : "s"} for “${query}”`}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {results.map((result) => (
          <li key={result.date}>
            <Link
              href={`/entry/${result.date}`}
              className="block rounded-2xl border border-border-subtle bg-surface p-4 hover:border-accent"
            >
              <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                {moodEmoji(result.mood) && <span>{moodEmoji(result.mood)}</span>}
                <span>{formatDate(result.date)}</span>
              </div>
              <p className="text-sm text-foreground/60">{result.snippet}</p>
            </Link>
          </li>
        ))}
      </ul>

      {query && results.length === 0 && (
        <p className="text-sm text-foreground/40">No entries found.</p>
      )}
    </div>
  );
}
