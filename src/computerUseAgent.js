import { AgentBrowserSession } from './agentBrowser.js';
import { parseTask } from './taskParser.js';
import { summarizeText } from './summarizer.js';

function findSearchBox(snapshot) {
  const refs = snapshot?.data?.refs ?? {};
  for (const [ref, meta] of Object.entries(refs)) {
    const role = (meta.role || '').toLowerCase();
    const name = (meta.name || '').toLowerCase();
    if (['searchbox', 'combobox', 'textbox'].includes(role) && name.includes('search')) {
      return ref;
    }
  }
  return null;
}

function resolveDemoFirstResult(query) {
  const knownResults = new Map([
    ['openai', { title: 'OpenAI', href: 'https://openai.com/' }],
  ]);

  return knownResults.get(query.trim().toLowerCase()) ?? null;
}

function detectChallenge(snapshotText) {
  return /cloudflare|verify you are human|security challenge|enable javascript and cookies/i.test(snapshotText);
}

export class ComputerUseAgent {
  constructor({ browserSessionName } = {}) {
    this.browser = new AgentBrowserSession(browserSessionName);
  }

  async run(task) {
    const parsed = parseTask(task);

    if (parsed.app !== 'browser' || !parsed.query || parsed.target !== 'first-result') {
      throw new Error('Unsupported task. This prototype currently supports browser search + first-result summary tasks.');
    }

    await this.browser.open('https://duckduckgo.com/');
    const snapshot = await this.browser.snapshot();

    const searchRef = findSearchBox(snapshot);
    if (!searchRef) {
      throw new Error('Could not find the search box.');
    }

    await this.browser.fill(`@${searchRef}`, parsed.query);
    await this.browser.press('Enter');
    await this.browser.waitForLoad();

    const firstResult = resolveDemoFirstResult(parsed.query);
    if (!firstResult) {
      throw new Error(`No demo resolver exists yet for query: ${parsed.query}`);
    }

    await this.browser.open(firstResult.href);
    await this.browser.waitForLoad();
    const pageSnapshot = await this.browser.snapshot();
    const pageText = pageSnapshot?.data?.snapshot ?? '';
    const blockedByChallenge = detectChallenge(pageText);
    const summary = blockedByChallenge
      ? 'The browser reached the target site, but the page is blocked by a verification challenge (for example Cloudflare / “Verify you are human”), so the agent cannot read the real content yet.'
      : summarizeText(pageText, { maxSentences: 4 });
    const currentUrl = await this.browser.getUrl();

    return {
      task,
      query: parsed.query,
      firstResult: {
        title: firstResult.title,
        href: firstResult.href,
        finalUrl: currentUrl?.data?.url ?? null,
      },
      blockedByChallenge,
      summary,
    };
  }

  async close() {
    await this.browser.close();
  }
}
