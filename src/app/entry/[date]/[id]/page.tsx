import Link from "next/link";
import { notFound } from "next/navigation";
import Editor from "@/components/Editor";
import { getEntryById, todayDateString } from "@/lib/entries";
import { getImagesForEntry } from "@/lib/images";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const dynamic = "force-dynamic";

export default async function EntryByIdPage({
  params,
}: {
  params: Promise<{ date: string; id: string }>;
}) {
  const { date, id } = await params;
  const entryId = Number(id);
  if (!DATE_RE.test(date) || !Number.isInteger(entryId)) notFound();

  const entry = getEntryById(entryId);
  if (!entry || entry.date !== date) notFound();

  const images = getImagesForEntry(entryId);
  const isToday = date === todayDateString();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={isToday ? "/today" : `/entry/${date}`}
        className="w-fit text-sm text-foreground-muted transition-colors hover:text-foreground"
      >
        ← Back to this day
      </Link>
      <Editor
        key={entryId}
        date={date}
        entryId={entryId}
        initialContent={entry.content}
        initialMood={entry.mood}
        initialImages={images}
        isToday={isToday}
      />
    </div>
  );
}
