import { NextRequest, NextResponse } from "next/server";
import { getEntry, upsertEntry, wordCount } from "@/lib/entries";
import { getImagesForDate } from "@/lib/images";
import type { Mood } from "@/types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_MOODS: Mood[] = ["great", "good", "okay", "low", "rough"];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const entry = getEntry(date);
  const images = getImagesForDate(date);

  if (!entry) {
    return NextResponse.json({
      entry: {
        date,
        content: "",
        mood: null,
        created_at: null,
        updated_at: null,
      },
      wordCount: 0,
      images,
    });
  }

  return NextResponse.json({
    entry,
    wordCount: wordCount(entry.content),
    images,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const body = await request.json();
  const content = typeof body.content === "string" ? body.content : "";
  const mood: Mood | null =
    body.mood && VALID_MOODS.includes(body.mood) ? body.mood : null;

  const entry = upsertEntry(date, content, mood);
  return NextResponse.json({ entry, wordCount: wordCount(entry.content) });
}
