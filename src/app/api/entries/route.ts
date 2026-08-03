import { NextRequest, NextResponse } from "next/server";
import { getAllEntries, getEntriesInRange, searchEntries } from "@/lib/entries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (q) {
    return NextResponse.json({ results: searchEntries(q) });
  }

  if (start && end) {
    return NextResponse.json({ entries: getEntriesInRange(start, end) });
  }

  return NextResponse.json({ entries: getAllEntries() });
}
