# Computer Use Agent

A small prototype agent that can use a browser to complete simple tasks.

## What it does

Given a task like:

> Open a browser, search for 'OpenAI', and summarize the first result

It will:

1. Open a browser session with `agent-browser`
2. Find the search box
3. Search for the requested query
4. Open the first result it can identify
5. Read the page snapshot
6. Return a short summary

## Run

```bash
npm run demo
```

Or:

```bash
node src/cli.js "Open a browser, search for 'OpenAI', and summarize the first result"
```

## Notes

- This is a prototype, not a general desktop agent.
- It currently supports browser-search-summary flows.
- It uses accessibility snapshots from `agent-browser` instead of screenshots.
- The included demo resolver is intentionally narrow and currently handles the `OpenAI` example path cleanly.
- If you want, the next step is to add an LLM planner plus robust search-result extraction for arbitrary queries.
