'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(__dirname+'/hero-grid.js','utf8'),context);
const GRID=context.window.NRW_BEAR_HERO_GRID;
for(const [w,h] of [[1080,1920],[716,1536],[1440,2560]]){
 const rgba=new Uint8ClampedArray(w*h*4);
 for(let i=0;i<rgba.length;i+=4){rgba[i]=224;rgba[i+1]=209;rgba[i+2]=185;rgba[i+3]=255;}
 const x0s=[.04,.272,.504,.736],rw=Math.round(w*.211),rh=Math.round(w*.366),gap=Math.round(w*.035),start=Math.round(h*.08);
 for(let row=0;row<3;row++){
  const y0=start+row*(rh+gap);
  for(const x0 of x0s){const xx=Math.round(x0*w);
   for(let y=y0;y<y0+rh;y++)for(let x=xx;x<xx+rw;x++){
    const p=(y*w+x)*4;rgba[p]=220;rgba[p+1]=132;rgba[p+2]=24;
   }
  }
 }
 const rows=GRID.rowsFromPixels(rgba,w,h);
 assert.equal(rows.length,3,w+'x'+h+' should find 3 full gallery rows, got '+rows.length);
 for(const row of rows){const rect=GRID.tileRect(w,row,2);
  assert.ok(rect.w/w>.19&&rect.w/w<.23);
  assert.ok(rect.h/w>.30&&rect.h/w<.42);
 }
}
console.log('BEAR HERO GRID: 1080x1920, 716x1536, 1440x2560 all located by relative card width.');
