function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

export function researchAgent(task) {
  const normalized = task.toLowerCase();

  if (includesAny(normalized, ['stock', 'shares', 'market', 'invest'])) {
    return {
      task,
      domain: 'finance',
      findings: [
        'This looks like a finance/investment-style question.',
        'Useful inputs include price trend, earnings, valuation, growth expectations, and recent news.',
        'A strong research pass should separate company fundamentals from market sentiment.'
      ],
      missingData: ['live market data', 'recent company news', 'latest financial results']
    };
  }

  if (includesAny(normalized, ['project', 'plan', 'roadmap', 'deadline', 'milestone'])) {
    return {
      task,
      domain: 'project/work',
      findings: [
        'This appears to be a work or project-planning request.',
        'Relevant research should gather goals, scope, timeline, risks, and dependencies.',
        'A helpful agent should identify ambiguities before making recommendations.'
      ],
      missingData: ['specific project context', 'constraints', 'success criteria']
    };
  }

  if (includesAny(normalized, ['pros and cons', 'compare', 'comparison', 'tradeoff', 'trade-off'])) {
    return {
      task,
      domain: 'comparison',
      findings: [
        'This task asks for balanced comparison or tradeoff analysis.',
        'Research should identify the main dimensions of comparison rather than jump straight to a conclusion.',
        'A good output should cover benefits, downsides, and context-dependent factors.'
      ],
      missingData: ['user priorities', 'context-specific constraints']
    };
  }

  return {
    task,
    domain: 'general',
    findings: [
      'The task was received and classified as a general inquiry.',
      'A research agent should gather relevant facts, examples, and context before interpretation.',
      'The system can still structure the problem even when domain-specific connectors are not yet attached.'
    ],
    missingData: ['live external sources if needed']
  };
}
