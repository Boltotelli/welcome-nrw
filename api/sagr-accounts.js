const PLAYER_IDS = new Set(['152066464', '295632062', '295189783']);
const ALLIANCE_TAGS = ['MAD', 'cZp'];

async function fetchAlliance(tag) {
  const url = new URL('https://kingshotstats.com/api/alliances/lookup');
  url.searchParams.set('kid', '1044');
  url.searchParams.set('slug', tag);
  url.searchParams.set('refresh', '1');

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error(`KingshotStats ${response.status}`);

  const payload = await response.json();
  if (!payload?.ok || !Array.isArray(payload.members)) {
    throw new Error('Invalid roster response');
  }
  return payload.members;
}

function toIsoTimestamp(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return new Date(seconds * 1000).toISOString();
}

function normalizeMember(member) {
  const id = String(member.governor_id || member.fid || '');
  const x = Number(member.x);
  const y = Number(member.y);
  const mapKid = Number(member.map_kid);
  const hasCoordinates = Number.isFinite(x) && Number.isFinite(y) && x >= 0 && y >= 0;
  const isKingdom1044 = !Number.isFinite(mapKid) || mapKid === 1044;

  return {
    id,
    nickname: member.nick_name || member.name || '',
    alliance: member.alliance_abbr || '',
    x: hasCoordinates && isKingdom1044 ? x : null,
    y: hasCoordinates && isKingdom1044 ? y : null,
    mapKid: Number.isFinite(mapKid) ? mapKid : null,
    locationUpdatedAt: toIsoTimestamp(member.map_updated_at),
    locationAvailable: Boolean(hasCoordinates && isKingdom1044)
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const results = await Promise.allSettled(ALLIANCE_TAGS.map(fetchAlliance));
  const byId = new Map();

  results
    .filter(result => result.status === 'fulfilled')
    .flatMap(result => result.value)
    .map(normalizeMember)
    .filter(player => PLAYER_IDS.has(player.id) && player.nickname)
    .forEach(player => {
      const previous = byId.get(player.id);
      if (!previous) {
        byId.set(player.id, player);
        return;
      }
      const previousTime = Date.parse(previous.locationUpdatedAt || '') || 0;
      const playerTime = Date.parse(player.locationUpdatedAt || '') || 0;
      if ((!previous.locationAvailable && player.locationAvailable) || playerTime > previousTime) {
        byId.set(player.id, player);
      }
    });

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.warn('Watchlist roster lookup failed', ALLIANCE_TAGS[index], result.reason?.message);
    }
  });

  const players = [...byId.values()];
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');
  return res.status(200).json({ players, updatedAt: new Date().toISOString() });
};
