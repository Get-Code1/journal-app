import db from "@/lib/db";

export interface Settings {
  displayName: string;
  weeklyGoal: number;
  monthlyGoal: number;
}

const DEFAULTS: Settings = { displayName: "", weeklyGoal: 5, monthlyGoal: 20 };

interface SettingsRow {
  display_name: string;
  weekly_goal: number;
  monthly_goal: number;
}

function ensureRow(): void {
  db.prepare(
    `INSERT OR IGNORE INTO settings (id, display_name, weekly_goal, monthly_goal) VALUES (1, ?, ?, ?)`
  ).run(DEFAULTS.displayName, DEFAULTS.weeklyGoal, DEFAULTS.monthlyGoal);
}

export function getSettings(): Settings {
  ensureRow();
  const row = db
    .prepare(
      "SELECT display_name, weekly_goal, monthly_goal FROM settings WHERE id = 1"
    )
    .get() as unknown as SettingsRow;
  return {
    displayName: row.display_name,
    weeklyGoal: row.weekly_goal,
    monthlyGoal: row.monthly_goal,
  };
}

export function updateSettings(partial: Partial<Settings>): Settings {
  const next = { ...getSettings(), ...partial };
  db.prepare(
    `UPDATE settings SET display_name = ?, weekly_goal = ?, monthly_goal = ? WHERE id = 1`
  ).run(next.displayName, next.weeklyGoal, next.monthlyGoal);
  return next;
}
