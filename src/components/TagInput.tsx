"use client";

import { useState } from "react";

export default function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const value = draft.trim().replace(/^#+/, "").toLowerCase();
    if (value && !tags.includes(value)) {
      onChange([...tags, value]);
    }
    setDraft("");
  }

  function remove(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent"
        >
          #{tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            aria-label={`Remove ${tag} tag`}
            className="text-accent/70 transition-colors hover:text-accent"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
            remove(tags[tags.length - 1]);
          }
        }}
        onBlur={commit}
        placeholder="Add tag…"
        className="min-w-[90px] flex-1 bg-transparent py-1 text-sm text-foreground placeholder:text-foreground-muted/70 focus:outline-none"
      />
    </div>
  );
}
