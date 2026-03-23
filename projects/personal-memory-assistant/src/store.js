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

  getAll() {
    const raw = fs.readFileSync(this.filePath, 'utf8');
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  }
}
