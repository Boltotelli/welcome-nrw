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

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const results = await Promise.allSettled(ALLIANCE_TAGS.map(fetchAlliance));
  const players = results
    .filter(result => result.status === 'fulfilled')
    .flatMap(result => result.value)
    .map(member => ({
      id: String(member.governor_id || member.fid || ''),
      nickname: member.nick_name || member.name || '',
      alliance: member.alliance_abbr || ''
    }))
    .filter(player => PLAYER_IDS.has(player.id) && player.nickname);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.warn('Watchlist roster lookup failed', ALLIANCE_TAGS[index], result.reason?.message);
    }
  });

  res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
  return res.status(200).json({ players, updatedAt: new Date().toISOString() });
};
