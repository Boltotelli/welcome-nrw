const VERIFY_BASE = 'https://bdzlgirowutasrsycjfj.supabase.co/functions/v1/discord-location-bot';

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

    const upstreamUrl = new URL(`https://api.kingshotstats.com/v1/players/${encodeURIComponent(id)}`);
    upstreamUrl.searchParams.set('include', 'base');

    const upstream = await fetch(upstreamUrl, {
      headers: {
        Accept: 'application/json',
        Authorization: authorization
      },
      signal: AbortSignal.timeout(90000)
    });

    const body = await upstream.text();
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    return res.status(upstream.status).send(body);
  } catch (error) {
    console.error('KingshotStats proxy failed', error?.message || error);
    return res.status(502).json({ error: 'upstream_unavailable' });
  }
};
