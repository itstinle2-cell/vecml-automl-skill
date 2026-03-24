#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ConversationStore, MemoryStore } from './store.js';
import { retrieveRelevant } from './retrieve.js';
import { answerFromMemories } from './answer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');
const conversationsPath = path.join(dataDir, 'conversations.jsonl');
const memoriesPath = path.join(dataDir, 'memories.jsonl');
const conversationStore = new ConversationStore(conversationsPath);
const memoryStore = new MemoryStore(memoriesPath);

const [command = 'ask', ...rest] = process.argv.slice(2);

if (command === 'ask') {
  const question = rest.join(' ').trim();
  if (!question) {
    console.error('Usage: node src/cli.js ask "What did I say about my project yesterday?"');
    process.exit(1);
  }
  ensureSeeded();
  const entries = conversationStore.getAll();
  const matches = retrieveRelevant(entries, question, new Date('2026-03-23T15:41:00-07:00'));
  console.log(answerFromMemories(question, matches));
} else if (command === 'save-chat') {
  const sessionId = rest[0] || `session-${Date.now()}`;
  const text = rest.slice(1).join(' ').trim();
  if (!text) {
    console.error('Usage: node src/cli.js save-chat session-id "message text"');
    process.exit(1);
  }
  conversationStore.add({ timestamp: new Date().toISOString(), speaker: 'user', sessionId, text });
  console.log(`Saved chat to session ${sessionId}.`);
} else if (command === 'remember') {
  const content = rest.join(' ').trim();
  if (!content) {
    console.error('Usage: node src/cli.js remember "important fact"');
    process.exit(1);
  }
  memoryStore.add({ timestamp: new Date().toISOString(), category: 'manual', content });
  console.log('Saved memory.');
} else if (command === 'list-chats') {
  ensureSeeded();
  console.log(JSON.stringify(conversationStore.listSessions(), null, 2));
} else if (command === 'list-memories') {
  console.log(JSON.stringify(memoryStore.getAll(), null, 2));
} else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}

function ensureSeeded() {
  if (!fs.existsSync(conversationsPath) || fs.readFileSync(conversationsPath, 'utf8').trim() === '') {
    const seedPath = path.join(__dirname, 'seed.js');
    throw new Error(`No conversation history found. Run: node ${seedPath}`);
  }
}
