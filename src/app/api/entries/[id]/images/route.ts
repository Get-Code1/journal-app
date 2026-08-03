import { NextRequest, NextResponse } from "next/server";
import { getEntryById } from "@/lib/entries";
import { addImage, getImagesForEntry } from "@/lib/images";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
  return NextResponse.json({ images: getImagesForEntry(id) });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const entry = getEntryById(id);
  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const files = formData.getAll("file").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const created = [];
  for (const file of files) {
    const ext = ALLOWED_TYPES[file.type];
    if (!ext || file.size === 0 || file.size > MAX_FILE_SIZE) continue;
    const buffer = Buffer.from(await file.arrayBuffer());
    created.push(addImage(id, entry.date, buffer, ext));
  }

  if (created.length === 0) {
    return NextResponse.json(
      { error: "No valid image files (jpeg/png/gif/webp, up to 10MB)" },
      { status: 400 }
    );
  }

  return NextResponse.json({ images: created });
}
