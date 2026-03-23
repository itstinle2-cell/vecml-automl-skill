function extractQuotedQuery(task) {
  const patterns = [
    /search for\s+["'“”]([^"'“”]+)["'“”]/i,
    /search\s+["'“”]([^"'“”]+)["'“”]/i,
  ];

  for (const pattern of patterns) {
    const match = task.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return null;
}

export function parseTask(task) {
  const normalized = task.trim();
  const query = extractQuotedQuery(normalized);

  return {
    raw: normalized,
    app: /browser/i.test(normalized) ? 'browser' : null,
    query,
    wantsSummary: /summarize|summary/i.test(normalized),
    target: /first\s+result/i.test(normalized) ? 'first-result' : null,
  };
}
