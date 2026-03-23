import { researchAgent } from './agents/research.js';
import { analysisAgent } from './agents/analysis.js';
import { summaryAgent } from './agents/summary.js';

export async function runMultiAgentSystem(task) {
  const research = await researchAgent(task);
  const analysis = analysisAgent(research);
  const summary = summaryAgent(research, analysis);

  return {
    task,
    research,
    analysis,
    summary
  };
}
