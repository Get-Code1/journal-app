import Link from "next/link";
import DayView from "@/components/DayView";
import Editor from "@/components/Editor";
import { getEntriesForDate, wordCount } from "@/lib/entries";
import { getImagesForEntry } from "@/lib/images";

// Shared by /today and /entry/[date]: shows a direct editor for the common
// single-entry-per-day case (matches the original one-entry-a-day design),
// and only switches to a day list once a second entry has been added.
export default function DayEntryPoint({
  date,
  isToday,
}: {
  date: string;
  isToday?: boolean;
}) {
  const entries = getEntriesForDate(date);

  if (entries.length === 0) {
    return (
      <Editor
        date={date}
        entryId={null}
        initialContent=""
        initialMood={null}
        initialImages={[]}
        isToday={isToday}
        keepUrlOnCreate={isToday}
      />
    );
  }

  if (entries.length === 1) {
    const entry = entries[0];
    const images = getImagesForEntry(entry.id);
    return (
      <div className="flex flex-col gap-3">
        <Editor
          date={date}
          entryId={entry.id}
          initialContent={entry.content}
          initialMood={entry.mood}
          initialImages={images}
          isToday={isToday}
        />
        <Link
          href={`/entry/${date}/new`}
          className="self-start text-sm text-foreground-muted transition-colors hover:text-foreground"
        >
          + Add another entry for this day
        </Link>
      </div>
    );
  }

  const summaries = entries.map((entry) => ({
    ...entry,
    wordCount: wordCount(entry.content),
    hasImages: getImagesForEntry(entry.id).length > 0,
  }));

  return <DayView date={date} entries={summaries} isToday={isToday} />;
}
