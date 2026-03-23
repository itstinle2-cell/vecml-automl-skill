import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function searchDuckDuckGo(query) {
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const { stdout } = await execFileAsync('curl', ['-L', url], {
    maxBuffer: 1024 * 1024 * 10,
  });

  const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g;
  const results = [];
  let match;

  while ((match = resultRegex.exec(stdout)) !== null) {
    const href = decodeHtml(match[1]);
    const title = stripTags(decodeHtml(match[2])).trim();
    results.push({ title, href });
  }

  return results;
}

export async function fetchPageText(url) {
  const { stdout } = await execFileAsync('curl', ['-L', url], {
    maxBuffer: 1024 * 1024 * 10,
  });

  const text = stripTags(
    stdout
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}
