import Link from "next/link";
import { notFound } from "next/navigation";
import Editor from "@/components/Editor";
import { todayDateString } from "@/lib/entries";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const dynamic = "force-dynamic";

export default async function NewEntryPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!DATE_RE.test(date)) notFound();

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
        date={date}
        entryId={null}
        initialContent=""
        initialMood={null}
        initialTags={[]}
        initialImages={[]}
        isToday={isToday}
      />
    </div>
  );
}
