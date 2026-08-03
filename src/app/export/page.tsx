import MarkdownPreview from "@/components/MarkdownPreview";
import PrintButton from "@/components/PrintButton";
import { toDateString } from "@/lib/date";
import { getEntriesInRange } from "@/lib/entries";
import { getImagesForEntry } from "@/lib/images";
import { MOODS } from "@/types";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function moodEmoji(mood: string | null) {
  return MOODS.find((m) => m.value === mood)?.emoji ?? null;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShort(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function defaultRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start: toDateString(start), end: toDateString(now) };
}

export default async function ExportPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const defaults = defaultRange();
  const start = params.start && DATE_RE.test(params.start) ? params.start : defaults.start;
  const end = params.end && DATE_RE.test(params.end) ? params.end : defaults.end;

  const entries = getEntriesInRange(start, end);
  const imagesByEntry = new Map(
    entries.map((entry) => [entry.id, getImagesForEntry(entry.id)])
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-medium tracking-tight print:hidden">
        Export / Print
      </h1>

      <form
        method="GET"
        className="flex flex-wrap items-end gap-3 print:hidden"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground-muted">From</span>
          <input
            type="date"
            name="start"
            defaultValue={start}
            className="rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm shadow-sm focus:border-accent focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground-muted">To</span>
          <input
            type="date"
            name="end"
            defaultValue={end}
            className="rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm shadow-sm focus:border-accent focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="rounded-full border border-border-subtle px-4 py-2 text-sm text-foreground-muted transition-colors duration-150 hover:bg-surface-hover"
        >
          Update range
        </button>
        <PrintButton />
      </form>

      <p className="text-sm text-foreground-muted print:hidden">
        {entries.length} {entries.length === 1 ? "entry" : "entries"} from{" "}
        {formatShort(start)} to {formatShort(end)}
      </p>

      {/* Printable content: fixed neutral colors, independent of the active
          theme, so the PDF/printout always reads cleanly on white paper. */}
      <div className="flex flex-col gap-8 text-gray-900 print:text-black">
        <div className="hidden text-center print:block">
          <h1 className="text-2xl font-semibold">Journal</h1>
          <p className="text-sm text-gray-500">
            {formatShort(start)} – {formatShort(end)}
          </p>
        </div>

        {entries.length === 0 && (
          <p className="text-sm text-gray-500">No entries in this range.</p>
        )}

        {entries.map((entry) => {
          const images = imagesByEntry.get(entry.id) ?? [];
          return (
            <article
              key={entry.id}
              className="flex flex-col gap-2 break-inside-avoid border-b border-gray-200 pb-6 print:border-gray-300"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium">{formatDate(entry.date)}</h2>
                {moodEmoji(entry.mood) && <span>{moodEmoji(entry.mood)}</span>}
              </div>
              {entry.tags.length > 0 && (
                <p className="text-xs text-gray-500">
                  {entry.tags.map((t) => `#${t}`).join("  ")}
                </p>
              )}
              <div className="prose-journal text-[15px] text-gray-900">
                <MarkdownPreview content={entry.content} />
              </div>
              {images.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {images.map((img) => (
                    // eslint-disable-next-line @next/next/no-img-element -- local dynamic image served from our own API route, not a next/image candidate
                    <img
                      key={img.id}
                      src={`/api/images/${img.filename}`}
                      alt=""
                      className="h-28 w-28 rounded-lg border border-gray-200 object-cover"
                    />
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
