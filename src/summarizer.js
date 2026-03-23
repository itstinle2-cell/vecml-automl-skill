export function summarizeText(text, { maxSentences = 3 } = {}) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return 'No readable content found.';

  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length <= maxSentences) {
    return sentences.join(' ');
  }

  return sentences.slice(0, maxSentences).join(' ');
}
