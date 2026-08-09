"use client";

type EmailTypoHintProps = {
  suggestion: string | null;
  onApply: (email: string) => void;
  className?: string;
};

/** Non-blocking typo hint — does not block submit by itself. */
export function EmailTypoHint({
  suggestion,
  onApply,
  className = "text-xs text-[#C8A24D]/90",
}: EmailTypoHintProps) {
  if (!suggestion) return null;
  return (
    <p className={className}>
      Meintest du{" "}
      <button
        type="button"
        className="font-medium underline underline-offset-2 hover:text-[#d4b35e]"
        onClick={() => onApply(suggestion)}
      >
        {suggestion}
      </button>
      ?
    </p>
  );
}
