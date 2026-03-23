export function answerFromMemories(question, matches) {
  if (!matches.length) {
    return `I couldn't find anything relevant in stored conversations for: "${question}".`;
  }

  const top = matches.slice(0, 3).map(({ entry }) => entry);
  const bullets = top.map((entry) => {
    const date = new Date(entry.timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
    return `- On ${date}, you said: "${entry.text}"`;
  });

  return [`Here's what you said that seems relevant:`, ...bullets].join('\n');
}
