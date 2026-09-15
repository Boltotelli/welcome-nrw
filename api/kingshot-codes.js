const SOURCES = [
  {
    id: 'kingshot-mastery',
    name: 'Kingshot Mastery',
    url: 'https://kingshotmastery.com/gift-codes',
    parse: parseMastery
  },
  {
    id: 'kingshot-wiki',
    name: 'Kingshot Wiki',
    url: 'https://kingshotwiki.com/giftcodes/',
    parse: parseWiki
  }
];

const STOP_WORDS = new Set([
  'ACTIVE','ADDED','ARCHIVE','CODES','COPY','EXPIRES','EXPIRED','GIFTCODE','KINGSHOT',
  'REDEEM','REWARDS','STATUS','VERIFIED','PLAYER','PLAYERS','RETRY','FAILED','CHECKED',
  'LATEST','UPDATED','DAILY','TOOLS','GIFT','CODE','NEW','NOT','LISTED','FEED','LONG',
  'RUNNING','CURRENTLY','UNREDEEMED','BUTTON','MEMBER','CONCIERGE','HOW','TO','THE',
  'THIS','PAGE','FROM','WITH','YOUR','EVERY','DIRECTLY','HERE'
]);

function decodeHtml(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function htmlToText(html) {
  return decodeHtml(
    String(html || '')
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '\n')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(?:p|div|li|tr|td|th|h[1-6]|section|article|button)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

function isPlausibleCode(value) {
  const code = String(value || '').trim();
  if (!/^[A-Za-z0-9]{5,32}$/.test(code)) return false;
  if (STOP_WORDS.has(code.toUpperCase())) return false;
  if (/^\d+$/.test(code)) return false;
  return /\d/.test(code) || /[A-Z]/.test(code);
}

function uniqueCodes(codes) {
  const seen = new Set();
  return codes
    .map(code => String(code || '').trim())
    .filter(isPlausibleCode)
    .filter(code => {
      const key = code.toUpperCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function parseMastery(html) {
  const text = htmlToText(html);
  const start = text.search(/Active Kingshot Gift Codes and Redeem Tool/i);
  if (start < 0) return [];
  const tail = text.slice(start);
  const end = tail.search(/\n\s*Player IDs\b/i);
  const section = end >= 0 ? tail.slice(0, end) : tail.slice(0, 8000);
  const matches = [];

  const activePattern = /\b([A-Za-z0-9]{5,32})\s+(?:new\s+)?Active\b/gi;
  let match;
  while ((match = activePattern.exec(section))) matches.push(match[1]);

  if (!matches.length) {
    section.split('\n').forEach(line => {
      const cleaned = line.replace(/\b(?:Copy|Redeem|new)\b/gi, ' ').trim();
      if (isPlausibleCode(cleaned)) matches.push(cleaned);
    });
  }
  return uniqueCodes(matches);
}

function parseWiki(html) {
  const text = htmlToText(html);
  const start = text.search(/Active Codes\s*:/i);
  if (start < 0) return [];
  const tail = text.slice(start);
  const end = tail.search(/Concierge member codes|How to Redeem/i);
  const section = end >= 0 ? tail.slice(0, end) : tail.slice(0, 3000);
  const matches = [];

  section.split('\n').forEach(line => {
    const cleaned = line
      .replace(/Active Codes\s*:/i, '')
      .replace(/\b(?:Copy|Redeem|Button)\b/gi, ' ')
      .replace(/[•·|]/g, ' ')
      .trim();
    const tokens = cleaned.match(/[A-Za-z0-9]{5,32}/g) || [];
    tokens.forEach(token => {
      if (isPlausibleCode(token)) matches.push(token);
    });
  });
  return uniqueCodes(matches);
}

async function fetchSource(source) {
  const response = await fetch(source.url, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml',
      'User-Agent': 'Mozilla/5.0 (compatible; NRW-K1044-Dashboard/1.0; +https://welcome-nrw.vercel.app/dashboard/)'
    },
    signal: AbortSignal.timeout(9000)
  });
  if (!response.ok) throw new Error(`${source.name} ${response.status}`);
  const html = await response.text();
  const codes = source.parse(html);
  if (!codes.length) throw new Error(`${source.name} returned no parseable active codes`);
  return { id: source.id, name: source.name, url: source.url, codes };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const results = await Promise.allSettled(SOURCES.map(fetchSource));
  const successful = results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.warn('Kingshot gift-code source failed', SOURCES[index].id, result.reason?.message);
    }
  });

  if (!successful.length) {
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');
    return res.status(503).json({
      codes: [],
      updatedAt: new Date().toISOString(),
      status: 'temporarily_unavailable'
    });
  }

  // Kingshot Mastery is the primary daily-maintained feed. We intentionally do not
  // merge every secondary code into it because community lists frequently retain
  // already expired codes. Secondary sources are used as confirmation/fallback.
  const primary = successful.find(source => source.id === 'kingshot-mastery') || successful[0];
  const secondarySets = successful
    .filter(source => source.id !== primary.id)
    .map(source => new Set(source.codes.map(code => code.toUpperCase())));

  const codes = primary.codes.map(code => ({
    code,
    confirmations: 1 + secondarySets.filter(set => set.has(code.toUpperCase())).length
  }));

  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=21600');
  return res.status(200).json({
    codes,
    updatedAt: new Date().toISOString(),
    status: 'ok',
    primarySource: { name: primary.name, url: primary.url },
    checkedSources: successful.map(source => ({ name: source.name, url: source.url }))
  });
};
