/* NAP OCR V25 desktop video compatibility gate.
 * Keeps the recording local. It only prepares a browser-decodable File before
 * the existing native-screen-import.js receives the selected recording.
 */
(()=>{'use strict';
if(window.NAP_VIDEO_COMPAT_V25)return;
window.NAP_VIDEO_COMPAT_V25=true;

const TEXT={
 de:{checking:'Video-Kompatibilität wird geprüft …',patched:'H.264-Level lokal korrigiert · Video wird geprüft …',remux:'Browser lehnt das Video ab · lokaler MP4-Reparaturversuch …',transcode:'H.264-Pfad wird umgangen · Video wird lokal als WebM/VP8 vorbereitet …',ready:'Video bereit · V25',repaired:'Video lokal repariert · Analyse kann starten',converted:'Video lokal kompatibel gemacht · Analyse kann starten',failed:'Video konnte lokal nicht kompatibel gemacht werden'},
 en:{checking:'Checking video compatibility …',patched:'H.264 level corrected locally · checking video …',remux:'Browser rejected the video · repairing MP4 locally …',transcode:'Bypassing H.264 · preparing a local WebM/VP8 copy …',ready:'Video ready · V25',repaired:'Video repaired locally · analysis can start',converted:'Video converted locally · analysis can start',failed:'Video could not be made compatible locally'},
 fr:{checking:'Vérification de la compatibilité vidéo …',patched:'Niveau H.264 corrigé localement · vérification …',remux:'Vidéo refusée par le navigateur · réparation MP4 locale …',transcode:'Contournement de H.264 · préparation locale WebM/VP8 …',ready:'Vidéo prête · V25',repaired:'Vidéo réparée localement · analyse prête',converted:'Vidéo convertie localement · analyse prête',failed:'Impossible de rendre la vidéo compatible localement'},
 es:{checking:'Comprobando compatibilidad del vídeo …',patched:'Nivel H.264 corregido localmente · comprobando …',remux:'El navegador rechazó el vídeo · reparando MP4 localmente …',transcode:'Omitiendo H.264 · preparando una copia WebM/VP8 local …',ready:'Vídeo listo · V25',repaired:'Vídeo reparado localmente · análisis listo',converted:'Vídeo convertido localmente · análisis listo',failed:'No se pudo hacer compatible el vídeo localmente'}
};
const LEVELS=[[10,99],[11,396],[12,396],[13,396],[20,396],[21,792],[22,1620],[30,1620],[31,3600],[32,5120],[40,8192],[41,8192],[42,8704],[50,22080],[51,36864],[52,36864],[60,139264],[61,139264],[62,139264]];
const pending=new WeakMap();

function lang(){
 const picker=document.querySelector('#languagePicker')?.value;
 return TEXT[picker]?picker:'de';
}
function msg(k){return TEXT[lang()]?.[k]||TEXT.de[k]||k}
function status(input,text,isError=false){
 const panel=input?.closest?.('.nocr-panel');
 const el=panel?.querySelector?.('#nocrStatus')||document.querySelector('#nocrStatus');
 if(!el)return;
 el.textContent=text;
 el.classList.toggle('error',!!isError);
}
function setFile(input,file){
 if(!file||file===input.files?.[0])return;
 const dt=new DataTransfer();dt.items.add(file);input.files=dt.files;
}
function u32(b,i){return (((b[i]<<24)>>>0)|(b[i+1]<<16)|(b[i+2]<<8)|b[i+3])>>>0}
function maxFs(level){let best=0;for(const [l,fs] of LEVELS)if(level>=l)best=fs;return best}
function requiredLevel(fs){for(const [l,max] of LEVELS)if(fs<=max)return l;return 62}
class Bits{
 constructor(bytes){this.b=bytes;this.p=0}
 bit(){if(this.p>=this.b.length*8)throw Error('SPS ended');const v=(this.b[this.p>>3]>>(7-(this.p&7)))&1;this.p++;return v}
 bits(n){let v=0;for(let i=0;i<n;i++)v=(v*2)+this.bit();return v}
 ue(){let z=0;while(this.bit()===0){z++;if(z>31)throw Error('SPS value too large')}return z?Math.pow(2,z)-1+this.bits(z):0}
 se(){const v=this.ue();return (v&1)?((v+1)>>1):-(v>>1)}
}
function rbsp(nal){
 const out=[];let zeros=0;
 for(let i=1;i<nal.length;i++){
  const v=nal[i];
  if(zeros>=2&&v===3){zeros=0;continue}
  out.push(v);if(v===0)zeros++;else zeros=0;
 }
 return new Uint8Array(out);
}
function skipScalingList(br,size){
 let last=8,next=8;
 for(let j=0;j<size;j++){if(next!==0)next=(last+br.se()+256)%256;last=next===0?last:next}
}
function spsInfo(nal){
 try{
  const br=new Bits(rbsp(nal));
  const profile=br.bits(8);br.bits(8);const level=br.bits(8);br.ue();
  let chroma=1;
  if([100,110,122,244,44,83,86,118,128,138,139,134,135].includes(profile)){
   chroma=br.ue();if(chroma===3)br.bit();br.ue();br.ue();br.bit();
   if(br.bit()){const n=chroma!==3?8:12;for(let i=0;i<n;i++)if(br.bit())skipScalingList(br,i<6?16:64)}
  }
  br.ue();
  const poc=br.ue();
  if(poc===0)br.ue();
  else if(poc===1){br.bit();br.se();br.se();const n=br.ue();for(let i=0;i<n;i++)br.se()}
  br.ue();br.bit();
  const widthMbs=br.ue()+1,heightMap=br.ue()+1;
  const frameOnly=br.bit();if(!frameOnly)br.bit();br.bit();
  let cropL=0,cropR=0,cropT=0,cropB=0;
  if(br.bit()){cropL=br.ue();cropR=br.ue();cropT=br.ue();cropB=br.ue()}
  const factor=2-frameOnly;
  let subW=1,subH=1;if(chroma===1){subW=2;subH=2}else if(chroma===2){subW=2;subH=1}
  const cropX=chroma===0?1:subW,cropY=chroma===0?factor:subH*factor;
  return {
   profile,level,
   width:widthMbs*16-(cropL+cropR)*cropX,
   height:factor*heightMap*16-(cropT+cropB)*cropY,
   fs:widthMbs*heightMap*factor
  };
 }catch{return null}
}
async function locateAvcC(file){
 const span=Math.min(file.size,8*1024*1024);if(span<32)return null;
 const starts=[0];if(file.size>span)starts.push(file.size-span);
 for(const start of [...new Set(starts)]){
  const w=new Uint8Array(await file.slice(start,start+span).arrayBuffer());
  for(let i=4;i+16<w.length;i++){
   if(w[i]!==97||w[i+1]!==118||w[i+2]!==99||w[i+3]!==67)continue;
   const local=i-4,size=u32(w,local);if(size<15||size>1024*1024)continue;
   const abs=start+local;if(abs+size>file.size)continue;
   const box=new Uint8Array(await file.slice(abs,abs+size).arrayBuffer());
   if(box[4]===97&&box[5]===118&&box[6]===99&&box[7]===67&&box[8]===1)return {abs,size,box};
  }
 }
 return null;
}
async function patchAvcLevel(file){
 const found=await locateAvcC(file);if(!found)return {file,changed:false,info:null};
 const {abs,size,box}=found;
 const declared=Number(box[11]||0);
 let p=14,info=null;
 const count=box[13]&31;
 for(let i=0;i<count;i++){
  if(p+2>box.length)break;
  const len=(box[p]<<8)|box[p+1];p+=2;if(len<1||p+len>box.length)break;
  if((box[p]&31)===7&&!info)info=spsInfo(box.slice(p,p+len));
  p+=len;
 }
 if(!info)return {file,changed:false,info:null};
 const effective=declared||info.level||0;
 if(!maxFs(effective)||info.fs<=maxFs(effective))return {file,changed:false,info:{...info,declaredLevel:effective}};
 const target=requiredLevel(info.fs);if(target<=effective)return {file,changed:false,info:{...info,declaredLevel:effective}};
 box[11]=target;p=14;
 for(let i=0;i<count;i++){
  if(p+2>box.length)break;
  const len=(box[p]<<8)|box[p+1];p+=2;if(len<1||p+len>box.length)break;
  if((box[p]&31)===7&&len>=4)box[p+3]=target;
  p+=len;
 }
 const out=new File([file.slice(0,abs),box,file.slice(abs+size)],file.name,{type:'video/mp4',lastModified:file.lastModified});
 const details={...info,declaredLevel:effective,newLevel:target};
 console.warn('NAP V25 AVC level patch',details);
 return {file:out,changed:true,info:details};
}
function probeVideo(file,timeout=6500){
 return new Promise(resolve=>{
  const video=document.createElement('video'),url=URL.createObjectURL(file);
  video.preload='auto';video.muted=true;video.playsInline=true;
  let done=false,timer=0;
  const finish=(ok,reason)=>{
   if(done)return;done=true;clearTimeout(timer);
   video.removeEventListener('loadeddata',ready);video.removeEventListener('canplay',ready);video.removeEventListener('error',bad);
   const result={
    ok,reason,code:Number(video.error?.code||0),readyState:video.readyState,
    width:video.videoWidth,height:video.videoHeight,
    duration:Number.isFinite(video.duration)?video.duration:null,
    h264Support:video.canPlayType?.('video/mp4; codecs="avc1.4D0032"')||'',
    vp8Support:video.canPlayType?.('video/webm; codecs="vp8"')||''
   };
   try{video.removeAttribute('src')}catch{}URL.revokeObjectURL(url);resolve(result);
  };
  const ready=()=>{if(video.readyState>=2&&video.videoWidth>0&&video.videoHeight>0)finish(true,'decoded')};
  const bad=()=>finish(false,'media error');
  video.addEventListener('loadeddata',ready);video.addEventListener('canplay',ready);video.addEventListener('error',bad,{once:true});
  timer=setTimeout(()=>ready()||finish(false,'decode timeout'),timeout);
  video.src=url;ready();
 });
}
function workerConvert(file,mode,input){
 return new Promise(async(resolve,reject)=>{
  let w;
  try{
   w=new Worker(new URL('./video-normalizer-worker-v25.js',location.href));
   const timer=setTimeout(()=>{try{w.terminate()}catch{}reject(Error('local '+mode+' timed out'))},mode==='transcode'?180000:60000);
   w.onmessage=e=>{
    const d=e.data||{};
    if(d.type==='stage'){
     if(d.stage==='loading-core')status(input,mode==='transcode'?msg('transcode'):msg('remux'));
     return;
    }
    if(d.type==='log'){console.debug('NAP V25 ffmpeg',d.message);return}
    if(d.type==='error'){
     clearTimeout(timer);w.terminate();reject(Error(d.message||('local '+mode+' failed')));return;
    }
    if(d.type==='done'&&d.buffer instanceof ArrayBuffer){
     clearTimeout(timer);w.terminate();
     const base=String(file.name||'recording').replace(/\.[^.]+$/,'');
     const isWebm=mode==='transcode';
     resolve(new File([d.buffer],base+(isWebm?'.nap-v25.webm':'.nap-v25.mp4'),{
      type:isWebm?'video/webm':'video/mp4',
      lastModified:file.lastModified
     }));
    }
   };
   w.onerror=e=>{clearTimeout(timer);try{w.terminate()}catch{}reject(Error(e.message||'local video worker failed'))};
   const buffer=await file.arrayBuffer();
   w.postMessage({type:'convert',mode,buffer},[buffer]);
  }catch(err){try{w?.terminate()}catch{}reject(err)}
 });
}
async function prepare(input,original){
 status(input,msg('checking'));
 let current=original;
 const patched=await patchAvcLevel(original);
 if(patched.changed){current=patched.file;status(input,msg('patched'))}
 let probe=await probeVideo(current);
 console.warn('NAP V25 primary probe',{probe,patch:patched.info,file:original.name,size:original.size,type:original.type});
 if(probe.ok){
  setFile(input,current);status(input,msg('ready'));return current;
 }
 status(input,msg('remux'));
 const remuxed=await workerConvert(current,'remux',input);
 probe=await probeVideo(remuxed,8000);
 console.warn('NAP V25 remux probe',probe);
 if(probe.ok){
  setFile(input,remuxed);status(input,msg('repaired'));return remuxed;
 }
 status(input,msg('transcode'));
 const converted=await workerConvert(current,'transcode',input);
 probe=await probeVideo(converted,10000);
 console.warn('NAP V25 transcode probe',probe);
 if(probe.ok){
  setFile(input,converted);status(input,msg('converted'));return converted;
 }
 throw Error(msg('failed')+' · browser media code '+(probe.code||0)+' · '+probe.reason);
}
document.addEventListener('change',e=>{
 const input=e.target;
 if(!(input instanceof HTMLInputElement)||input.id!=='nocrFile'||!input.files?.[0])return;
 const original=input.files[0];
 const job=prepare(input,original);
 pending.set(input,job);
 job.catch(err=>{console.error('NAP V25 preparation',err);status(input,(err.message||String(err)),true)});
},true);

document.addEventListener('click',e=>{
 const btn=e.target?.closest?.('#nocrAnalyze');
 if(!btn||btn.dataset.v24Replay==='1')return;
 const root=btn.closest('.nocr-layout')?.parentElement||document;
 const input=root.querySelector?.('#nocrFile');
 const job=input&&pending.get(input);
 if(!job)return;
 e.preventDefault();e.stopImmediatePropagation();
 btn.disabled=true;
 job.then(()=>{
  if(!btn.isConnected)return;
  btn.disabled=false;btn.dataset.v24Replay='1';
  try{btn.click()}finally{delete btn.dataset.v24Replay}
 }).catch(err=>{
  btn.disabled=false;
  status(input,(err.message||String(err)),true);
 });
},true);
})();