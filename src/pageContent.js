const DEFAULT_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
};

function decodeHtml(text = '') {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripTags(html = '') {
  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return titleMatch ? stripTags(titleMatch[1]) : null;
}

function extractMetaDescription(html) {
  const metaMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i)
    || html.match(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["'][^>]*>/i);
  return metaMatch ? decodeHtml(metaMatch[1]).trim() : null;
}

function extractParagraphs(html) {
  const paragraphs = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripTags(match[1]))
    .filter((text) => text.length > 60)
    .filter((text) => !/copyright|privacy notice|skip to content|main menu|powered by|donate|log in|create account/i.test(text));

  if (paragraphs.length) {
    return paragraphs.slice(0, 5).join('\n\n');
  }

  return null;
}

function detectBlockers(text) {
  return /verify you are human|security challenge|captcha|enable javascript and cookies|cloudflare|access denied|robot or human/i.test(text);
}

export async function fetchReadableContent(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: DEFAULT_HEADERS,
  });

  const html = await response.text();
  const title = extractTitle(html);
  const metaDescription = extractMetaDescription(html);
  const paragraphText = extractParagraphs(html);
  const fallbackText = stripTags(html).slice(0, 6000);
  const text = (paragraphText || metaDescription || fallbackText || '').trim();
  const finalUrl = response.url;
  const blocked = detectBlockers(text);

  return {
    ok: response.ok,
    status: response.status,
    finalUrl,
    title,
    text,
    blocked,
  };
}
