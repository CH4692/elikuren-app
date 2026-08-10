import { splitCmsParagraphs } from "@/lib/site-content/text";
import { cn } from "@/lib/utils";

/** Renders CMS long-text as semantic paragraphs (no HTML). */
export function CmsParagraphs({
  text,
  className,
  paragraphClassName,
}: {
  text: string;
  className?: string;
  paragraphClassName?: string;
}) {
  const paragraphs = splitCmsParagraphs(text);
  if (paragraphs.length === 0) return null;
  return (
    <div className={cn("space-y-4", className)}>
      {paragraphs.map((paragraph, index) => (
        <p key={`p-${index}`} className={paragraphClassName}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
