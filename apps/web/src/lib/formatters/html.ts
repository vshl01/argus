/**
 * Convert the HTML that news feeds embed in titles/snippets into clean,
 * readable plain text.
 *
 * RSS `description` fields routinely contain markup (`<p>`, `<a>`, `<img>`),
 * HTML entities (`&amp;`, `&#39;`), and tracking junk. Rendering that raw looks
 * broken; rendering it as HTML would be an XSS risk. So we strip tags (keeping
 * paragraph/line breaks as newlines) and let the browser decode entities for
 * us — safe, dependency-free, and reads well in the reader popup.
 */
export function htmlToText(html: string | null | undefined): string {
  if (!html) return "";

  // Preserve meaningful breaks before tags are stripped.
  const withBreaks = html
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/\s*(p|div|li|h[1-6]|blockquote|tr)\s*>/gi, "\n");

  let text: string;
  if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
    // textContent of a parsed (but never-attached) document decodes entities
    // and drops tags without executing scripts or loading resources.
    const doc = new DOMParser().parseFromString(withBreaks, "text/html");
    text = doc.body.textContent ?? "";
  } else {
    text = withBreaks.replace(/<[^>]*>/g, "");
  }

  // Tidy whitespace per line, drop blank lines.
  return text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

/** Split cleaned text into paragraphs for rendering. */
export function toParagraphs(html: string | null | undefined): string[] {
  const text = htmlToText(html);
  return text ? text.split("\n") : [];
}
