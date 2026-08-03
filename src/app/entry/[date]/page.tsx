import Link from "next/link";
import { notFound } from "next/navigation";
import Editor from "@/components/Editor";
import { getEntry, todayDateString } from "@/lib/entries";

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
  const isToday = date === todayDateString();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/calendar"
        className="w-fit text-sm text-foreground/50 hover:text-foreground"
      >
        ← Back to calendar
      </Link>
      <Editor
        key={date}
        date={date}
        initialContent={entry?.content ?? ""}
        initialMood={entry?.mood ?? null}
        isToday={isToday}
      />
    </div>
  );
}
