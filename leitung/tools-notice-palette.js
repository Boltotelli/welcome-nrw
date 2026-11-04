// All 27 tags and 32 code points were checked through the reference editor UI.
// Reference: https://stratforge.tools/dashboard/kingshot/tools/notice-builder
// Checked 2026-11-04. This verifies editor output, not rendering inside Kingshot.
const icon=file=>file?new URL('./assets/notice-icons/'+file,import.meta.url).href:null;
const tags=[
 [101,'Diamanten','Gem','item_icon_100001.png'],
 [100004,'Diamantenbeutel','Bag of Gems','item_icon_100004.png'],
 [102,'Brot','Bread','item_icon_102.png'],
 [103,'Holz','Wood','item_icon_103.png'],
 [104,'Stein / Kohle','Coal','bubble_icon_104.png'],
 [105,'Eisen','Iron','bubble_icon_105.png'],
 [106,'Gold','Gold','item_icon_106.png'],
 [107,'Helden-EP','Hero XP','item_icon_107.png'],
 [109,'Glücksrad-Münze','Wheel Coin',null],
 [100081,'Truegold','Truegold','item_icon_100081.png'],
 [500220,'Heldenfragment','Hero Shard','item_icon_500220.png'],
 [500240,'Schmiedehammer','Forgehammer','item_icon_500240.png'],
 [600020,'Mystery-Abzeichen','Mystery Badge','item_icon_600020.png'],
 [200201,'Bau-Beschleuniger','Building Speedup','item_icon_200201.png'],
 [200301,'Ausbildungs-Beschleuniger','Troop Speedup','item_icon_200301.png'],
 [200401,'Forschungs-Beschleuniger','Research Speedup','item_icon_200401.png'],
 [200101,'Allgemeiner Beschleuniger','General Speedup','item_icon_200101.png'],
 [620116,'Rätselperle','Pearl of Enigma','item_icon_620116.png'],
 [620127,'Abenteuer-Münze','Adventure Coin','item_icon_620127.png'],
 [620129,'Halloween-Süßigkeit','Halloween Candy',null],
 [620163,'Energie-Booster','Energy Booster',null],
 [620189,'Hotdog','Hotdog','item_icon_620189.png'],
 [620197,'Halloween-Lutscher','Halloween Lollipop','item_icon_620197.png'],
 [620208,'Glückspfirsich','Lucky Peach',null],
 [620296,'Energieriegel','Energy Bar',null],
 [620302,'Elysium-Münze','Elysium Coin','item_icon_620302.png'],
 [625005,'Twinstar-Münze','Twinstar Coin',null]
];
export const NOTICE_ITEM_TAGS=tags.map(([id,label,reference,file])=>({id:'tag-'+id,label,reference,value:`<item_icon_${id}>`,image:icon(file)}));
const characters=[
 [0xe001,'Diamanten','Gems','item_icon_100001.png'],
 [0xe002,'Brot','Bread','item_icon_102.png'],
 [0xe003,'Holz','Wood','item_icon_103.png'],
 [0xe004,'Stein','Stone','bubble_icon_104.png'],
 [0xe005,'Eisen','Iron','bubble_icon_105.png'],
 [0xe006,'Mystery-Icon 1','Mystery icon 1',null],
 [0xe007,'Helden-EP','Hero XP','item_icon_107.png'],
 [0xe009,'Münzsymbol','Coin icon',null],
 [0xe010,'Truegold','Truegold','item_icon_100081.png'],
 [0xe011,'Rätselperle','Pearl of Enigma','item_icon_620116.png'],
 [0xe012,'Diamantenpaket','Gems Pack','item_icon_100004.png'],
 [0xe013,'Bau-Beschleuniger','Construction Speedup','item_icon_200201.png'],
 [0xe014,'Ausbildungs-Beschleuniger','Training Speedup','item_icon_200301.png'],
 [0xe015,'Forschungs-Beschleuniger','Research Speedup','item_icon_200401.png'],
 [0xe016,'Schmiedehammer','Forgehammer','item_icon_500240.png'],
 [0xe017,'Allgemeiner Beschleuniger','General Speedup','item_icon_200101.png'],
 [0xe018,'Königreich-Token','Kingdom Token',null],
 [0xe019,'Mystisches Fragment','Mystic Shard',null],
 [0xe020,'Süßigkeit','Candy','item_icon_620197.png'],
 [0xe021,'Ausdauer','Stamina','item_icon_610002.png'],
 [0xe022,'Hotdog','Hotdog','item_icon_620189.png'],
 [0xe029,'Zepter','Scepter',null],
 [0xe034,'Pfirsich','Peach',null],
 [0xe036,'Pfotenabdruck','Paw Print',null],
 [0xe040,'Holz (Alternative)','Wood (alt)',null],
 [0xe041,'Wikinger-Token','Viking Token',null],
 [0xe042,'Münze','Coin',null],
 [0xe044,'Allianz-Mobilisierungsabzeichen','Alliance Mobilization Badge',null],
 [0xe046,'Glücksmünze','Lucky Coin',null],
 [0xe047,'Mystery-Token','Mystery Token','item_icon_600020.png'],
 [0xe048,'Tempelwürfel','Temple Dice',null],
 [0xe049,'Mystery-Icon 2','Mystery icon 2',null]
];
export const NOTICE_SPECIAL_ICONS=characters.map(([codepoint,label,reference,file])=>({id:'char-'+codepoint.toString(16),label,reference,value:String.fromCodePoint(codepoint),image:icon(file),codepoint}));
export const NOTICE_SYMBOL_GROUPS=[
 {label:'Aufzählungen',values:['•','◦','▪','■','◆','◇','▸','▹','‣','·']},
 {label:'Trenner',values:['━','─','═','╌','⎯','﹘','◈','✦']},
 {label:'Sterne & Marken',values:['★','☆','✪','✔','✖','❖','♦','♠','♥','♣']},
 {label:'Pfeile',values:['→','⇒','➤','»','›','↳','⤷']},
 {label:'Ecken & Rahmen',values:['「','」','『','』','【','】','◤','◢','┌','┐','└','┘']}
];
