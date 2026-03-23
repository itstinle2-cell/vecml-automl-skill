import { researchAgent } from './agents/research.js';
import { analysisAgent } from './agents/analysis.js';
import { summaryAgent } from './agents/summary.js';

export function runMultiAgentSystem(task) {
  const research = researchAgent(task);
  const analysis = analysisAgent(research);
  const summary = summaryAgent(research, analysis);

  return {
    task,
    research,
    analysis,
    summary
  };
}
