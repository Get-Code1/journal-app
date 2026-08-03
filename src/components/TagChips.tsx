export default function TagChips({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-foreground-muted"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
