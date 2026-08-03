import { NextRequest, NextResponse } from "next/server";
import { addImage, getImagesForDate } from "@/lib/images";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  return NextResponse.json({ images: getImagesForDate(date) });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
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
    created.push(addImage(date, buffer, ext));
  }

  if (created.length === 0) {
    return NextResponse.json(
      { error: "No valid image files (jpeg/png/gif/webp, up to 10MB)" },
      { status: 400 }
    );
  }

  return NextResponse.json({ images: created });
}
