/** Split CMS textarea content on blank lines into paragraphs. */
export function splitCmsParagraphs(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}
