"use client";

import { MOODS, type Mood } from "@/types";

interface MoodPickerProps {
  value: Mood | null;
  onChange: (mood: Mood) => void;
}

export default function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="flex items-center gap-1.5">
      {MOODS.map((mood) => {
        const selected = value === mood.value;
        return (
          <button
            key={mood.value}
            type="button"
            onClick={() => onChange(mood.value)}
            title={mood.label}
            aria-label={mood.label}
            aria-pressed={selected}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-xl transition-all ${
              selected
                ? "bg-accent-soft ring-2 ring-accent scale-105"
                : "hover:bg-surface-muted opacity-60 hover:opacity-100"
            }`}
          >
            {mood.emoji}
          </button>
        );
      })}
    </div>
  );
}
