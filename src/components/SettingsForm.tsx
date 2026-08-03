"use client";

import { useState } from "react";
import SavedIndicator, { type SaveStatus } from "@/components/SavedIndicator";
import type { Settings } from "@/lib/settings";

export default function SettingsForm({
  initialSettings,
}: {
  initialSettings: Settings;
}) {
  const [displayName, setDisplayName] = useState(initialSettings.displayName);
  const [weeklyGoal, setWeeklyGoal] = useState(initialSettings.weeklyGoal);
  const [monthlyGoal, setMonthlyGoal] = useState(initialSettings.monthlyGoal);
  const [status, setStatus] = useState<SaveStatus>("idle");

  async function save(next: {
    displayName: string;
    weeklyGoal: number;
    monthlyGoal: number;
  }) {
    setStatus("saving");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error("Save failed");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Profile &amp; goals</h2>
          <p className="text-sm text-foreground-muted">
            Used for your dashboard greeting and progress bars.
          </p>
        </div>
        <SavedIndicator status={status} />
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-foreground-muted">Your name</span>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          onBlur={() => save({ displayName, weeklyGoal, monthlyGoal })}
          placeholder="e.g. Alex"
          maxLength={60}
          className="w-full max-w-xs rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm shadow-sm focus:border-accent focus:outline-none"
        />
      </label>

      <div className="flex flex-wrap gap-6">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-foreground-muted">Weekly goal (entries)</span>
          <input
            type="number"
            min={1}
            max={7}
            value={weeklyGoal}
            onChange={(e) => setWeeklyGoal(Number(e.target.value))}
            onBlur={() => save({ displayName, weeklyGoal, monthlyGoal })}
            className="w-24 rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm shadow-sm focus:border-accent focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-foreground-muted">Monthly goal (entries)</span>
          <input
            type="number"
            min={1}
            max={31}
            value={monthlyGoal}
            onChange={(e) => setMonthlyGoal(Number(e.target.value))}
            onBlur={() => save({ displayName, weeklyGoal, monthlyGoal })}
            className="w-24 rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm shadow-sm focus:border-accent focus:outline-none"
          />
        </label>
      </div>
    </div>
  );
}
