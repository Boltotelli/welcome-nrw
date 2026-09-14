const { createHash } = require('node:crypto');

const PLAYER_IDS = ['152066464', '295632062', '295189783'];
const API_URL = 'https://kingshot-giftcode.centurygame.com/api/player';
const API_KEY = 'mN4!pQs6JrYwV9';

async function fetchPlayer(id) {
  const time = Date.now();
  const base = `fid=${id}&time=${time}`;
  const sign = createHash('md5').update(base + API_KEY).digest('hex');
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fid: id, time: String(time), sign }),
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) throw new Error(`Kingshot API ${response.status}`);
  const payload = await response.json();
  if (!payload?.data?.nickname) throw new Error(payload?.msg || 'Player not found');
  return { id, nickname: payload.data.nickname };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const results = await Promise.allSettled(PLAYER_IDS.map(fetchPlayer));
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.warn('Kingshot player lookup failed', PLAYER_IDS[index], result.reason?.message);
    }
  });
  const players = results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);

  res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
  return res.status(200).json({ players, updatedAt: new Date().toISOString() });
};
