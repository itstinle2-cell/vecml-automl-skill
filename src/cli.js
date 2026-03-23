#!/usr/bin/env node
import { ComputerUseAgent } from './computerUseAgent.js';

const task = process.argv.slice(2).join(' ').trim();

if (!task) {
  console.error('Usage: node src/cli.js "Open a browser, search for \'OpenAI\', and summarize the first result"');
  process.exit(1);
}

const agent = new ComputerUseAgent();

try {
  const result = await agent.run(task);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await agent.close().catch(() => {});
}
