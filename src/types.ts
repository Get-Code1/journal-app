export type Mood = "great" | "good" | "okay" | "low" | "rough";

export const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: "great", emoji: "😄", label: "Great" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "low", emoji: "😕", label: "Low" },
  { value: "rough", emoji: "😞", label: "Rough" },
];

// A diverging red -> neutral gray -> green scale (rough..great), with a true
// gray midpoint so no hue sits at "okay" — validated for contrast against
// both light and dark surfaces (see dataviz skill).
export const MOOD_COLORS: Record<Mood, string> = {
  rough: "#B3412E",
  low: "#C97862",
  okay: "#8F8D85",
  good: "#6B9159",
  great: "#4C7A3D",
};

// 1 (rough) .. 5 (great), for charting mood as a magnitude over time.
export const MOOD_VALUES: Record<Mood, number> = {
  rough: 1,
  low: 2,
  okay: 3,
  good: 4,
  great: 5,
};

export interface Entry {
  id: number;
  date: string; // "YYYY-MM-DD"
  content: string;
  mood: Mood | null;
  created_at: string;
  updated_at: string;
}

export interface EntrySummary extends Entry {
  wordCount: number;
  hasImages: boolean;
  tags: string[];
}

export interface ImageAttachment {
  id: number;
  entryId: number;
  date: string;
  filename: string;
  createdAt: string;
}
