const PLAYER_IDS = new Set(['152066464', '295632062', '295189783']);
const ALLIANCE_TAGS = ['MAD', 'cZp'];

async function fetchAlliance(tag) {
  const url = new URL('https://kingshotstats.com/api/alliances/lookup');
  url.searchParams.set('kid', '1044');
  url.searchParams.set('slug', tag);
  url.searchParams.set('refresh', '1');
  const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
  const text = await response.text();
  let payload = null;
  try { payload = JSON.parse(text); } catch (_) {}
  return { tag, status: response.status, payload };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  const results = await Promise.allSettled(ALLIANCE_TAGS.map(fetchAlliance));
  const alliances = results.map((result, index) => {
    if (result.status !== 'fulfilled') return { tag: ALLIANCE_TAGS[index], error: result.reason?.message || 'failed' };
    const members = Array.isArray(result.value.payload?.members) ? result.value.payload.members : [];
    const targets = members.filter(member => PLAYER_IDS.has(String(member.governor_id || member.fid || '')));
    return {
      tag: result.value.tag,
      status: result.value.status,
      memberKeys: targets[0] ? Object.keys(targets[0]).sort() : [],
      targets
    };
  });
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ alliances });
};
