/* Local-only video compatibility worker for NAP OCR V24.
 * Input and output stay in browser memory. No recording is uploaded.
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
 clean(ffmpeg,'input.mp4');clean(ffmpeg,'output.mp4');
 ffmpeg.FS.writeFile('input.mp4',new Uint8Array(buffer));
 self.postMessage({type:'stage',stage:mode});
 let args;
 if(mode==='remux'){
  args=[
   '-hide_banner','-loglevel','warning',
   '-i','input.mp4','-map','0:v:0','-an',
   '-c:v','copy','-map_metadata','-1',
   '-movflags','+faststart','-fflags','+bitexact','output.mp4'
  ];
 }else{
  args=[
   '-hide_banner','-loglevel','warning',
   '-i','input.mp4','-map','0:v:0','-an',
   '-vf','fps=10,format=yuv420p',
   '-c:v','libx264','-preset','ultrafast','-crf','18',
   '-profile:v','main','-level:v','5.0',
   '-map_metadata','-1','-movflags','+faststart',
   '-fflags','+bitexact','-flags:v','+bitexact','output.mp4'
  ];
 }
 ffmpeg.exec(...args);
 const ret=Number(ffmpeg.ret||0);
 if(ret!==0)throw Error('FFmpeg '+mode+' failed ('+ret+')');
 const out=ffmpeg.FS.readFile('output.mp4');
 if(!out?.byteLength)throw Error('FFmpeg produced no video');
 const copy=out.buffer.slice(out.byteOffset,out.byteOffset+out.byteLength);
 clean(ffmpeg,'input.mp4');clean(ffmpeg,'output.mp4');
 try{ffmpeg.reset?.()}catch{}
 return copy;
}
self.onmessage=async e=>{
 const data=e.data||{};
 if(data.type!=='convert'||!(data.buffer instanceof ArrayBuffer))return;
 try{
  const output=await run(data.mode==='transcode'?'transcode':'remux',data.buffer);
  self.postMessage({type:'done',mode:data.mode,buffer:output},[output]);
 }catch(err){
  self.postMessage({type:'error',mode:data.mode,message:String(err?.message||err)});
 }
};
