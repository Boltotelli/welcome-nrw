module.exports = async function handler(req,res){
  const id=String(req.query?.id||'').trim();
  if(!/^\d{5,20}$/.test(id)) return res.status(400).json({error:'invalid'});
  try{
    const urls=[
      'https://jeabslist.com/api/search?q='+encodeURIComponent(id)+'&limit=200&offset=0&scope=current',
      'https://jeabslist.com/api/search?q='+encodeURIComponent(id)+'&limit=200&offset=0&scope=full'
    ];
    const out=[];
    for(const url of urls){
      const r=await fetch(url,{headers:{Accept:'application/json','User-Agent':'Mozilla/5.0 LocationBot/1.0'},signal:AbortSignal.timeout(15000)});
      const text=await r.text();
      out.push({url,status:r.status,contentType:r.headers.get('content-type'),body:text.slice(0,12000)});
    }
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json({out});
  }catch(e){return res.status(500).json({error:String(e)})}
};