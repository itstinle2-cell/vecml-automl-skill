export function summaryAgent(research, analysis) {
  return [
    `Task: ${research.task}`,
    '',
    'Research findings:',
    ...research.findings.map((item) => `- ${item}`),
    '',
    'Analysis:',
    ...analysis.interpretation.map((item) => `- ${item}`),
    '',
    `Confidence: ${analysis.confidence}`
  ].join('\n');
}
