export type Mood = "great" | "good" | "okay" | "low" | "rough";

export const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: "great", emoji: "😄", label: "Great" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "low", emoji: "😕", label: "Low" },
  { value: "rough", emoji: "😞", label: "Rough" },
];

export const MOOD_COLORS: Record<Mood, string> = {
  great: "#4ade80",
  good: "#86efac",
  okay: "#fde68a",
  low: "#fdba74",
  rough: "#fca5a5",
};

export interface Entry {
  date: string; // "YYYY-MM-DD"
  content: string;
  mood: Mood | null;
  created_at: string;
  updated_at: string;
}

export interface EntrySummary extends Entry {
  wordCount: number;
}
