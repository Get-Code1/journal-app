import { NextRequest, NextResponse } from "next/server";
import {
  createEntry,
  getAllEntries,
  getEntriesForDate,
  getEntriesInRange,
  searchEntries,
} from "@/lib/entries";
import { readJsonBody } from "@/lib/http";
import type { Mood } from "@/types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_MOODS: Mood[] = ["great", "good", "okay", "low", "rough"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const date = searchParams.get("date");

  if (q) {
    return NextResponse.json({ results: searchEntries(q) });
  }

  if (date) {
    if (!DATE_RE.test(date)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    return NextResponse.json({ entries: getEntriesForDate(date) });
  }

  if (start && end) {
    return NextResponse.json({ entries: getEntriesInRange(start, end) });
  }

  return NextResponse.json({ entries: getAllEntries() });
}

export async function POST(request: NextRequest) {
  const body = await readJsonBody(request);
  if (body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const date = typeof body.date === "string" ? body.date : "";
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content : "";
  const mood: Mood | null =
    typeof body.mood === "string" && VALID_MOODS.includes(body.mood as Mood)
      ? (body.mood as Mood)
      : null;

  const entry = createEntry(date, content, mood);
  return NextResponse.json({ entry });
}
