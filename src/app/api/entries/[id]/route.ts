import { NextRequest, NextResponse } from "next/server";
import { deleteEntry, getEntryById, updateEntry, wordCount } from "@/lib/entries";
import { readJsonBody } from "@/lib/http";
import { getImagesForEntry } from "@/lib/images";
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

  const entry = updateEntry(id, content, mood);
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ entry, wordCount: wordCount(entry.content) });
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
