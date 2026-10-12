/* Name-only shared Bear profile storage. Server side ONLY.
 * Private GitHub repo; never expose GitHub token to clients.
 * Anonymous first-write claiming with a browser-generated edit key is a
 * temporary safeguard, NOT verified in-game identity. Restrict before launch.
 */
const crypto=require('node:crypto');
const OWNER='Boltotelli',REPO='kingshot-players';
const hex=x=>crypto.createHash('sha256').update(x).digest('hex');
const normalize=x=>typeof x==='string'?x.normalize('NFKC').trim().replace(/\s+/g,' '):'';
const pathFor=name=>'bear/v1/'+hex(name.toLocaleLowerCase('und'))+'.json';
function validName(name){return name.length>=2&&name.length<=50&&!/[<>\\/\r\n\x00-\x1f]/.test(name);}
function pickData(v){
 if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Invalid data');
 const out={};
 const groups=Array.isArray(v.troopGroups)?v.troopGroups.slice(0,36):[];
 out.troopGroups=groups.map(g=>({type:['infantry','cavalry','archer'].includes(g.type)?g.type:null,
  tier:Number(g.tier),tg:Number(g.tg),count:Number(g.count)}));
 if(out.troopGroups.some(g=>!g.type||!Number.isInteger(g.tier)||g.tier<1||g.tier>11||
  !Number.isInteger(g.tg)||g.tg<0||g.tg>8||!Number.isSafeInteger(g.count)||g.count<1||g.count>100000000))
  throw Error('Invalid troop groups');
 out.joinCount=Math.min(6,Math.max(0,Math.trunc(Number(v.joinCount)||0)));
 const rawHeroes=v.heroes&&typeof v.heroes==='object'&&!Array.isArray(v.heroes)?v.heroes:{};
 out.heroes={};
 for(const [name,h] of Object.entries(rawHeroes).slice(0,55)){
  if(!validName(name)||!h||typeof h!=='object')continue;
  const stars=Number(h.stars),tier=Number(h.tier),widget=Number(h.widget);
  if(!Number.isInteger(stars)||stars<0||stars>5||!Number.isInteger(tier)||tier<0||tier>5||
     !Number.isInteger(widget)||widget<0||widget>10)continue;
  out.heroes[name]={stars,tier,widget,level:80};
  if(h.expeditionStats&&typeof h.expeditionStats==='object'){
   out.heroes[name].expeditionStats={};
   for(const k of ['iAtk','iLet','cAtk','cLet','aAtk','aLet']){
    const n=Number(h.expeditionStats[k]);if(h.expeditionStats[k]!==''&&Number.isFinite(n)&&n>=0&&n<=5000)
      out.heroes[name].expeditionStats[k]=n;
   }
  }
 }
 out.ownHeroes=Array.isArray(v.ownHeroes)?v.ownHeroes.filter(x=>typeof x==='string'&&x.length<=50).slice(0,3):[];
 out.values={};
 for(const k of ['cap','troopsI','troopsC','troopsA','iAtk','iLet','cAtk','cLet','aAtk','aLet',
  'squadAtk','squadLet','pet','master']){
  if(!v.values||v.values[k]===undefined||v.values[k]===null||v.values[k]==='')continue;
  const n=Number(v.values[k]);if(!Number.isFinite(n)||n<0||n>100000000)throw Error('Invalid '+k);
  out.values[k]=n;
 }
 out.valoraTalent=Math.max(0,Math.min(11,Math.trunc(Number(v.valoraTalent)||0)));
 out.savageAdvantage=Math.max(0,Math.min(10,Math.trunc(Number(v.savageAdvantage)||0)));
 out.petActive={};out.petSkillRanks={};
 for(const k of ['Giant Rhino','Black Panther','War Bear','Moose','Mighty Bison']){
  if(v.petActive?.[k]===true)out.petActive[k]=true;
  const n=Number(v.petSkillRanks?.[k]);if(Number.isInteger(n)&&n>=1&&n<=10)out.petSkillRanks[k]=n;
 }
 out.combatStatOrigin=['separate-overview','combined-report'].includes(v.combatStatOrigin)?v.combatStatOrigin:'combined-report';
 out.petBuffCapturedInStats=v.petBuffCapturedInStats===true;
 return out;
}
async function gh(path,method='GET',body){
 const token=process.env.BEAR_GITHUB_TOKEN;
 if(!token)throw Object.assign(Error('Shared saving not configured'),{status:503});
 const response=await fetch('https://api.github.com/repos/'+OWNER+'/'+REPO+'/contents/'+path,{
  method,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json',
   'X-GitHub-Api-Version':'2022-11-28'},body:body?JSON.stringify(body):undefined,
  signal:AbortSignal.timeout(9000)});
 if(response.status===404)return null;
 if(!response.ok)throw Object.assign(Error('GitHub storage unavailable'),{status:response.status===409?409:502});
 return response.json();
}
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 res.setHeader('X-Content-Type-Options','nosniff');
 try{
  if(!['GET','POST'].includes(req.method)){res.status(405).json({error:'method'});return;}
  const name=normalize(req.method==='GET'?req.query.name:req.body?.name);
  if(!validName(name)){res.status(400).json({error:'name'});return;}
  const path=pathFor(name),stored=await gh(path);
  const record=stored?JSON.parse(Buffer.from(stored.content.replace(/\s/g,''),'base64').toString('utf8')):null;
  if(req.method==='GET'){res.status(record?200:404).json(record?{name:record.name,data:record.data,version:stored.sha}:{error:'not-found'});return;}
  if(process.env.BEAR_WRITE_ENABLED!=='true'){res.status(503).json({error:'writes-disabled'});return;}
  const origin=req.headers.origin;const hostname=req.headers.host;
  if(origin&&new URL(origin).host!==hostname){res.status(403).json({error:'cross-origin'});return;}
  const editKey=req.body?.editKey;
  if(typeof editKey!=='string'||!/^[a-f0-9]{64}$/i.test(editKey)){res.status(403).json({error:'edit-key-required'});return;}
  const keyHash=hex(editKey);
  if(record&&record.keyHash!==keyHash){res.status(403).json({error:'profile-protected'});return;}
  if(record&&record.name.toLocaleLowerCase('und')!==name.toLocaleLowerCase('und')){
   res.status(409).json({error:'name-collision'});return;
  }
  if(record&&req.body.version!==stored.sha){res.status(409).json({error:'stale-profile'});return;}
  const data=pickData(req.body?.data);
  const value={schema:1,name:record?.name||name,keyHash,data,updatedAt:new Date().toISOString()};
  const saved=await gh(path,'PUT',{message:'Update Bear profile (name only): '+hex(name).slice(0,12),
   content:Buffer.from(JSON.stringify(value,null,2)).toString('base64'),...(stored?{sha:stored.sha}:{})});
  res.status(200).json({ok:true,name:value.name,version:saved.content?.sha||null});
 }catch(err){
  res.status(err.status||400).json({error:err.message==='Invalid data'?'invalid-data':err.status===503?'not-configured':'request-failed'});
 }
};
