function sentenceSplit(text) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function scoreSentence(sentence, keywords) {
  const normalized = sentence.toLowerCase();
  let score = Math.min(sentence.length / 80, 3);

  for (const keyword of keywords) {
    if (keyword && normalized.includes(keyword)) score += 2;
  }

  if (/is|are|was|were|refers to|official|documentation|encyclopedia|anime|manga|company|organization/i.test(sentence)) {
    score += 1;
  }

  return score;
}

export function summarizeText(text, { title = '', query = '', maxSentences = 3 } = {}) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return 'No readable content found.';

  const sentences = sentenceSplit(clean)
    .filter((sentence) => sentence.length > 40)
    .filter((sentence) => sentence.length < 450)
    .filter((sentence) => !/privacy notice|skip to content|main menu|donate|create account|log in|copyright/i.test(sentence));
  if (!sentences.length) return clean.slice(0, 400);

  const keywords = Array.from(new Set(
    `${title} ${query}`
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .map((part) => part.trim())
      .filter((part) => part.length > 2)
  ));

  const ranked = sentences
    .map((sentence, index) => ({ sentence, index, score: scoreSentence(sentence, keywords) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence);

  return ranked.join(' ');
}
