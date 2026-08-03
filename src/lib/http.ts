import type { NextRequest } from "next/server";

// Returns null instead of throwing on an empty/malformed body (e.g. a
// request the browser aborted mid-flight), so route handlers can respond
// with a clean 400 rather than an uncaught exception.
export async function readJsonBody(
  request: NextRequest
): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? body : null;
  } catch {
    return null;
  }
}
