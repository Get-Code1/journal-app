import DayEntryPoint from "@/components/DayEntryPoint";
import { todayDateString } from "@/lib/entries";

export const dynamic = "force-dynamic";

export default function TodayPage() {
  const date = todayDateString();
  return <DayEntryPoint key={date} date={date} isToday />;
}
