/* Public read-only Kingshot Alliance Command MCP reference proxy.
 * Tool schemas are discovered, not guessed. No player account OAuth here.
 * Hero artwork is only referenced if KAC returns an approved HTTPS image URL.
 */
const ALLOWED=new Set(('Olive Edwin Forrest Seth Quinn Diana Amane Yeonwoo Chenko Amadeus Helga Jabel Howard Saul Fahd Gordon Eric Jaeger Jaegar Petra Alcar Margot Rosa Vivian Hilde Marlin Sophia Triton Yang Ava Charles').split(' ').concat(['Long Fei','Wee & Woo','Zoe','Thrud','Luna','Liz','Diego']));
const endpoint='https://api.kingshotcommand.com/mcp';
async function rpc(method,params){
 const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',
  Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,...(params?{params}:{})}),
  signal:AbortSignal.timeout(6000)});
 if(!response.ok)throw Error('Source unavailable');
 const result=await response.json();
 if(result.error||result.result?.isError)throw Error('Source rejected request');
 return result.result;
}
function contentJson(result){
 for(const item of result?.content||[]){if(item.type==='text'&&item.text){try{return JSON.parse(item.text)}catch(_){return {description:item.text.slice(0,10000)}}}}
 return result||{};
}
function findArt(node,seen=new Set(),depth=0){
 if(!node||typeof node!=='object'||depth>5||seen.has(node))return null;seen.add(node);
 for(const [key,value] of Object.entries(node)){
  if(typeof value==='string'&&/(image|portrait|icon|avatar|artwork)/i.test(key)){
   try{const u=new URL(value);if(u.protocol==='https:'&&u.hostname.endsWith('kingshotcommand.com'))return value}catch(_){}
  }
 }
 for(const value of Object.values(node)){const found=findArt(value,seen,depth+1);if(found)return found}
 return null;
}
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','public, max-age=3600, s-maxage=86400');
 if(req.method!=='GET')return res.status(405).json({error:'method'});
 const requested=String(req.query.hero||'').trim();
 const hero=requested==='Jaegar'?'Jaeger':requested;
 if(!ALLOWED.has(hero))return res.status(400).json({error:'unknown-hero'});
 try{
  const tools=await rpc('tools/list');
  const schema=tools.tools?.find(x=>x.name==='get_hero')?.inputSchema;
  if(!schema)throw Error('Missing schema');
  const fields=Object.keys(schema.properties||{});
  const required=schema.required||fields;
  const preferred=['name','hero','key','slug','hero_name'];
  const nameField=preferred.find(k=>required.includes(k))||required[0];
  if(!nameField||required.some(k=>k!==nameField))throw Error('Unsupported schema');
  const input=nameField==='slug'||nameField==='key'?hero.toLowerCase().replace(/[^a-z0-9]+/g,'-'):hero;
  const result=contentJson(await rpc('tools/call',{name:'get_hero',arguments:{[nameField]:input}}));
  res.status(200).json({hero,source:'Kingshot Alliance Command / public MCP',
   sourceUrl:'https://www.kingshotcommand.com/heroes/'+hero.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
   imageUrl:findArt(result),reference:result});
 }catch(err){res.status(502).json({error:'reference-temporarily-unavailable'});}
};
