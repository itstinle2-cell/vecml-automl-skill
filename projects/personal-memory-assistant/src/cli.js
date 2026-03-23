#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ConversationStore } from './store.js';
import { retrieveRelevant } from './retrieve.js';
import { answerFromMemories } from './answer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '..', 'data', 'conversations.jsonl');

if (!fs.existsSync(dataPath) || fs.readFileSync(dataPath, 'utf8').trim() === '') {
  console.error('No conversation history found. Run: node src/seed.js');
  process.exit(1);
}

const question = process.argv.slice(2).join(' ').trim();
if (!question) {
  console.error('Usage: node src/cli.js "What did I say about my project yesterday?"');
  process.exit(1);
}

const store = new ConversationStore(dataPath);
const entries = store.getAll();
const matches = retrieveRelevant(entries, question, new Date('2026-03-23T15:41:00-07:00'));
const answer = answerFromMemories(question, matches);

console.log(answer);
