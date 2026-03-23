# Computer Use Agent

A practical browser agent for prompts of the form:

> Open a browser, search for 'X', and summarize the first result

It now works for arbitrary quoted search queries instead of a single hardcoded demo path.

## What it does

For a prompt like:

> Open a browser, search for 'One Piece', and summarize the first result

it will:

1. Open a real browser session with `agent-browser`
2. Find the search box dynamically
3. Search for the requested query
4. Determine the first result dynamically via web search parsing
5. Open that result in the browser
6. Read content using a practical hybrid strategy:
   - browser navigation for the actual page visit
   - HTTP fetch + lightweight text extraction for cleaner summarization
7. Report blockers honestly if the page is behind verification / anti-bot checks

## Run

```bash
node src/cli.js "Open a browser, search for 'One Piece', and summarize the first result"
```

Or use npm:

```bash
npm start -- "Open a browser, search for 'Python official documentation', and summarize the first result"
```

## Supported prompt shape

The current parser expects all of these ideas to be present:

- open a browser
- search for '...'
- summarize
- first result

The search query must be quoted.

## Notes

- This is still a focused browser-search-summary agent, not a full desktop planner.
- Search result extraction tries DuckDuckGo first and falls back to Brave parsing.
- Summaries prefer fetched article text because accessibility snapshots can be noisy.
- If a site serves a CAPTCHA, verification page, or similar blocker, the agent reports that directly instead of pretending it read the page.
