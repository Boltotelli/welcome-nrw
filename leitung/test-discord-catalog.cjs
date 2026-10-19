/* Regression: the whole live Kingshot guide catalog must remain renderable
 * for every Discord planning language. No network, API token or Discord bot. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const guides=JSON.parse(fs.readFileSync(path.join(root,"dashboard","event-guides.json"),"utf8"));
const schedule=JSON.parse(fs.readFileSync(path.join(root,"dashboard","events.json"),"utf8"));
const source=fs.readFileSync(path.join(__dirname,"event-library.js"),"utf8")
 .replace(/^export /m,"")
 .replaceAll("import.meta.url",JSON.stringify("https://example.invalid/welcome-nrw/leitung/event-library.js"));
const fakeElement=()=>({addEventListener(){},value:"",innerHTML:"",textContent:""});
const document={getElementById:fakeElement};
const window={NRW_EVENT_RHYTHM:{forDate:()=>[],groupKey:()=>null,groupLabels:{}}};
const fetch=async(input)=>{
 const url=String(input);
 if(url.endsWith("/dashboard/event-guides.json"))return{ok:true,json:async()=>guides};
 if(url.endsWith("/dashboard/events.json"))return{ok:true,json:async()=>schedule};
 throw Error("Unexpected mocked fetch: "+url);
};
const createHub=new Function("document","window","fetch",source+"\nreturn createEventHub")(document,window,fetch);
const hub=createHub({request:async()=>({}),flash(){},esc:String,t:String});
(async()=>{
 await hub.load();
 for(const locale of ["de","en","fr"]){
  const events=hub.catalog(locale);
  assert.ok(events.length>=45,"Unexpectedly incomplete event catalog: "+locale);
  const byKey=key=>{
   const x=events.find(event=>event.key===key);
   assert.ok(x,"Missing event: "+key+" ("+locale+")");
   return x;
  };
  for(const [key,count] of [["kvk",5],["brawl",7],["strongest",7]]){
   const event=byKey(key);
   assert.equal(event.days.length,count,key+" day count");
   for(const d of event.days){
    assert.ok(d.number>=1&&d.number<=count);
    assert.equal(typeof d.tips[locale],"string","Guide must be a locale string, not an unkeyed entry");
    assert.ok(Array.isArray(d.scoring[locale]),"Scoring data must be locale keyed");
   }
  }
  const brawl=byKey("brawl");
  assert.notEqual(brawl.days[0].tips[locale],brawl.days[1].tips[locale],"Each event day must preserve unique guide text");
  assert.ok(brawl.days[0].tips[locale].length>12,"Brawl daily source tips must not be lost");
  const keys=events.map(e=>e.key);
  assert.equal(new Set(keys).size,keys.length,"Event catalog must not duplicate keys");
 }
 console.log("Discord multilingual multi-day catalog: 57+ events, DE/EN/FR, daily guidance, no iterator error");
})().catch(e=>{console.error(e);process.exitCode=1;});
