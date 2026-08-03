"use client";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function SavedIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  const text =
    status === "saving"
      ? "Saving…"
      : status === "saved"
      ? "Saved"
      : "Couldn't save";

  const color = status === "error" ? "text-red-500" : "text-foreground-muted";

  return (
    <span
      key={status}
      className={`animate-fade-in text-xs transition-opacity ${color}`}
    >
      {text}
    </span>
  );
}
