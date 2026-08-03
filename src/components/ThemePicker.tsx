"use client";

import { useTheme } from "@/components/ThemeProvider";
import { THEMES, THEME_LABELS, THEME_SWATCHES } from "@/lib/theme";

export default function ThemePicker() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {THEMES.map((t) => {
        const swatch = THEME_SWATCHES[t];
        const selected = theme === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => setTheme(t)}
            aria-pressed={selected}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all duration-150 ${
              selected
                ? "border-accent shadow-sm"
                : "border-border-subtle hover:border-border hover:bg-surface-hover"
            }`}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/5"
              style={{ backgroundColor: swatch.bg }}
            >
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: swatch.accent }}
              />
            </span>
            <span
              className={`text-xs ${selected ? "font-medium text-accent" : "text-foreground-muted"}`}
            >
              {THEME_LABELS[t]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
