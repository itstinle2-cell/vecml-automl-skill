# Multi-Agent System

A local prototype of a general multi-agent system with three roles:

1. Research agent
2. Analysis agent
3. Summary agent

## Run

```bash
cd /Users/vecml-macmini/.openclaw/workspace/projects/multi-agent-system
node src/cli.js "Analyze Tesla stock"
```

You can replace the prompt with other tasks.

## Architecture

- `src/agents/research.js` — gathers structured findings
- `src/agents/analysis.js` — interprets research output
- `src/agents/summary.js` — formats final response
- `src/orchestrator.js` — coordinates agents

## Notes

- This is a general local prototype.
- It supports arbitrary prompts structurally.
- Domain depth depends on the logic inside the research agent.
- Next step: attach live tools / web retrieval for richer results.
