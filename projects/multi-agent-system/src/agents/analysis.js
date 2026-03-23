export function analysisAgent(research) {
  const findings = research.findings || [];
  const missingData = research.missingData || [];

  const domainSpecific = {
    finance: 'Interpretation should distinguish business fundamentals from stock-market narrative.',
    'project/work': 'Interpretation should focus on feasibility, priorities, and execution risk.',
    comparison: 'Interpretation should stay balanced and highlight where the answer depends on user preferences.',
    general: 'Interpretation should organize the problem clearly and call out uncertainty.'
  };

  return {
    task: research.task,
    domain: research.domain,
    interpretation: [
      `The task falls under the ${research.domain} domain.`,
      findings.length
        ? `The research stage found ${findings.length} relevant points to consider.`
        : 'The research stage returned limited findings.',
      domainSpecific[research.domain] || domainSpecific.general,
      missingData.length
        ? `Important unknowns remain: ${missingData.join(', ')}.`
        : 'There are no obvious missing data points.'
    ],
    confidence: missingData.length ? 'medium-low' : 'medium'
  };
}
