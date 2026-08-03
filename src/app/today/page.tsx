import Editor from "@/components/Editor";
import { getEntry, todayDateString } from "@/lib/entries";
import { getImagesForDate } from "@/lib/images";

export const dynamic = "force-dynamic";

export default function TodayPage() {
  const date = todayDateString();
  const entry = getEntry(date);
  const images = getImagesForDate(date);

  return (
    <Editor
      key={date}
      date={date}
      initialContent={entry?.content ?? ""}
      initialMood={entry?.mood ?? null}
      initialImages={images}
      isToday
    />
  );
}
