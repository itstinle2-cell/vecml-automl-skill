import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ConversationStore, MemoryStore } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const store = new ConversationStore(path.join(__dirname, '..', 'data', 'conversations.jsonl'));
const memoryStore = new MemoryStore(path.join(__dirname, '..', 'data', 'memories.jsonl'));

const entries = [
  {
    timestamp: '2026-03-22T14:10:00-07:00',
    speaker: 'user',
    sessionId: 'demo',
    text: 'My project needs a real demo for my boss, not just a hardcoded example.'
  },
  {
    timestamp: '2026-03-22T14:11:00-07:00',
    speaker: 'user',
    sessionId: 'demo',
    text: 'I want the assistant to search, read, and summarize real pages.'
  },
  {
    timestamp: '2026-03-23T10:00:00-07:00',
    speaker: 'user',
    sessionId: 'demo',
    text: 'Today I also want memory so it can recall what I said yesterday about the project.'
  }
];

for (const entry of entries) {
  store.add(entry);
}

memoryStore.add({
  timestamp: '2026-03-22T14:12:00-07:00',
  category: 'project',
  content: 'The user wants a real demo for the boss and dislikes hardcoded examples.'
});

console.log('Seeded demo conversations and memories.');
