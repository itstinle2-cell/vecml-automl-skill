function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

function extractTopicWords(question) {
  const text = normalize(question);
  const stopwords = new Set([
    'what', 'did', 'i', 'say', 'about', 'my', 'yesterday', 'today', 'the', 'a', 'an', 'to', 'of', 'for', 'and', 'is', 'was', 'were', 'on', 'in'
  ]);

  return [...new Set(text.split(/\s+/).filter((word) => word && !stopwords.has(word)))];
}

function inferTimeWindow(question, now = new Date()) {
  const text = normalize(question);
  if (text.includes('yesterday')) {
    const end = new Date(now);
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - 1);
    return { start, end, label: 'yesterday' };
  }
  return null;
}

export function retrieveRelevant(entries, question, now = new Date()) {
  const topicWords = extractTopicWords(question);
  const window = inferTimeWindow(question, now);

  return entries
    .filter((entry) => entry.speaker === 'user')
    .filter((entry) => {
      if (!window) return true;
      const ts = new Date(entry.timestamp);
      return ts >= window.start && ts < window.end;
    })
    .map((entry) => {
      const hay = normalize(entry.text);
      const score = topicWords.reduce((sum, word) => sum + (hay.includes(word) ? 1 : 0), 0);
      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.entry.timestamp) - new Date(a.entry.timestamp));
}
