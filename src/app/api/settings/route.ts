import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/settings";

export async function GET() {
  return NextResponse.json(getSettings());
}

export async function PUT(request: NextRequest) {
  const body = await request.json();

  const displayName =
    typeof body.displayName === "string" ? body.displayName.slice(0, 60) : undefined;

  const weeklyGoal =
    typeof body.weeklyGoal === "number" &&
    Number.isFinite(body.weeklyGoal) &&
    body.weeklyGoal >= 1 &&
    body.weeklyGoal <= 7
      ? Math.round(body.weeklyGoal)
      : undefined;

  const monthlyGoal =
    typeof body.monthlyGoal === "number" &&
    Number.isFinite(body.monthlyGoal) &&
    body.monthlyGoal >= 1 &&
    body.monthlyGoal <= 31
      ? Math.round(body.monthlyGoal)
      : undefined;

  const settings = updateSettings({
    ...(displayName !== undefined && { displayName }),
    ...(weeklyGoal !== undefined && { weeklyGoal }),
    ...(monthlyGoal !== undefined && { monthlyGoal }),
  });

  return NextResponse.json(settings);
}
