"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const app=fs.readFileSync(path.join(__dirname,"app.js"),"utf8");
const api=fs.readFileSync(path.join(root,"supabase/functions/allianceos-leitung/index.ts"),"utf8");
const html=fs.readFileSync(path.join(__dirname,"index.html"),"utf8");
assert.match(api,/\.eq\("alliance_code",alliance\)\.not\("game_id","is",null\)/,
  "Roster API must exclude historical placeholders without game IDs");
assert.match(app,/\$\("rosterRows"\)\.addEventListener\("click"/,
  "Player dossier click must be bound to the persistent roster body");
assert.match(app,/type="button" class="action-link" data-edit-member=/,
  "Dossier button must not submit forms");
assert.match(html,/id="editDialog"/);
const start=app.indexOf("function control("),end=app.indexOf("async function saveDialog(",start);
assert.ok(start>=0&&end>start,"Dossier editor source is accessible");
const code=app.slice(start,end);
const elements={modalTitle:{textContent:""},modalFields:{innerHTML:""},
 editDialog:{open:false,showModal(){this.open=true;this.opened=(this.opened||0)+1;},close(){this.open=false;}}};
const valid={game_id:"152394512",name:"Boltotelli",rank:5,tc_level:40,power:1234567,
 languages:["de","en"],member_status:"active",notes:"",discord_connected:true};
const state={players:[valid],transfers:[],internalMoves:[],alliance:{kingdom_id:1044}};
const errors=[],deps={
 state,LANGS:["de","en","fr","es"],lang:"de",
 NAMES:{de:"Deutsch",en:"English",fr:"Français",es:"Español"},
 playerLangNames:{de:"Deutsch",en:"English",fr:"Français",es:"Español",tr:"Türkçe"},
 $:id=>elements[id]||(elements[id]={}),t:s=>s,
 esc:s=>String(s??"").replaceAll("<","&lt;").replaceAll('"',"&quot;"),
 can:()=>true,flash:(message)=>errors.push(message),
 // Phase 1 now adds read-only member relationships to the dossier.
 relationships:{editorFields:()=>'',activate:()=>{}},
 cityLevel:x=>String(x),
 formattedPower:x=>String(x),dateText:x=>String(x)
};
const test=new Function(...Object.keys(deps),
 'let editing=null;'+code+'\nreturn function(id){openEdit("member",id);return editing;}'
)(...Object.values(deps));
test(valid.game_id);
assert.equal(elements.editDialog.open,true,"Clicking a real player must open dossier");
assert.match(elements.modalFields.innerHTML,/Boltotelli/);
assert.match(elements.modalFields.innerHTML,/152394512/);
assert.equal(elements.editDialog.opened,1);
elements.editDialog.close();
test("");
assert.equal(elements.editDialog.open,false,"Missing ID must not open an arbitrary profile");
assert.equal(elements.editDialog.opened,1);
assert.equal(errors.length,1,"Missing ID must show a meaningful error");
test("000000000");
assert.equal(errors.length,2);
console.log("Player dossiers: open valid ID, reject invalid IDs with visible errors; shared roster placeholders filtered.");
