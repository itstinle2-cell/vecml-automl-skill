const DEFAULT_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
};

function stripTags(html) {
  return decodeHtml(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtml(text = '') {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractDdgrRedirect(href = '') {
  try {
    const url = new URL(href, 'https://duckduckgo.com');
    const uddg = url.searchParams.get('uddg');
    return uddg ? decodeURIComponent(uddg) : null;
  } catch {
    return null;
  }
}

function normalizeResult(href, title, source) {
  if (!href || !title) return null;
  const cleanHref = href.startsWith('//') ? `https:${href}` : href;
  if (!/^https?:/i.test(cleanHref)) return null;
  return {
    href: cleanHref,
    title: stripTags(title),
    source,
  };
}

async function fetchText(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: DEFAULT_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`Search request failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function parseDuckDuckGo(html) {
  const results = [];
  const regex = /<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gsi;

  for (const match of html.matchAll(regex)) {
    const redirected = decodeHtml(match[1]);
    const href = extractDdgrRedirect(redirected) || redirected;
    const result = normalizeResult(href, match[2], 'duckduckgo');
    if (result) results.push(result);
  }

  return dedupeResults(results);
}

function parseBrave(html) {
  const results = [];
  const regex = /<a[^>]+href="([^"]+)"[^>]*>(?:.|\n|\r)*?<div[^>]+class="[^"]*snippet-title[^"]*"[^>]*>(.*?)<\/div>/gsi;

  for (const match of html.matchAll(regex)) {
    const result = normalizeResult(decodeHtml(match[1]), match[2], 'brave');
    if (result && !/search\.brave\.com/i.test(result.href)) results.push(result);
  }

  return dedupeResults(results);
}

function dedupeResults(results) {
  const seen = new Set();
  return results.filter((result) => {
    const key = result.href;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function searchWeb(query) {
  const providers = [
    async () => parseDuckDuckGo(await fetchText(`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`)),
    async () => parseBrave(await fetchText(`https://search.brave.com/search?q=${encodeURIComponent(query)}&source=web`)),
  ];

  const errors = [];
  for (const provider of providers) {
    try {
      const results = await provider();
      if (results.length) return results;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  throw new Error(`Could not retrieve search results for "${query}". ${errors.join(' | ')}`.trim());
}
