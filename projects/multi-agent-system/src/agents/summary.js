export function summaryAgent(research, analysis) {
  const lines = [];
  lines.push(`Task: ${research.task}`);
  lines.push('');
  lines.push('Evidence gathered:');

  for (const item of analysis.observations.slice(0, 3)) {
    lines.push(`- ${item.title} (${item.source})`);
    lines.push(`  ${item.takeaway}`);
    lines.push(`  Source: ${item.url}`);
  }

  lines.push('');
  lines.push('Analysis:');
  for (const theme of analysis.themes) {
    lines.push(`- ${theme}`);
  }

  lines.push('');
  lines.push(`Confidence: ${analysis.confidence}`);
  return lines.join('\n');
}
