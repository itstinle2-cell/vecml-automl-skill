#!/usr/bin/env node
import { runMultiAgentSystem } from './orchestrator.js';

const task = process.argv.slice(2).join(' ').trim();
if (!task) {
  console.error('Usage: node src/cli.js "Analyze Tesla stock"');
  process.exit(1);
}

const result = runMultiAgentSystem(task);
console.log(result.summary);
