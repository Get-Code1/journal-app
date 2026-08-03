import Link from "next/link";
import { notFound } from "next/navigation";
import Editor from "@/components/Editor";
import { getEntry, todayDateString } from "@/lib/entries";
import { getImagesForDate } from "@/lib/images";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const dynamic = "force-dynamic";

export default async function EntryPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!DATE_RE.test(date)) notFound();

  const entry = getEntry(date);
  const images = getImagesForDate(date);
  const isToday = date === todayDateString();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/calendar"
        className="w-fit text-sm text-foreground-muted transition-colors hover:text-foreground"
      >
        ← Back to calendar
      </Link>
      <Editor
        key={date}
        date={date}
        initialContent={entry?.content ?? ""}
        initialMood={entry?.mood ?? null}
        initialImages={images}
        isToday={isToday}
      />
    </div>
  );
}
