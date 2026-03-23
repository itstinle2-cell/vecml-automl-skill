export function parseTask(task) {
  const normalized = task.trim();
  const searchMatch = normalized.match(/search for ['“”"]([^'”"]+)['”"]/i);

  return {
    raw: normalized,
    app: /browser/i.test(normalized) ? 'browser' : null,
    query: searchMatch?.[1] ?? null,
    wantsSummary: /summarize|summary/i.test(normalized),
    target: /first result/i.test(normalized) ? 'first-result' : null,
  };
}
