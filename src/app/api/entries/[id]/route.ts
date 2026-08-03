import { NextRequest, NextResponse } from "next/server";
import { deleteEntry, getEntryById, updateEntry, wordCount } from "@/lib/entries";
import { readJsonBody } from "@/lib/http";
import { getImagesForEntry } from "@/lib/images";
import { getTagsForEntry } from "@/lib/tags";
import type { Mood } from "@/types";

const VALID_MOODS: Mood[] = ["great", "good", "okay", "low", "rough"];

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) ? id : null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const entry = getEntryById(id);
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    entry,
    wordCount: wordCount(entry.content),
    images: getImagesForEntry(id),
    tags: getTagsForEntry(id),
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await readJsonBody(request);
  if (body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const content = typeof body.content === "string" ? body.content : "";
  const mood: Mood | null =
    typeof body.mood === "string" && VALID_MOODS.includes(body.mood as Mood)
      ? (body.mood as Mood)
      : null;
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t: unknown): t is string => typeof t === "string")
    : undefined;

  const entry = updateEntry(id, content, mood, tags);
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    entry,
    wordCount: wordCount(entry.content),
    tags: getTagsForEntry(id),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const ok = deleteEntry(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
