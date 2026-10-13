/* Kingshot ministry UI regression without a browser dependency.
 * Checks that both slide positions really change stored court and displayed
 * coefficients, and that supplied image filenames map FC swords / M fist.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'name-flow.js'),'utf8');
const begin=source.indexOf('function ministerSection(){');
const end=source.indexOf('function scalarSection(){',begin);
assert(begin>=0&&end>begin,'Minister UI must exist');
const fragment=source.slice(begin,end);
assert(!fragment.includes("range.type='range'"),
 'Do not destroy a native range while its input event is still dragging');
const actual={court:'king',fc:true,m:true};
let saveCount=0,lastReplacement=null,events=[];
function el(tag,cls='',txt=''){
 const node={tag,className:cls,textContent:txt,children:[],dataset:{},
  attrs:{},listeners:{},style:{},isConnected:true,checked:false,
  classList:{toggle(){}},setAttribute(k,v){this.attrs[k]=v;},
  addEventListener(k,fn){this.listeners[k]=fn;},
  append(...nodes){this.children.push(...nodes);},
  replaceWith(node){lastReplacement=node;}};
 events.push(node);return node;
}
const fake={
 state:()=>({v2:{ministers:actual}}),
 el,title:(s)=>el('h3','',s),T:s=>s,
 button:(name,fn,cls)=>{const b=el('button',cls,name);b.listeners.click=fn;return b;},
 saveLocal:()=>{saveCount++;},
 render:()=>{throw Error('A complete re-render would interrupt the minister control');},
 num:n=>n.toLocaleString('de-DE'),
 window:{NRW_BEAR_MINISTERS:{metadata:{
  king:{fcLethality:10,marshalAttack:5,marshalCapacity:2500},
  highKing:{fcLethality:15,marshalAttack:8,marshalCapacity:3750}
 }}}
};
vm.runInNewContext(fragment+'\nthis.renderMinister=ministerSection;',fake);
function find(node,predicate){
 if(predicate(node))return node;
 for(const child of node.children||[]){const result=find(child,predicate);if(result)return result;}
 return null;
}
const initial=fake.renderMinister();
const high=find(initial,x=>x.tag==='button'&&x.textContent==='Hochkönig');
assert(high,'High King side must be an actual button');
assert.equal(high.attrs['aria-pressed'],'false');
high.listeners.click();
assert.equal(actual.court,'highKing','Slide must change actual persistent selected court');
assert.equal(saveCount,1);
assert(lastReplacement,'The selected minister card must update without full page redraw');
const highBonus=find(lastReplacement,x=>x.tag==='small'&&x.textContent.includes('3.750'));
assert(highBonus,'High King Marshal must show +8% ATK and +3750 capacity');
assert(highBonus.textContent.includes('8 %'));
const fcHigh=find(lastReplacement,x=>x.tag==='small'&&x.textContent.includes('15 %'));
assert(fcHigh,'High King FC must show +15% Lethality');
const imgs=[];const walk=x=>{if(x.tag==='img')imgs.push(x);for(const n of x.children||[])walk(n);};walk(lastReplacement);
assert(imgs.some(x=>x.src==='./assets/minister-field-commander.webp'),
 'Swords image must be FC');
assert(imgs.some(x=>x.src==='./assets/minister-marshal.webp'),
 'Fist image must be Marshal');
const king=find(lastReplacement,x=>x.tag==='button'&&x.textContent==='König');
king.listeners.click();
assert.equal(actual.court,'king');assert.equal(saveCount,2);
assert(find(lastReplacement,x=>x.tag==='small'&&x.textContent.includes('2.500')),
 'Return must update the Marshal capacity to +2500');
assert(find(lastReplacement,x=>x.tag==='small'&&x.textContent.includes('10 %')),
 'Return must update FC to +10%');
const mLabel=find(lastReplacement,x=>x.tag==='label'&&x.className==='bear-name-minister-role'&&
 x.children.some(n=>n.tag==='span'&&n.className==='bear-name-minister-info'));
const checkbox=mLabel.children.find(n=>n.tag==='input');
checkbox.checked=false;checkbox.listeners.change();
assert.equal(actual.fc,false,'FC switch must update persistent role flag');
assert.equal(saveCount,3,'FC change must autosave');
console.log('PASS: tap both courts, King 10/5/2500, High King 15/8/3750, uploaded FC/M icons and role autosave');
