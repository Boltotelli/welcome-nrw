// NRW Bear Optimizer — isolated, read-only MightPulse proxy.
// No Supabase, NAP or existing KingshotStats routes are involved.
const ROOT = 'https://api.mightpulse.com/v1';
const KID = 1044;
const NRW_AID = 105300097;
const CACHE_MS = 45 * 1000;
const memoryCache = new Map();
const cacheLimit = 120;

function setHeaders(res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

function reply(res, status, data) {
  return res.status(status).json(data);
}

function fromProviderHero(h) {
  return {
    id: Number(h.id || 0),
    name: String(h.name || ''),
    level: Number(h.level || 0),
    stars: Number(h.stars || 0),
    star_label: String(h.star_label || ''),
    position: Number(h.position || 0),
    skills: Array.isArray(h.skill_levels) ? h.skill_levels.map(s => Number(s.level || 0)).slice(0, 3) : [],
    widget: Number(h.exclusive_gear_level || 0),
    gear: Array.isArray(h.gear) ? h.gear.slice(0, 4).map(g => ({
      slot: String(g.slot || ''),
      enhancement: Number(g.enhancement_level || 0),
      refine: Number(g.refine_level || 0),
      quality: String(g.quality_label || '')
    })) : []
  };
}

async function upstream(path, secret) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 52000);
  try {
    const response = await fetch(ROOT + path, {
      headers: { Authorization: 'Bearer ' + secret, Accept: 'application/json' },
      signal: controller.signal
    });
    const payload = await response.json().catch(() => ({}));
    return { status: response.status, payload };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = async function handler(req, res) {
  setHeaders(res);
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return reply(res, 405, { ok: false, error: 'method_not_allowed' });
  }
  const id = String(req.query && req.query.id || '').trim();
  if (!/^\d{5,20}$/.test(id)) {
    return reply(res, 400, { ok: false, error: 'invalid_governor_id' });
  }

  // The published BEAR_OPTIMIZER key must never be reused. Configure a NEW
  // dedicated secret in the Vercel preview/production environment.
  const secret = process.env.BEAR_MIGHTPULSE_API_KEY;
  if (!secret) {
    return reply(res, 503, { ok: false, error: 'bear_api_not_configured' });
  }

  const cached = memoryCache.get(id);
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return reply(res, 200, cached.data);
  }

  try {
    // Verify membership BEFORE requesting and exposing additional fields.
    const first = await upstream('/players/' + encodeURIComponent(id) + '?include=base', secret);
    if (first.status === 404) return reply(res, 404, { ok: false, error: 'player_not_found' });
    if (first.status === 429) return reply(res, 429, { ok: false, error: 'provider_rate_limited' });
    if (!first.payload || !first.payload.ok || first.status !== 200) {
      return reply(res, 502, { ok: false, error: 'provider_unavailable' });
    }
    const player = first.payload.player || {};
    if (Number(player.kid) !== KID || Number(player.alliance && player.alliance.aid) !== NRW_AID) {
      return reply(res, 403, { ok: false, error: 'not_nrw_member' });
    }

    const details = await upstream('/players/' + encodeURIComponent(id) + '?include=base,heroes,gov_gear', secret);
    if (details.status === 429) return reply(res, 429, { ok: false, error: 'provider_rate_limited' });
    if (details.status !== 200 || !details.payload || !details.payload.ok) {
      return reply(res, 502, { ok: false, error: 'provider_unavailable' });
    }

    // A transfer could have happened between queries; validate again.
    const fullPlayer = details.payload.player || {};
    if (Number(fullPlayer.kid) !== KID || Number(fullPlayer.alliance && fullPlayer.alliance.aid) !== NRW_AID) {
      return reply(res, 403, { ok: false, error: 'not_nrw_member' });
    }

    const data = {
      ok: true,
      player: {
        governor_id: Number(fullPlayer.governor_id || id),
        name: String(fullPlayer.nick_name || ''),
        power: Number(fullPlayer.power || 0),
        avatar_url: /^https:\/\//.test(String(fullPlayer.avatar_url || '')) ? fullPlayer.avatar_url : '',
        kid: KID,
        alliance: 'NRW'
      },
      heroes: Array.isArray(details.payload.heroes) ? details.payload.heroes.slice(0, 5).map(fromProviderHero) : [],
      heroes_scope: 'arena_defense_only',
      gov_gear_hidden: Boolean(details.payload.gov_gear && details.payload.gov_gear.hidden),
      cache_age_seconds: Number(details.payload.age_seconds || 0)
    };

    if (memoryCache.size >= cacheLimit) memoryCache.delete(memoryCache.keys().next().value);
    memoryCache.set(id, { at: Date.now(), data });
    return reply(res, 200, data);
  } catch (error) {
    // Do not log credentials, upstream headers, or game profile details.
    return reply(res, 504, { ok: false, error: error && error.name === 'AbortError' ? 'provider_timeout' : 'provider_unavailable' });
  }
};
