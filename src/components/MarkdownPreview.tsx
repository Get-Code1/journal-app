import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownPreview({ content }: { content: string }) {
  if (!content.trim()) {
    return (
      <p className="prose-journal text-foreground-muted/70">
        Nothing to preview yet.
      </p>
    );
  }

  return (
    <div className="prose-journal">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
