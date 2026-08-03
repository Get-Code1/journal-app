"use client";

export type MarkdownAction = "bold" | "italic" | "heading" | "list";
export type EditorMode = "write" | "preview";

const BUTTONS: { action: MarkdownAction; label: string; title: string; className?: string }[] = [
  { action: "bold", label: "B", title: "Bold", className: "font-bold" },
  { action: "italic", label: "I", title: "Italic", className: "italic" },
  { action: "heading", label: "H", title: "Heading" },
  { action: "list", label: "•", title: "Bullet list" },
];

export default function MarkdownToolbar({
  mode,
  onModeChange,
  onAction,
}: {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  onAction: (action: MarkdownAction) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        {BUTTONS.map((btn) => (
          <button
            key={btn.action}
            type="button"
            title={btn.title}
            aria-label={btn.title}
            onClick={() => onAction(btn.action)}
            disabled={mode === "preview"}
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm text-foreground-muted transition-colors duration-150 hover:bg-surface-hover hover:text-foreground disabled:opacity-40 ${btn.className ?? ""}`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-0.5 rounded-full bg-surface-muted p-0.5 text-xs">
        <button
          type="button"
          onClick={() => onModeChange("write")}
          className={`rounded-full px-2.5 py-1 transition-colors duration-150 ${
            mode === "write"
              ? "bg-surface text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => onModeChange("preview")}
          className={`rounded-full px-2.5 py-1 transition-colors duration-150 ${
            mode === "preview"
              ? "bg-surface text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          Preview
        </button>
      </div>
    </div>
  );
}
