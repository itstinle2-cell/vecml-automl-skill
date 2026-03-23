# Personal Memory Assistant

A local prototype of a personal AI assistant with memory.

## Features

- stores past conversations in `data/conversations.jsonl`
- retrieves relevant memories by topic and time window
- answers questions based on past interactions

## Demo

Seed sample conversation history:

```bash
node src/seed.js
```

Ask a question:

```bash
node src/cli.js "What did I say about my project yesterday?"
```

## How it works

- `src/store.js` appends and loads conversation entries
- `src/retrieve.js` filters by time references like `yesterday` and topic words like `project`
- `src/answer.js` formats the matched memories into a response

## Next steps

- replace JSONL with SQLite
- add semantic search / embeddings
- support continuous logging from real chat sessions
- distill long-term memory from repeated facts
