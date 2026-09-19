const PLAYER_IDS = ['152066464', '295632062', '295189783'];
const CENTRAL_URL = 'https://bdzlgirowutasrsycjfj.supabase.co/functions/v1/kingshot-data';

function normalizeCentral(player) {
  const x = player?.x == null ? null : Number(player.x);
  const y = player?.y == null ? null : Number(player.y);
  const tc = player?.tcLevel == null ? null : Number(player.tcLevel);
  return {
    id: String(player?.playerId || ''),
    nickname: player?.name || '',
    alliance: player?.alliance || '',
    townCenterLevel: Number.isFinite(tc) && tc > 0 ? tc : null,
    x: Number.isFinite(x) ? x : null,
    y: Number.isFinite(y) ? y : null,
    mapKid: 1044,
    locationUpdatedAt: player?.locationUpdatedAt || null,
    locationAvailable: Number.isFinite(x) && Number.isFinite(y),
    shieldState: player?.shieldState || 'unknown',
    shieldEndAt: player?.shieldEndAt || null,
    shieldUpdatedAt: player?.shieldUpdatedAt || null,
    source: player?.source || 'kingshot-cache'
  };
}

async function fetchCentral() {
  const url = new URL(CENTRAL_URL);
  url.searchParams.set('player_ids', PLAYER_IDS.join(','));
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Kingshot data ${response.status}`);
  const payload = await response.json();
  if (!payload?.ok || !Array.isArray(payload.players)) throw new Error('Invalid Kingshot data response');
  return payload.players.map(normalizeCentral).filter(player => player.id);
}

async function fetchAlliance(tag) {
  const url = new URL('https://kingshotstats.com/api/alliances/lookup');
  url.searchParams.set('kid', '1044');
  url.searchParams.set('slug', tag);
  url.searchParams.set('refresh', '1');
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error(`KingshotStats ${response.status}`);
  const payload = await response.json();
  if (!payload?.ok || !Array.isArray(payload.members)) throw new Error('Invalid roster response');
  return payload.members;
}

function toIsoTimestamp(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return new Date(seconds * 1000).toISOString();
}

function normalizeFallback(member) {
  const id = String(member.governor_id || member.fid || '');
  const x = member.x == null ? null : Number(member.x);
  const y = member.y == null ? null : Number(member.y);
  const tcRaw = member.town_center_level ?? member.tc_level ?? member.furnace_level;
  const tc = tcRaw == null ? null : Number(tcRaw);
  return {
    id,
    nickname: member.nick_name || member.name || '',
    alliance: member.alliance_abbr || '',
    townCenterLevel: Number.isFinite(tc) && tc > 0 ? tc : null,
    x: Number.isFinite(x) ? x : null,
    y: Number.isFinite(y) ? y : null,
    mapKid: 1044,
    locationUpdatedAt: toIsoTimestamp(member.map_updated_at),
    locationAvailable: Number.isFinite(x) && Number.isFinite(y),
    shieldState: 'unknown',
    shieldEndAt: null,
    shieldUpdatedAt: null,
    source: 'kingshotstats_fallback'
  };
}

async function fetchFallback() {
  const tags = ['MAD', 'cZp'];
  const results = await Promise.allSettled(tags.map(fetchAlliance));
  const byId = new Map();
  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    for (const member of result.value) {
      const player = normalizeFallback(member);
      if (PLAYER_IDS.includes(player.id) && player.nickname) byId.set(player.id, player);
    }
  }
  return [...byId.values()];
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  let players = [];
  let source = 'kingshot-data';
  try {
    players = await fetchCentral();
  } catch (error) {
    console.warn('Central Kingshot data unavailable', error?.message);
  }

  if (!players.length) {
    source = 'kingshotstats-fallback';
    try {
      players = await fetchFallback();
    } catch (error) {
      console.warn('Fallback roster lookup failed', error?.message);
    }
  }

  const checkedAt = new Date().toISOString();
  res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
  return res.status(200).json({ players, checkedAt, updatedAt: checkedAt, source });
};
