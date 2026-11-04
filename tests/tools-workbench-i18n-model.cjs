const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function readModule(file,names){const source=fs.readFileSync(path.join(root,file),'utf8').replace(/^export /gm,'').replaceAll('import.meta.url',JSON.stringify('file:///'+path.join(root,file).replaceAll('\\','/')));return new Function(source+';return {'+names.join(',')+'};')();}
const {WORKBENCH_LANGUAGES:langs,WORKBENCH_TRANSLATIONS:copy,workbenchText:t}=readModule('leitung/tools-workbench-locales.js',['WORKBENCH_LANGUAGES','WORKBENCH_TRANSLATIONS','workbenchText']);
assert.deepEqual(langs,['de','en','fr','es']);const keys=Object.keys(copy.de);assert(keys.length>250);
const tokens=s=>[...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
for(const lang of langs){assert.deepEqual(Object.keys(copy[lang]),keys);for(const key of keys){assert(copy[lang][key].trim(),lang+' missing '+key);assert.deepEqual(tokens(copy[lang][key]),tokens(key),lang+' placeholders for '+key);assert(!copy[lang][key].includes('\ufffd'));}}
for(const file of ['leitung/tools-workbench-model.js','leitung/tools-notice-palette.js','leitung/tools-territory-catalog.js']){
 const s=fs.readFileSync(path.join(root,file),'utf8');
 // Persisted catalog values stay language-independent; their labels all translate.
 if(file.endsWith('tools-notice-palette.js')){const p=readModule(file,['NOTICE_ITEM_TAGS','NOTICE_SPECIAL_ICONS','NOTICE_SYMBOL_GROUPS']);for(const row of [...p.NOTICE_ITEM_TAGS,...p.NOTICE_SPECIAL_ICONS,...p.NOTICE_SYMBOL_GROUPS])assert(keys.includes(row.label),'Untranslated palette label: '+row.label);}
 if(file.endsWith('tools-territory-catalog.js')){const p=readModule(file,['TERRITORY_SITES']);for(const site of p.TERRITORY_SITES)for(const reward of site.rewards)assert(keys.includes(reward.name),'Untranslated reward: '+reward.name);}
 if(file.endsWith('tools-workbench-model.js')){const m=readModule(file,['OUTPOST_TYPES','WORKBENCH_TOOLS']);for(const key of [...m.OUTPOST_TYPES,...Object.values(m.WORKBENCH_TOOLS)])assert(keys.includes(key));for(const e of s.matchAll(/throw Error\('([^']+)'\)/g))assert(keys.includes(e[1]),'Untranslated validation error: '+e[1]);}
}
assert.equal(t('fr','Speichern'),'Enregistrer');assert.equal(t('es','Saved for everyone.'),'Guardado para todos.','Existing system messages change language');
assert.equal(t('fr','{done} / {total} bestätigt',{done:1,total:3}),'1 / 3 confirmés');
assert.equal(t('es','<item_icon_101>'),' <item_icon_101>'.trim());assert.equal(t('fr','Jane · NRW'),'Jane · NRW');
const ui=fs.readFileSync(path.join(root,'leitung/tools-workbench.js'),'utf8');
for(const match of ui.matchAll(/\bt\(\s*(['"])(.*?)\1/g))assert(keys.includes(match[2]),'Interface translation key missing: '+match[2]);
for(const match of ui.slice(ui.indexOf('const statusLabels='),ui.indexOf('const today=')).matchAll(/'([^']+)'/g))assert(keys.includes(match[1]),'Status translation missing: '+match[1]);
for(const match of ui.matchAll(/>([^<>${}\n]+)</g)){const text=match[1].trim();if(/[\p{L}]/u.test(text)&&!/[=()\[\]{}'`_;]/.test(text))assert(['X','Y'].includes(text),'Unlocalized static markup: '+text);}
console.log(`PASS: ${keys.length} complete DE/EN/FR/ES translations; identical placeholders; palette/reward/type/tool/error coverage; unchanged unknown user text and game tags; system-message language switching.`);
