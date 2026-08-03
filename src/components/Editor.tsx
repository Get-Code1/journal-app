"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MoodPicker from "@/components/MoodPicker";
import SavedIndicator, { type SaveStatus } from "@/components/SavedIndicator";
import type { Mood } from "@/types";

function formatDateHeading(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

interface EditorProps {
  date: string;
  initialContent: string;
  initialMood: Mood | null;
  isToday?: boolean;
}

const AUTOSAVE_DELAY = 900;

export default function Editor({
  date,
  initialContent,
  initialMood,
  isToday,
}: EditorProps) {
  const [content, setContent] = useState(initialContent);
  const [mood, setMood] = useState<Mood | null>(initialMood);
  const [status, setStatus] = useState<SaveStatus>("idle");

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef({ content: initialContent, mood: initialMood });

  const save = useCallback(
    async (nextContent: string, nextMood: Mood | null) => {
      setStatus("saving");
      try {
        const res = await fetch(`/api/entries/${date}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: nextContent, mood: nextMood }),
        });
        if (!res.ok) throw new Error("Save failed");
        setStatus("saved");
        if (savedTimeout.current) clearTimeout(savedTimeout.current);
        savedTimeout.current = setTimeout(() => setStatus("idle"), 2000);
      } catch {
        setStatus("error");
      }
    },
    [date]
  );

  const scheduleSave = useCallback(
    (nextContent: string, nextMood: Mood | null) => {
      latest.current = { content: nextContent, mood: nextMood };
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        save(latest.current.content, latest.current.mood);
      }, AUTOSAVE_DELAY);
    },
    [save]
  );

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      if (savedTimeout.current) clearTimeout(savedTimeout.current);
    };
  }, []);

  function handleContentChange(value: string) {
    setContent(value);
    scheduleSave(value, mood);
  }

  function handleMoodChange(value: Mood) {
    setMood(value);
    scheduleSave(content, value);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium tracking-tight">
            {isToday ? "Today" : formatDateHeading(date)}
          </h1>
          {isToday && (
            <p className="text-sm text-foreground-muted">
              {formatDateHeading(date)}
            </p>
          )}
        </div>
        <div className="pt-1">
          <SavedIndicator status={status} />
        </div>
      </div>

      <MoodPicker value={mood} onChange={handleMoodChange} />

      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="Write whatever's on your mind…"
        autoFocus
        className="prose-journal min-h-[50vh] w-full flex-1 resize-none rounded-2xl border border-border-subtle bg-surface p-6 text-[17px] text-foreground shadow-sm transition-shadow duration-200 placeholder:text-foreground-muted/70 focus:border-accent focus:shadow-md focus:outline-none"
      />

      <div className="flex items-center justify-between text-xs text-foreground-muted">
        <span>{countWords(content)} words</span>
      </div>
    </div>
  );
}
