'use strict';
// Regression for the real production failure on 2026-10-16:
// body.bear-name-mode hides all direct children except #bearNewApp.
// A help modal appended to document.body was clickable but invisible.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'help-ui.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'name-flow.css'),'utf8');
assert(css.includes('body.bear-name-mode>*:not(#bearNewApp){display:none!important}'),
 'The visibility regression requires the real app shell CSS');
assert(!source.includes('document.body.append(overlay)'),
 'Never append a user-visible overlay directly to hidden body children');
assert(source.includes("document.getElementById('bearNewApp')"),
 'The help must target the real visible V3 app element');
class Fake {
 constructor(tag){this.tagName=tag;this.children=[];this.events={};this.attributes={};
  this.className='';this.style={};this.textContent='';this.hidden=false;this.isConnected=true;
 }
 append(...nodes){for(const x of nodes){x.parentNode=this;this.children.push(x);}}
 appendChild(n){this.append(n);}
 replaceChildren(...nodes){this.children=[];this.append(...nodes);}
 setAttribute(k,v){this.attributes[k]=v;}
 addEventListener(k,f){this.events[k]=f;}
 removeEventListener(k){delete this.events[k];}
 click(){this.events.click?.({target:this,preventDefault(){},stopPropagation(){}});}
 focus(){document.activeElement=this;}
 remove(){this.isConnected=false;const a=this.parentNode?.children;const idx=a?.indexOf(this);if(idx>=0)a.splice(idx,1);}
 querySelectorAll(){return [];}
 querySelector(){return null;}
}
const document={
 activeElement:null,
 body:new Fake('body'),head:new Fake('head'),events:{},
 createElement(tag){return new Fake(tag)},
 getElementById(id){return id==='bearNewApp'?app:null},
 addEventListener(k,f){this.events[k]=f;},
 removeEventListener(k){delete this.events[k];}
};
const app=new Fake('main');app.id='bearNewApp';document.body.append(app);
const window={NRW_BEAR_HELP_IMAGES:{
 city:'data:image/webp;base64,V0VCUA==',governor:'data:image/webp;base64,V0VCUA==',
 troops:'data:image/webp;base64,V0VCUA=='
}};
vm.runInNewContext(source,{window,document,console,Promise},{filename:'help-ui.js'});
const icon=window.NRW_BEAR_HELP.icon('march');assert(icon);
icon.click();
assert.equal(app.children.length,1,'Dialog must be inserted inside #bearNewApp');
assert.equal(document.body.children.length,1,'Dialog must not be a separate hidden body child');
const overlay=app.children[0];
assert.equal(overlay.className,'bear-name-help-backdrop');
assert.equal(overlay.attributes['aria-modal'],undefined);
const panel=overlay.children[0];
assert.equal(panel.attributes['aria-modal'],'true');
const main=panel.children.find(x=>x.className==='bear-name-help-content');
assert(main.children.some(x=>x.textContent.includes('Startermarsch')));
const navigation=panel.children.find(x=>x.className==='bear-name-help-nav');
const next=navigation.children[2];next.click();
assert(main.children.some(x=>x.textContent.includes('7 Märsche')));
const done=navigation.children[3];done.click();
assert.equal(app.children.length,0,'Close button must remove visible dialog');
assert.equal(document.body.children.length,1,'Close must not disrupt the V3 app');
window.NRW_BEAR_HELP.icon('troops').click();
assert.equal(app.children.length,1,'Screenshot-backed help must open, too');
assert(app.children[0].children[0].children.some(x=>x.className==='bear-name-help-content'));
console.log('PASS: help [i] click opens visible in-app overlay, navigation advances, dialog closes, screenshot guide opens');
