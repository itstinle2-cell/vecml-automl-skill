# Multi-Agent System

A local multi-agent prototype with three roles:

1. Research agent
2. Analysis agent
3. Summary agent

## Run

```bash
cd /Users/vecml-macmini/.openclaw/workspace/projects/multi-agent-system
node src/cli.js "Analyze Tesla stock"
```

## Architecture

- `src/agents/research.js` — gathers evidence from a local registry of real public web sources
- `src/agents/analysis.js` — interprets evidence
- `src/agents/summary.js` — formats final response
- `src/orchestrator.js` — coordinates agents
- `data/evidence-sources.json` — topic-to-source mapping

## Current behavior

- The system now uses real fetched evidence from public web pages instead of placeholder-only reasoning.
- The research agent looks up matching source URLs from `data/evidence-sources.json`, fetches them, and passes excerpts to downstream agents.
- The analysis agent reasons over gathered evidence.
- The summary agent returns a grounded final answer with sources.

## Current limitation

- This version uses a curated source registry instead of open-ended live search.
- It is evidence-backed, but not yet a fully general autonomous web researcher.
- Next step: add reliable live search discovery so the research agent can find sources dynamically.
