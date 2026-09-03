function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hasHtmlMarkup(value: string) {
  return /<\/?[a-z][^>]*>/i.test(value);
}

/** Convert the legacy plain-text format into real, spaced paragraphs. */
export function plainTextToArticleHtml(value: string) {
  const normalized = value.replace(/\r\n?/g, "\n").trim();
  if (!normalized) return "";

  return normalized
    .split(/\n\s*\n/)
    .map((paragraph) => {
      const lines = paragraph
        .split("\n")
        .map((line) => escapeHtml(line.trim()))
        .filter(Boolean);
      return lines.length ? `<p>${lines.join("<br />")}</p>` : "";
    })
    .filter(Boolean)
    .join("\n");
}

/** Return content as editor-ready HTML without changing already-formatted content. */
export function articleContentToEditorHtml(value: string) {
  const normalized = value.trim();
  return normalized && hasHtmlMarkup(normalized)
    ? normalized
    : plainTextToArticleHtml(value);
}

/** Return content suitable for the public article renderer. */
export function articleContentToDisplayHtml(value: string) {
  return articleContentToEditorHtml(value);
}
