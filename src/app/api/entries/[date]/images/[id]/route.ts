import { NextRequest, NextResponse } from "next/server";
import { deleteImage } from "@/lib/images";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string; id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const ok = deleteImage(numId);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
