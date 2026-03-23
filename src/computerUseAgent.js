import { AgentBrowserSession } from './agentBrowser.js';
import { fetchReadableContent } from './pageContent.js';
import { summarizeText } from './summarizer.js';
import { parseTask } from './taskParser.js';
import { searchWeb } from './webSearch.js';

function detectChallenge(text) {
  return /cloudflare|verify you are human|security challenge|captcha|enable javascript and cookies|access denied/i.test(text);
}

function scoreResult(result, query) {
  const title = `${result.title} ${result.href}`.toLowerCase();
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 2);

  let score = 0;
  for (const token of tokens) {
    if (title.includes(token)) score += 3;
  }

  if (/official site$/i.test(result.title)) score -= 4;
  if (/duckduckgo|google|brave search/i.test(result.href)) score -= 10;
  if (/wikipedia\.org/i.test(result.href) && /wikipedia/i.test(query)) score += 5;
  if (/python\.org|docs\.python\.org/i.test(result.href) && /python/i.test(query)) score += 4;

  return score;
}

function chooseBestResult(results, query) {
  return [...results]
    .sort((a, b) => scoreResult(b, query) - scoreResult(a, query))
    [0] ?? null;
}

function blockerMessage(url) {
  return `The browser reached ${url}, but the page appears blocked by a verification or anti-bot challenge, so I could not reliably read the real article content.`;
}

export class ComputerUseAgent {
  constructor({ browserSessionName } = {}) {
    this.browser = new AgentBrowserSession(browserSessionName);
  }

  async run(task) {
    const parsed = parseTask(task);

    if (parsed.app !== 'browser' || !parsed.query || parsed.target !== 'first-result' || !parsed.wantsSummary) {
      throw new Error('Unsupported task. Use a prompt like: Open a browser, search for \'One Piece\', and summarize the first result.');
    }

    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(parsed.query)}`;
    await this.browser.open(searchUrl);
    await this.browser.waitForLoad('domcontentloaded').catch(() => {});
    await this.browser.wait(1500).catch(() => {});

    const searchResults = await searchWeb(parsed.query);
    const firstResult = chooseBestResult(searchResults, parsed.query);

    if (!firstResult) {
      throw new Error(`No search results found for "${parsed.query}".`);
    }

    await this.browser.open(firstResult.href);
    await this.browser.waitForLoad('domcontentloaded').catch(() => {});
    await this.browser.wait(1500).catch(() => {});

    const pageSnapshot = await this.browser.snapshot().catch(() => null);
    const snapshotText = pageSnapshot?.data?.snapshot ?? '';
    const browserUrl = await this.browser.getUrl().catch(() => null);
    const navigatedUrl = browserUrl?.data?.url ?? firstResult.href;

    const fetched = await fetchReadableContent(navigatedUrl).catch((error) => ({
      ok: false,
      status: null,
      finalUrl: navigatedUrl,
      title: firstResult.title,
      text: '',
      blocked: false,
      fetchError: error instanceof Error ? error.message : String(error),
    }));

    const blockedByChallenge = detectChallenge(snapshotText) || fetched.blocked;
    const contentText = fetched.text || snapshotText;
    const summary = blockedByChallenge
      ? blockerMessage(navigatedUrl)
      : summarizeText(contentText, {
          title: fetched.title || firstResult.title,
          query: parsed.query,
          maxSentences: 4,
        });

    return {
      task,
      query: parsed.query,
      searchEngine: 'duckduckgo',
      firstResult: {
        title: firstResult.title,
        href: firstResult.href,
        finalUrl: fetched.finalUrl || navigatedUrl,
      },
      blockedByChallenge,
      fetchStatus: fetched.status ?? null,
      fetchError: fetched.fetchError ?? null,
      summary,
    };
  }

  async close() {
    await this.browser.close().catch(() => {});
  }
}
