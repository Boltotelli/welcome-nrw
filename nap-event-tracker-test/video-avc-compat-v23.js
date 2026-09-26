(()=>{'use strict';
if(window.NAP_AVC_COMPAT_V23)return;
window.NAP_AVC_COMPAT_V23=true;

const LEVELS=[
 [10,99],[11,396],[12,396],[13,396],[20,396],[21,792],[22,1620],
 [30,1620],[31,3600],[32,5120],[40,8192],[41,8192],[42,8704],
 [50,22080],[51,36864],[52,36864],[60,139264],[61,139264],[62,139264]
];

function maxFs(level){
 let best=0;
 for(const [l,fs] of LEVELS)if(level>=l)best=fs;
 return best;
}
function requiredLevel(fs){
 for(const [l,max] of LEVELS)if(fs<=max)return l;
 return 62;
}
function u32(b,i){return (((b[i]<<24)>>>0)|(b[i+1]<<16)|(b[i+2]<<8)|b[i+3])>>>0}

class Bits{
 constructor(bytes){this.b=bytes;this.p=0}
 bit(){const v=(this.b[this.p>>3]>>(7-(this.p&7)))&1;this.p++;return v}
 bits(n){let v=0;for(let i=0;i<n;i++)v=(v<<1)|this.bit();return v>>>0}
 ue(){let z=0;while(this.p<this.b.length*8&&this.bit()===0)z++;if(!z)return 0;return ((1<<z)-1)+this.bits(z)}
 se(){const v=this.ue();return (v&1)?((v+1)>>1):-(v>>1)}
}
function rbsp(nal){
 const out=[];let zeros=0;
 for(let i=1;i<nal.length;i++){
  const v=nal[i];
  if(zeros>=2&&v===3){zeros=0;continue}
  out.push(v);
  if(v===0)zeros++;else zeros=0;
 }
 return new Uint8Array(out);
}
function skipScalingList(br,size){
 let last=8,next=8;
 for(let j=0;j<size;j++){
  if(next!==0)next=(last+br.se()+256)%256;
  last=next===0?last:next;
 }
}
function spsInfo(nal){
 try{
  const br=new Bits(rbsp(nal));
  const profile=br.bits(8);br.bits(8);const level=br.bits(8);br.ue();
  let chroma=1;
  if([100,110,122,244,44,83,86,118,128,138,139,134,135].includes(profile)){
   chroma=br.ue();
   if(chroma===3)br.bit();
   br.ue();br.ue();br.bit();
   if(br.bit()){
    const n=chroma!==3?8:12;
    for(let i=0;i<n;i++)if(br.bit())skipScalingList(br,i<6?16:64);
   }
  }
  br.ue();
  const poc=br.ue();
  if(poc===0)br.ue();
  else if(poc===1){
   br.bit();br.se();br.se();
   const n=br.ue();for(let i=0;i<n;i++)br.se();
  }
  br.ue();br.bit();
  const widthMbs=br.ue()+1,heightMap=br.ue()+1;
  const frameOnly=br.bit();
  if(!frameOnly)br.bit();
  br.bit();
  let cropL=0,cropR=0,cropT=0,cropB=0;
  if(br.bit()){cropL=br.ue();cropR=br.ue();cropT=br.ue();cropB=br.ue()}
  const frameFactor=2-frameOnly;
  let subW=1,subH=1;
  if(chroma===1){subW=2;subH=2}
  else if(chroma===2){subW=2;subH=1}
  const cropX=chroma===0?1:subW;
  const cropY=chroma===0?frameFactor:subH*frameFactor;
  const codedWidth=widthMbs*16,codedHeight=frameFactor*heightMap*16;
  return {
   profile,level,
   width:codedWidth-(cropL+cropR)*cropX,
   height:codedHeight-(cropT+cropB)*cropY,
   fs:widthMbs*heightMap*frameFactor
  };
 }catch{return null}
}
async function locateAvcC(file){
 const span=Math.min(file.size,8*1024*1024);
 if(span<32)return null;
 const starts=[0];if(file.size>span)starts.push(file.size-span);
 for(const start of [...new Set(starts)]){
  const w=new Uint8Array(await file.slice(start,start+span).arrayBuffer());
  for(let i=4;i+16<w.length;i++){
   if(w[i]!==97||w[i+1]!==118||w[i+2]!==99||w[i+3]!==67)continue;
   const local=i-4,size=u32(w,local);
   if(size<15||size>1024*1024)continue;
   const abs=start+local;if(abs+size>file.size)continue;
   const box=new Uint8Array(await file.slice(abs,abs+size).arrayBuffer());
   if(box[4]!==97||box[5]!==118||box[6]!==99||box[7]!==67||box[8]!==1)continue;
   return {abs,size,box};
  }
 }
 return null;
}
async function patchFile(file){
 const name=String(file?.name||'');
 if(!(/\.(mp4|m4v)$/i.test(name)||String(file?.type||'').toLowerCase()==='video/mp4'))return file;
 const found=await locateAvcC(file);if(!found)return file;
 const {abs,size,box}=found;
 const oldLevel=Number(box[11]||0);
 let p=14,info=null,spsStart=-1;
 const count=box[13]&31;
 for(let i=0;i<count;i++){
  if(p+2>box.length)break;
  const len=(box[p]<<8)|box[p+1];p+=2;
  if(len<1||p+len>box.length)break;
  if((box[p]&31)===7&&!info){info=spsInfo(box.slice(p,p+len));spsStart=p}
  p+=len;
 }
 if(!info)return file;
 const declared=oldLevel||info.level||0,max=maxFs(declared);
 if(!max||info.fs<=max)return file;
 const target=requiredLevel(info.fs);
 if(target<=declared)return file;
 box[11]=target;
 p=14;
 for(let i=0;i<count;i++){
  if(p+2>box.length)break;
  const len=(box[p]<<8)|box[p+1];p+=2;
  if(len<1||p+len>box.length)break;
  if((box[p]&31)===7&&len>=4)box[p+3]=target;
  p+=len;
 }
 const out=new File(
  [file.slice(0,abs),box,file.slice(abs+size)],
  file.name,
  {type:'video/mp4',lastModified:file.lastModified}
 );
 console.warn('NAP AVC compatibility applied',{
  file:file.name,profile:info.profile,width:info.width,height:info.height,
  frameMacroblocks:info.fs,declaredLevel:declared,newLevel:target
 });
 return out;
}
const pending=new WeakMap();
document.addEventListener('change',e=>{
 const input=e.target;
 if(!(input instanceof HTMLInputElement)||input.id!=='nocrFile'||!input.files?.[0])return;
 const original=input.files[0];
 const job=patchFile(original).then(file=>{
  if(file!==original&&input.isConnected){
   const dt=new DataTransfer();dt.items.add(file);input.files=dt.files;
  }
  return file;
 }).catch(err=>{console.warn('NAP AVC compatibility check failed',err);return original});
 pending.set(input,job);
},true);

document.addEventListener('click',e=>{
 const btn=e.target?.closest?.('#nocrAnalyze');if(!btn||btn.dataset.avcCompatReplay==='1')return;
 const root=btn.closest('.nocr-layout')?.parentElement||document;
 const input=root.querySelector?.('#nocrFile');
 const job=input&&pending.get(input);if(!job)return;
 e.preventDefault();e.stopImmediatePropagation();
 btn.disabled=true;
 job.finally(()=>{
  if(!btn.isConnected)return;
  btn.disabled=false;btn.dataset.avcCompatReplay='1';
  try{btn.click()}finally{delete btn.dataset.avcCompatReplay}
 });
},true);
})();