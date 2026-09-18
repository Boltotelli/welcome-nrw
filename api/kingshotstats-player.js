// LocationBot DNS bridge v4
const https = require('https');

const VERIFY_BASE = 'https://bdzlgirowutasrsycjfj.supabase.co/functions/v1/discord-location-bot';
const API_HOST = 'api.kingshotstats.com';

let cachedAddress = null;
let cachedAddressAt = 0;

async function queryDoh(host, provider, type) {
  const url = provider === 'cloudflare'
    ? 'https://cloudflare-dns.com/dns-query?name=' + encodeURIComponent(host) + '&type=' + type
    : 'https://dns.google/resolve?name=' + encodeURIComponent(host) + '&type=' + type;

  const response = await fetch(url, {
    headers: { Accept: 'application/dns-json' },
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) throw new Error(provider + '_doh_' + response.status);

  const payload = await response.json();
  return Array.isArray(payload?.Answer) ? payload.Answer : [];
}

async function resolveHost(host, depth = 0) {
  if (depth > 5) throw new Error('dns_cname_depth');

  const providers = ['cloudflare', 'google'];
  const queryTypes = ['A', 'AAAA'];
  const errors = [];

  for (const provider of providers) {
    for (const queryType of queryTypes) {
      try {
        const answers = await queryDoh(host, provider, queryType);

        const a = answers.find(item =>
          Number(item?.type) === 1 &&
          /^\d{1,3}(?:\.\d{1,3}){3}$/.test(String(item?.data || ''))
        );
        if (a?.data) return { address: String(a.data), family: 4 };

        const aaaa = answers.find(item =>
          Number(item?.type) === 28 &&
          String(item?.data || '').includes(':')
        );
        if (aaaa?.data) return { address: String(aaaa.data), family: 6 };

        const cname = answers.find(item => Number(item?.type) === 5 && item?.data);
        if (cname?.data) {
          const next = String(cname.data).replace(/\.$/, '');
          return await resolveHost(next, depth + 1);
        }

        errors.push(provider + ':' + queryType + ':empty');
      } catch (error) {
        errors.push(provider + ':' + queryType + ':' + (error?.message || String(error)));
      }
    }
  }

  throw new Error('dns_over_https_failed|' + host + '|' + errors.join(','));
}

async function resolveApiAddress() {
  if (cachedAddress && Date.now() - cachedAddressAt < 5 * 60 * 1000) return cachedAddress;
  cachedAddress = await resolveHost(API_HOST);
  cachedAddressAt = Date.now();
  return cachedAddress;
}

function fetchViaAddress(target, id, authorization) {
  return new Promise((resolve, reject) => {
    const request = https.request({
      protocol: 'https:',
      hostname: target.address,
      family: target.family,
      port: 443,
      method: 'GET',
      path: '/v1/players/' + encodeURIComponent(id) + '?include=base',
      servername: API_HOST,
      rejectUnauthorized: true,
      headers: {
        Host: API_HOST,
        Accept: 'application/json',
        Authorization: authorization,
        'User-Agent': 'LocationBot/1.0'
      },
      timeout: 90000
    }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(Buffer.from(chunk)));
      response.on('end', () => {
        resolve({
          status: Number(response.statusCode || 502),
          contentType: String(response.headers['content-type'] || 'application/json; charset=utf-8'),
          body: Buffer.concat(chunks).toString('utf8')
        });
      });
    });

    request.on('timeout', () => request.destroy(new Error('upstream_timeout')));
    request.on('error', reject);
    request.end();
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const id = String(req.query?.id || '').trim();
  if (!/^\d{5,20}$/.test(id)) {
    return res.status(400).json({ error: 'invalid_player_id' });
  }

  const authorization = String(req.headers.authorization || '');
  const proxyKey = String(req.headers['x-location-proxy-key'] || '');
  if (!authorization.startsWith('Bearer kss_') || !proxyKey) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  try {
    const verifyUrl = new URL(VERIFY_BASE);
    verifyUrl.searchParams.set('task', 'proxy-auth');
    verifyUrl.searchParams.set('key', proxyKey);

    const verified = await fetch(verifyUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    if (!verified.ok) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const target = await resolveApiAddress();
    const upstream = await fetchViaAddress(target, id, authorization);

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', upstream.contentType);
    return res.status(upstream.status).send(upstream.body);
  } catch (error) {
    console.error('KingshotStats proxy failed', {
      message: error?.message || String(error),
      code: error?.code || error?.cause?.code || null,
      cause: error?.cause?.message || null
    });
    return res.status(502).json({ error: 'upstream_unavailable' });
  }
};
