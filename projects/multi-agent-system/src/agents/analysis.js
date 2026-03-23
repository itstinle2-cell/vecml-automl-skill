export function analysisAgent(research) {
  const evidence = research.evidence || [];

  const observations = evidence.map((item) => {
    const content = item.content || item.snippet || '';
    return {
      title: item.title,
      url: item.url,
      source: item.source,
      takeaway: content.slice(0, 280).trim()
    };
  });

  const themes = inferThemes(research.task, observations);

  return {
    task: research.task,
    observations,
    themes,
    confidence: evidence.length >= 2 ? 'medium' : 'low'
  };
}

function inferThemes(task, observations) {
  const text = `${task} ${observations.map((o) => o.takeaway).join(' ')}`.toLowerCase();
  const themes = [];

  if (/stock|market|shares|invest/.test(text)) {
    themes.push('Relevant evidence should separate business performance from market sentiment.');
    themes.push('Recent news and financial updates matter for any serious stock analysis.');
  }

  if (/project|plan|roadmap|deadline|milestone/.test(text)) {
    themes.push('The evidence suggests planning quality depends on scope, dependencies, and execution risks.');
  }

  if (/pros and cons|compare|tradeoff|trade-off|versus|vs/.test(text)) {
    themes.push('The evidence should be weighed as tradeoffs rather than reduced to a single absolute answer.');
  }

  if (!themes.length) {
    themes.push('The collected evidence provides a starting point for grounded interpretation.');
    themes.push('Any conclusion should stay close to what the sources actually support.');
  }

  return themes;
}
