"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import MarkdownPreview from "@/components/MarkdownPreview";
import MarkdownToolbar, {
  type EditorMode,
  type MarkdownAction,
} from "@/components/MarkdownToolbar";
import MoodPicker from "@/components/MoodPicker";
import SavedIndicator, { type SaveStatus } from "@/components/SavedIndicator";
import TagInput from "@/components/TagInput";
import type { ImageAttachment, Mood } from "@/types";

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
  entryId: number | null;
  initialContent: string;
  initialMood: Mood | null;
  initialTags: string[];
  initialImages: ImageAttachment[];
  isToday?: boolean;
  // When creating a brand new entry, stay on the current URL instead of
  // redirecting to /entry/[date]/[id] — used by /today so the daily-use
  // flow keeps its single, stable URL.
  keepUrlOnCreate?: boolean;
}

const AUTOSAVE_DELAY = 900;

export default function Editor({
  date,
  entryId,
  initialContent,
  initialMood,
  initialTags,
  initialImages,
  isToday,
  keepUrlOnCreate,
}: EditorProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [mood, setMood] = useState<Mood | null>(initialMood);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [id, setId] = useState<number | null>(entryId);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [deleting, setDeleting] = useState(false);
  const [mode, setMode] = useState<EditorMode>("write");

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef({ content: initialContent, mood: initialMood, tags: initialTags });
  const idRef = useRef<number | null>(entryId);
  const creating = useRef<Promise<number> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ensureEntryId = useCallback(async (): Promise<number> => {
    if (idRef.current !== null) return idRef.current;
    if (creating.current) return creating.current;

    creating.current = (async () => {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, content: "", mood: null }),
      });
      const data = await res.json();
      idRef.current = data.entry.id;
      setId(data.entry.id);
      return data.entry.id as number;
    })();

    return creating.current;
  }, [date]);

  const save = useCallback(
    async (nextContent: string, nextMood: Mood | null, nextTags: string[]) => {
      setStatus("saving");
      try {
        const wasNew = idRef.current === null;
        const currentId = await ensureEntryId();
        const res = await fetch(`/api/entries/${currentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: nextContent, mood: nextMood, tags: nextTags }),
        });
        if (!res.ok) throw new Error("Save failed");
        setStatus("saved");
        if (savedTimeout.current) clearTimeout(savedTimeout.current);
        savedTimeout.current = setTimeout(() => setStatus("idle"), 2000);
        // Give a new entry a stable, bookmarkable URL once it's actually
        // saved. Delayed slightly so the "Saved" confirmation is visible
        // for a moment before the route swaps out from under it.
        if (wasNew && !keepUrlOnCreate) {
          setTimeout(() => router.replace(`/entry/${date}/${currentId}`), 600);
        }
      } catch {
        setStatus("error");
      }
    },
    [ensureEntryId, date, keepUrlOnCreate, router]
  );

  const scheduleSave = useCallback(
    (nextContent: string, nextMood: Mood | null, nextTags: string[]) => {
      latest.current = { content: nextContent, mood: nextMood, tags: nextTags };
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        save(latest.current.content, latest.current.mood, latest.current.tags);
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
    scheduleSave(value, mood, tags);
  }

  function handleMoodChange(value: Mood) {
    setMood(value);
    scheduleSave(content, value, tags);
  }

  function handleTagsChange(value: string[]) {
    setTags(value);
    scheduleSave(content, mood, value);
  }

  function wrapSelection(before: string, after: string, placeholder: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const nextValue =
      content.slice(0, start) + before + selected + after + content.slice(end);
    handleContentChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorStart = start + before.length;
      textarea.setSelectionRange(cursorStart, cursorStart + selected.length);
    });
  }

  function prefixLine(prefix: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const nextValue = content.slice(0, lineStart) + prefix + content.slice(lineStart);
    handleContentChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + prefix.length;
      textarea.setSelectionRange(pos, pos);
    });
  }

  function handleToolbarAction(action: MarkdownAction) {
    switch (action) {
      case "bold":
        wrapSelection("**", "**", "bold text");
        break;
      case "italic":
        wrapSelection("*", "*", "italic text");
        break;
      case "heading":
        prefixLine("## ");
        break;
      case "list":
        prefixLine("- ");
        break;
    }
  }

  async function handleDelete() {
    if (id === null) return;
    if (!confirm("Delete this entry? This can't be undone.")) return;

    setDeleting(true);
    try {
      await fetch(`/api/entries/${id}`, { method: "DELETE" });
      router.push(isToday ? "/today" : `/entry/${date}`);
    } finally {
      setDeleting(false);
    }
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

      <div className="flex flex-col gap-2">
        <MarkdownToolbar
          mode={mode}
          onModeChange={setMode}
          onAction={handleToolbarAction}
        />

        {mode === "write" ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Write whatever's on your mind…"
            autoFocus
            className="prose-journal min-h-[50vh] w-full flex-1 resize-none rounded-2xl border border-border-subtle bg-surface p-6 text-[17px] text-foreground shadow-sm transition-shadow duration-200 placeholder:text-foreground-muted/70 focus:border-accent focus:shadow-md focus:outline-none"
          />
        ) : (
          <div className="min-h-[50vh] w-full overflow-y-auto rounded-2xl border border-border-subtle bg-surface p-6 text-[17px] text-foreground shadow-sm">
            <MarkdownPreview content={content} />
          </div>
        )}
      </div>

      <TagInput tags={tags} onChange={handleTagsChange} />

      <div className="flex items-center justify-between text-xs text-foreground-muted">
        <span>{countWords(content)} words</span>
        {id !== null && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-foreground-muted transition-colors hover:text-red-500 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete entry"}
          </button>
        )}
      </div>

      <ImageGallery
        entryId={id}
        initialImages={initialImages}
        ensureEntryId={ensureEntryId}
      />
    </div>
  );
}
