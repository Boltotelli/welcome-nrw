/* NRW Bear intake: pure parsers and hero-advice logic.
 * These consume locally recognized text. Nothing is uploaded to a server.
 */
(function(root){
'use strict';
const troopTypes=['infantry','cavalry','archer'];
const fold=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ß/g,'ss').replace(/[–—]/g,'-');
function normalizeNumber(text){
 let s=String(text||'').trim().replace(/[^\d.,-]/g,'');
 if(!s)return null;
 const dots=(s.match(/\./g)||[]).length,commas=(s.match(/,/g)||[]).length;
 if(dots+commas===0)return /^\d{1,12}$/.test(s)?Number(s):null;
 if(/^\d{1,3}(?:[.,]\d{3})+$/.test(s))return Number(s.replace(/[.,]/g,''));
 if(commas&&dots){const dec=s.lastIndexOf(',')>s.lastIndexOf('.')?',':'.';s=s.replace(dec===','?/\./g:/,/g,'').replace(dec,'.');}
 else if(commas)s=s.replace(',', '.');
 return Number.isFinite(Number(s))?Number(s):null;
}
function classFrom(text){
 const s=fold(text).replace(/[^a-z]/g,'');
 if(/infant|infantr|fussvolk|infentry/.test(s))return 0;
 if(/kaval|caval|reiter/.test(s))return 1;
 if(/bogen|archer|marksman|schutze|schutzen/.test(s))return 2;
 return -1;
}
function parseTroops(text){
 const ls=String(text||'').split(/\n+/),values={};
 const pattern=/\b\d{1,3}(?:[., ]\d{3}){1,3}\b|\b\d{4,9}\b/g;
 for(let i=0;i<ls.length;i++){
  const type=classFrom(ls[i]);if(type<0)continue;
  const combined=[ls[i],ls[i+1]||''].join(' ');
  // If OCR puts two troop cards on the same line, never assign both
  // quantities to the first class. Split at each class heading.
  const segments=combined.split(/(?=spitzen\s+(?:infant|kaval|bogen)|(?:(?:infantry|cavalry|archers?)\s*[:\-]))/i);
  for(const segment of segments){
   const kind=classFrom(segment);
   if(kind<0)continue;
   const candidates=[...segment.matchAll(pattern)].map(m=>normalizeNumber(m[0])).filter(n=>Number.isInteger(n)&&n>=100);
   if(candidates.length)values[['troopsI','troopsC','troopsA'][kind]]=candidates[0];
  }
 }
 if(Object.keys(values).length===0&&/spitzen|troop|trupp|schwadronvorschau/i.test(text)){
  const found=[...String(text).matchAll(pattern)].map(x=>normalizeNumber(x[0])).filter(n=>n>=1000&&n<200000000);
  if(found.length===3){values.troopsI=found[0];values.troopsC=found[1];values.troopsA=found[2];}
 }
 return values;
}
function parseMarchSlots(text){
 const value=fold(text).replace(/\s+/g,' ');
 const m=value.match(/(?:marschschlange|march\s*queue|marches)[^\d]{0,24}(\d+)\s*\/\s*(\d+)/i);
 if(!m)return null;
 const total=Number(m[2]);
 return total>=1&&total<=7?total:null;
}
function parseStats(text){
 const out={},lines=String(text||'').split(/\n/);
 for(let i=0;i<lines.length;i++){
  const line=lines[i];const f=fold(line);
  let key=null;
  const type=classFrom(f);
  let prefix=type===0?'i':type===1?'c':type===2?'a':'squad';
  if(/schwadron|squadron|squad|truppengruppe/.test(f))prefix='squad';
  if(/angriff|attack|atk|angrif/.test(f))key='Atk';
  else if(/todlich|lethal|letali/.test(f))key='Let';
  else if(/verteid|defen/.test(f))key='Def';
  else if(/gesund|health|hp\b/.test(f))key='Hp';
  if(!key)continue;
  const target=prefix+key;
  const found=line.match(/[+-]?\d{1,4}[.,]\d{1,3}\s*%?/g);
  const next=(lines[i+1]||'').match(/^\s*[+−-]?\s*\d{1,4}[.,]\d{1,3}\s*%/);
  const candidate=found?.at(-1)||next?.[0];
  const n=candidate?normalizeNumber(candidate):null;
  if(n!==null&&n>=0&&n<=5000)out[target]=n;
 }
 return out;
}
// Read the four expedition percentage rows on an individual hero detail.
// Heroes often show only "Attack" / "Defense" without a troop-class prefix.
// Resolve that class ONLY from the independently identified hero name.
// Every observation still requires a visible labelled value; never
// synthesize base stats from stars, hero level, gear or other heroes.
function parseHeroStats(text,type){
 const prefix={infantry:'i',cavalry:'c',archer:'a'}[type];
 if(!prefix)return {};
 const out={},lines=String(text||'').split(/\n+/);
 for(let i=0;i<lines.length;i++){
  const line=lines[i],f=fold(line);
  const seenType=classFrom(f);
  if(seenType>=0&&['i','c','a'][seenType]!==prefix)continue;
  let key=null;
  if(/angriff|attack|atk|angrif/.test(f))key='Atk';
  else if(/todlich|lethal|letali/.test(f))key='Let';
  else if(/verteid|defen/.test(f))key='Def';
  else if(/gesund|health|hp\b/.test(f))key='Hp';
  if(!key)continue;
  // Require a percentage or a visibly signed decimal, not any digit on
  // the hero's power, widget or skill badges.
  const inline=[...line.matchAll(/([+−-]?\s*\d{1,4}(?:[.,]\d{1,3})?)\s*%/g)];
  const next=(lines[i+1]||'').match(/^\s*([+−-]?\s*\d{1,4}(?:[.,]\d{1,3})?)\s*%\s*$/);
  const fallback=line.match(/[+−-]\s*\d{1,4}[.,]\d{1,3}\s*$/);
  const raw=inline.at(-1)?.[1]||next?.[1]||fallback?.[0];
  const n=raw?normalizeNumber(raw):null;
  if(n!==null&&n>=0&&n<=5000)out[prefix+key]=n;
 }
 return out;
}
function heroFromText(text,known){
 // The very short name Zoe is often read as Z0e / Zoé by mobile OCR.
 // Correct only the tightly bounded name token, not arbitrary text digits.
 const short=fold(String(text||'').slice(0,420))
  .replace(/\bz[0o][e3]\b/g,'zoe');
 const candidates=(known||[]).map(x=>typeof x==='string'?x:x.name).filter(Boolean).sort((a,b)=>b.length-a.length);
 return candidates.find(name=>{
  const simple=fold(name);
  const i=short.indexOf(simple);
  return i>=0&&(i===0||!/[a-z]/.test(short[i-1]))&&(i+simple.length>=short.length||!/[a-z]/.test(short[i+simple.length]));
 })||null;
}
function parseHeroDetail(text,catalog){
 const out={name:heroFromText(text,catalog),kind:'hero-detail'};
 if(!out.name)return null;
 const lv=String(text||'').match(/(?:Lv|Level)\s*\.?\s*(\d{1,3})\b/i);
 if(lv)out.level=Number(lv[1]);
 else if(/maximales\s+level\s+erreicht|maximum\s+level\s+reached/i.test(fold(text)))out.level=80;
 const stats=parseStats(text);
 out.expeditionStats=Object.fromEntries(Object.entries(stats).filter(([k])=>/^[ica](Atk|Def|Let|Hp)$/.test(k)));
 // S6 on the top of Yang's hero detail is hero GENERATION, never stars.
 return out;
}
function maxSkill(stars){
 const s=Number(stars);
 if(!Number.isFinite(s)||s<=0)return null;
 return Math.min(5,Math.max(1,Math.floor(s)+1));
}
// KS Atlas "Bear Rally Heroes" / Kingshot World generation-6 guidance.
// Qualitative preferences; actual stars, widget and skills may reverse them.
const rankByType={
 infantry:['Amadeus','Helga','Zoe','Howard','Charles','Alcar','Long Fei','Triton'],
 cavalry:['Margot','Petra','Thrud','Ava','Hilde','Jabel','Sophia'],
 archer:['Yang','Rosa','Marlin','Wee & Woo','Quinn','Vivian']
};
const rank=(name,type)=>{const i=(rankByType[type]||[]).indexOf(name);return i<0?100:i;};
function advise(owned,selected,heroTypes){
 const map=new Map((owned||[]).filter(h=>h?.name).map(h=>[h.name,h])),result=[];
 for(let i=0;i<3;i++){
  const type=troopTypes[i],cur=(selected||[])[i]||'',own=map.get(cur);
  const candidates=[...map.values()].filter(h=>heroTypes?.[h.name]===type&&h.name!==cur&&rank(h.name,type)<rank(cur,type));
  candidates.sort((a,b)=>rank(a.name,type)-rank(b.name,type));
  for(const h of candidates){
   if(Number(h.level||0)<70)continue;
   const stars=Number(h.stars||0),currentStars=Number(own?.stars||0);
   if(stars>0&&stars<4&&currentStars>=4)continue;
   const widget=Number(h.widget||0),currentWidget=Number(own?.widget||0);
   const caution=Boolean(stars&&currentStars&&stars<currentStars||widget+2<currentWidget);
   result.push({type,slot:i,current:cur||'—',suggestion:h.name,caution,reason:caution?
    'Möglicherweise stärkerer Bear-Starter, aber Sterne und Widget können den Vorteil umkehren.':
    'Stärkerer Bear-Starter laut Gen-6-Rollenempfehlung.'});
   break;
  }
 }
 return result;
}
function category(text){
 const f=fold(String(text||'').slice(0,4000));
 if(/gouverneur.*ausrust|governor.*gear|talismanverbesser/.test(f))return 'gear';
 if(/schwadronvorschau|spitzen\s*infant|spitzen\s*kaval|spitzen\s*bogen|all\s*troops/.test(f))return 'troops';
 if(/bonusubersicht|schwadron\s*angriff|schwadron\s*todlich|infanterie-todlich|bogenschutzen-angriff/.test(f))return 'stats';
 if(/gesamteigenschaften|hero\s*properties|expedition/.test(f))return 'starter';
 if(/helden|heroes/.test(f))return 'roster';
 return 'unknown';
}
root.NRW_BEAR_INTAKE_CORE={parseHeroStats,fold,normalizeNumber,classFrom,parseTroops,parseMarchSlots,parseStats,parseHeroDetail,maxSkill,advise,category,rankByType};
})(window);
