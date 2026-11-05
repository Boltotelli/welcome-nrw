// Same public feed used by dashboard/codes.js. No redemption or account data.
export function normalizeGiftFeed(payload){
 if(!payload||!Array.isArray(payload.codes))throw Error('invalid_code_feed');
 const seen=new Set(),codes=[];
 for(const item of payload.codes.slice(0,100)){
  const code=String(typeof item==='string'?item:item?.code||'').trim(),key=code.toUpperCase();
  if(!/^[A-Za-z0-9_.-]{1,80}$/.test(code)||seen.has(key))continue;
  seen.add(key);codes.push({code});
 }
 return {codes,updatedAt:Number.isFinite(Date.parse(payload.updatedAt))?new Date(payload.updatedAt).toISOString():null};
}
export async function loadActiveGiftCodes(){
 const origin=location.hostname==='boltotelli.github.io'?'https://welcome-nrw.vercel.app':location.origin;
 const response=await fetch(new URL('/api/kingshot-codes',origin),{headers:{Accept:'application/json'},credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('code_feed_unavailable');
 return normalizeGiftFeed(await response.json());
}
