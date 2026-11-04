const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'leitung/tools-notice-palette.js'),'utf8');
const {NOTICE_ITEM_TAGS:tags,NOTICE_SPECIAL_ICONS:special,NOTICE_SYMBOL_GROUPS:symbols}=new Function('URL',source.replaceAll('import.meta.url',JSON.stringify('file:///'+path.join(root,'leitung/tools-notice-palette.js').replaceAll('\\','/'))).replace(/^export /gm,'')+';return {NOTICE_ITEM_TAGS,NOTICE_SPECIAL_ICONS,NOTICE_SYMBOL_GROUPS};')(URL);
const expected=require('./fixtures/notice-palette-reference.json');
assert.equal(tags.length,27);assert.equal(special.length,32);
assert.deepEqual(tags.map(t=>t.value),expected.itemTagIds.map(id=>`<item_icon_${id}>`));
assert.deepEqual(special.map(t=>t.value.codePointAt(0).toString(16)),expected.specialCodepoints);
assert.deepEqual(symbols.map(g=>g.values),expected.symbolGroups);assert.equal(symbols.flatMap(g=>g.values).length,47);
const all=[...tags,...special];assert.equal(new Set(all.map(i=>i.id)).size,59);assert(all.every(i=>i.label.trim()&&i.reference.trim()));
const pictures=new Set(all.filter(i=>i.image).map(i=>path.basename(new URL(i.image).pathname)));
assert.equal(pictures.size,22);
for(const name of pictures){const bytes=fs.readFileSync(path.join(root,'leitung/assets/notice-icons',name));assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',name);}
console.log('PASS: parity with independently observed 27 item tags, 32 exact game characters, all 47 symbols and 22 valid local PNG previews; no guessed item or private-use IDs.');
