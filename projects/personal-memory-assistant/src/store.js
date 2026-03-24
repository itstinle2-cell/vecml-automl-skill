import fs from 'node:fs';
import path from 'node:path';

export class ConversationStore {
  constructor(filePath) {
    this.filePath = filePath;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '');
    }
  }

  add(entry) {
    fs.appendFileSync(this.filePath, `${JSON.stringify(entry)}\n`);
  }

  addMany(entries) {
    for (const entry of entries) this.add(entry);
  }

  getAll() {
    const raw = fs.readFileSync(this.filePath, 'utf8');
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  }

  listSessions() {
    const entries = this.getAll();
    const grouped = new Map();
    for (const entry of entries) {
      const current = grouped.get(entry.sessionId) || { sessionId: entry.sessionId, count: 0, lastTimestamp: null };
      current.count += 1;
      current.lastTimestamp = entry.timestamp;
      grouped.set(entry.sessionId, current);
    }
    return [...grouped.values()].sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp));
  }
}

export class MemoryStore {
  constructor(filePath) {
    this.filePath = filePath;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '');
    }
  }

  add(memory) {
    fs.appendFileSync(this.filePath, `${JSON.stringify(memory)}\n`);
  }

  getAll() {
    const raw = fs.readFileSync(this.filePath, 'utf8');
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  }
}
