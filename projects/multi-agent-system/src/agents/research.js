import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const registryPath = path.join(__dirname, '..', '..', 'data', 'evidence-sources.json');

export async function researchAgent(task) {
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const sources = resolveSources(task, registry);

  const evidence = [];
  for (const source of sources) {
    const content = await fetchReadable(source.url).catch(() => null);
    evidence.push({
      title: source.title,
      url: source.url,
      source: extractHostname(source.url),
      content: extractUsefulExcerpt(content)
    });
  }

  return {
    task,
    evidence,
    sourcesUsed: sources.length
  };
}

function resolveSources(task, registry) {
  const normalized = task.toLowerCase();
  for (const [key, sources] of Object.entries(registry)) {
    if (normalized.includes(key)) return sources;
  }

  return [
    {
      title: 'General topic source',
      url: 'https://en.wikipedia.org/wiki/Main_Page'
    }
  ];
}

async function fetchReadable(url) {
  const { stdout } = await execFileAsync('curl', ['-L', '-A', 'Mozilla/5.0', '--max-time', '15', url], {
    maxBuffer: 1024 * 1024 * 6
  });
  return stripHtml(stdout);
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractUsefulExcerpt(text) {
  if (!text) return null;
  const clean = text.replace(/\s+/g, ' ').trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  const useful = sentences.filter((s) => s.length > 60 && !/jump to content|main menu|navigation|search search|appearance/i.test(s));
  return (useful.slice(0, 3).join(' ') || clean.slice(0, 600)).trim();
}

function extractHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}
