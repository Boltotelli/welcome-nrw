/* Local-only video normalizer for NAP OCR V25.
 * Keeps the recording in browser memory. Normal path remuxes MP4; fallback
 * bypasses H.264 entirely by producing WebM/VP8 for Chromium OCR playback.
 */
'use strict';
const CORE_URL='https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js';
const WASM_URL='https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm';
let corePromise=null;

function log(message){self.postMessage({type:'log',message:String(message||'')})}
async function getCore(){
 if(corePromise)return corePromise;
 corePromise=(async()=>{
  self.postMessage({type:'stage',stage:'loading-core'});
  importScripts(CORE_URL);
  if(typeof self.createFFmpegCore!=='function')throw Error('FFmpeg core did not load');
  const mainScriptUrlOrBlob=CORE_URL+'#'+btoa(JSON.stringify({wasmURL:WASM_URL,workerURL:''}));
  const ffmpeg=await self.createFFmpegCore({mainScriptUrlOrBlob});
  ffmpeg.setLogger?.(({message})=>log(message));
  return ffmpeg;
 })();
 return corePromise;
}
function clean(ffmpeg,path){try{ffmpeg.FS.unlink(path)}catch{}}
async function run(mode,buffer){
 const ffmpeg=await getCore();
 clean(ffmpeg,'input.mp4');clean(ffmpeg,'output.mp4');clean(ffmpeg,'output.webm');
 ffmpeg.FS.writeFile('input.mp4',new Uint8Array(buffer));
 self.postMessage({type:'stage',stage:mode});
 let args,outPath;
 if(mode==='remux'){
  outPath='output.mp4';
  args=[
   '-hide_banner','-loglevel','warning',
   '-i','input.mp4','-map','0:v:0','-an',
   '-c:v','copy','-map_metadata','-1',
   '-movflags','+faststart','-fflags','+bitexact',outPath
  ];
 }else{
  outPath='output.webm';
  args=[
   '-hide_banner','-loglevel','warning',
   '-i','input.mp4','-map','0:v:0','-an',
   '-vf','fps=8,format=yuv420p',
   '-c:v','libvpx',
   '-deadline','realtime','-cpu-used','8','-threads','4',
   '-b:v','8M','-crf','10','-qmin','4','-qmax','24',
   '-auto-alt-ref','0',
   '-map_metadata','-1','-fflags','+bitexact',outPath
  ];
 }
 ffmpeg.exec(...args);
 const ret=Number(ffmpeg.ret||0);
 if(ret!==0)throw Error('FFmpeg '+mode+' failed ('+ret+')');
 const out=ffmpeg.FS.readFile(outPath);
 if(!out?.byteLength)throw Error('FFmpeg produced no video');
 const copy=out.buffer.slice(out.byteOffset,out.byteOffset+out.byteLength);
 clean(ffmpeg,'input.mp4');clean(ffmpeg,'output.mp4');clean(ffmpeg,'output.webm');
 try{ffmpeg.reset?.()}catch{}
 return copy;
}
self.onmessage=async e=>{
 const data=e.data||{};
 if(data.type!=='convert'||!(data.buffer instanceof ArrayBuffer))return;
 try{
  const mode=data.mode==='transcode'?'transcode':'remux';
  const output=await run(mode,data.buffer);
  self.postMessage({type:'done',mode,buffer:output},[output]);
 }catch(err){
  self.postMessage({type:'error',mode:data.mode,message:String(err?.message||err)});
 }
};