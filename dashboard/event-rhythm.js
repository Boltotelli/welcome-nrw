/* Shared NRW 1044 calendar rhythm. Single source for Player Dashboard and AllianceOS Leitung.
   Predicted items remain marked predicted and never imply an in-game confirmation. */
(function(root){
  "use strict";
  const day=86400000;
  const dateKey=d=>d.toISOString().slice(0,10);
  function rhythmEvent(kind,type,start){
    const isArmament=kind==='armament',typeOne=type===1,sourceUrl=isArmament?'https://kingshotdata.com/events/armament-competition/':'https://kingshotdata.com/events/officer-project-event/',iconUrl=isArmament?'https://kingshotdata.com/uploads/2025/04/city-development-event-icon.webp':'https://kingshotdata.com/uploads/2025/03/power-up-event-icon.webp';
    const copy=isArmament?(typeOne?{
      name:{de:'Rüstungswettbewerb · Typ 1',en:'Armament Competition · Type 1',fr:'Compétition d’armement · Type 1'},
      points:{de:'Gouverneursausrüstung, Truegold, Heldensplitter, Meistermaterialien und Speedups',en:'Governor Gear, Truegold, Hero Shards, Master materials and Speedups',fr:'Équipement du gouverneur, Or véritable, fragments de héros, matériaux de Maître et accélérateurs'},
      reward:{de:'Abschlussbelohnung: Visionen des Kunsthandwerkers',en:"Final milestone reward: Artisan’s Visions",fr:"Récompense finale : Visions d’artisan"}
    }:{
      name:{de:'Rüstungswettbewerb · Typ 2 (Truegold)',en:'Armament Competition · Type 2 (Truegold)',fr:'Compétition d’armement · Type 2 (Or véritable)'},
      points:{de:'Truegold, Gouverneursausrüstung, Schmiedehämmer, Mithril, Widgets und Speedups',en:'Truegold, Governor Gear, Forgehammers, Mithril, Widgets and Speedups',fr:'Or véritable, équipement du gouverneur, marteaux, mithril, widgets et accélérateurs'},
      reward:{de:'Abschlussbelohnung: Truegold',en:'Final milestone reward: Truegold',fr:'Récompense finale : Or véritable'}
    }):(typeOne?{
      name:{de:'Offiziersprojekt · Typ 1',en:'Officer Project · Type 1',fr:"Projet d’officier · Type 1"},
      points:{de:'Gouverneursamulette, Schmiedehämmer, Mithril, Widgets und Truppenausbildung',en:'Governor Charms, Forgehammers, Mithril, Widgets and troop training',fr:'Charmes du gouverneur, marteaux, mithril, widgets et entraînement'},
      reward:{de:'Abschlussbelohnung: Schmiedehämmer',en:'Final milestone reward: Forgehammers',fr:'Récompense finale : marteaux de forge'}
    }:{
      name:{de:'Offiziersprojekt · Typ 2',en:'Officer Project · Type 2',fr:"Projet d’officier · Type 2"},
      points:{de:'Gouverneursausrüstung, Heldensplitter, Schmiedehämmer und Widgets',en:'Governor Gear, Hero Shards, Forgehammers and Widgets',fr:'Équipement du gouverneur, fragments de héros, marteaux et widgets'},
      reward:{de:'Abschlussbelohnung: Amulettdesigns',en:'Final milestone reward: Charm Designs',fr:'Récompense finale : plans de charme'}
    });
    const steps={
      de:isArmament?['Das Event kann ausgelassen werden – verbrauche keine KvK-Ressourcen nur für diese Belohnungen.','Spiele nur eine lohnende Belohnungsstufe, wenn NRW dafür ein konkretes Ziel veröffentlicht.','Die 3×-Grenze ist strikt. Ohne veröffentlichten Punktwert keine Ressourcen auf Verdacht einsetzen.']:['Prüfe vor dem Einsatz, ob sich die aktuelle Belohnungsstufe für deine Ressourcen lohnt.','Kombiniere Punktequellen nur mit einem passenden Allianzgemenge- oder KvK-Tag.','Die 3×-Grenze für KvK-Ressourcen bleibt eine strikte Obergrenze.'],
      en:isArmament?['This event can be skipped – do not spend KvK resources only for these rewards.','Play only to a worthwhile reward tier if NRW publishes a specific target.','The 3× limit is strict. Do not spend resources speculatively without a published point limit.']:['Check whether the current reward tier is worth your resources before spending.','Combine scoring sources only with a matching Alliance Brawl or KvK day.','The 3× limit for KvK resources remains a strict upper limit.'],
      fr:isArmament?["Cet événement peut être ignoré : ne dépense pas de ressources KvK uniquement pour ces récompenses.","Joue seulement jusqu’à un palier rentable si NRW publie un objectif précis.","La limite de 3× est stricte. Sans valeur publiée, ne dépense aucune ressource au hasard."]:["Vérifie que le palier de récompense vaut tes ressources avant de les dépenser.","Combine les sources de points uniquement avec un jour correspondant d’Alliance Brawl ou de KvK.","La limite de 3× pour les ressources KvK reste une limite supérieure stricte."]
    };
    const eventLimits=isArmament
      ?{target:typeOne?20000:38000,hardCap:typeOne?60000:114000,note:{
        de:typeOne?'60.000 Punkte sind die strikte 3×-Grenze. Genau 60.000 sind noch erlaubt; erst darüber zählt es als Law-14-Verstoß. Die Grenze ist keine Empfehlung.':'114.000 Punkte sind die strikte 3×-Grenze. Genau 114.000 sind noch erlaubt; erst darüber zählt es als Law-14-Verstoß. Die Grenze ist keine Empfehlung.',
        en:typeOne?'60,000 points is the strict 3× limit. Exactly 60,000 is still allowed; only scores above it count as a Law 14 violation. The limit is not a recommendation.':'114,000 points is the strict 3× limit. Exactly 114,000 is still allowed; only scores above it count as a Law 14 violation. The limit is not a recommendation.',
        fr:typeOne?'60 000 points constituent la limite stricte de 3×. Exactement 60 000 reste autorisé ; seule une valeur supérieure compte comme infraction à la Law 14. Cette limite n’est pas une recommandation.':'114 000 points constituent la limite stricte de 3×. Exactement 114 000 reste autorisé ; seule une valeur supérieure compte comme infraction à la Law 14. Cette limite n’est pas une recommandation.'
      }}
      :{target:typeOne?310000:453000,hardCap:typeOne?930000:1359000,note:{de:'Die 3×-Grenze ist keine Empfehlung. Erreiche nur eine lohnende Belohnungsstufe oder lasse das Event aus und spare danach für KvK.',en:'The 3× limit is not a recommendation. Reach only a worthwhile reward tier or skip the event, then save for KvK.',fr:"La limite de 3× n’est pas une recommandation. Atteins seulement un palier rentable ou ignore l’événement, puis économise pour le KvK."}};
    return{id:`rhythm-${kind}-${start}`,start,end:dateKey(new Date(new Date(`${start}T00:00:00Z`).getTime()+day)),iconUrl,confidence:'public-timeline',name:copy.name,sourceUrl,rhythmCoach:{de:{points:copy.points.de,steps:steps.de,details:[copy.reward.de],limits:eventLimits},en:{points:copy.points.en,steps:steps.en,details:[copy.reward.en],limits:eventLimits},fr:{points:copy.points.fr,steps:steps.fr,details:[copy.reward.fr],limits:eventLimits}}};
  }
  function makeCycleEvent(id,start,end,name,icon,rhythmCoach,extra={}){
    return {id,start,end,icon,confidence:'public-timeline',name,rhythmCoach,...extra};
  }

  function strongestGovernorCoach(dayNo,date){
    const plans={
      de:[
        ['Stadtentwicklung','Truegold, Amulettwert sowie Bau-/Forschungs-/Trainings-Speedups.'],
        ['Heldenentwicklung','Mithril, Widgets, Heldenroulette, Schmiedehämmer, Heldensplitter, Truegold und Speedups.'],
        ['Grundfertigkeiten','Zähmungsmarken, Heldenroulette, Heldensplitter, Amulettwert und Pet-Fortschritt.'],
        ['Kampftraining','Mithril, Widgets, Schmiedehämmer, Amulettwert und Truppenausbildung/-beförderung.'],
        ['Grundfertigkeiten II','Mithril, Widgets, Schmiedehämmer, Truegold und Speedups.'],
        ['Kampftraining II','Gouverneursausrüstung sowie Truppenausbildung/-beförderung.'],
        ['Heldenentwicklung II','Zähmungsmarken, Heldensplitter, Truegold, Pet-Fortschritt, Gouverneursausrüstung, Speedups und Sammeln.']
      ],
      en:[
        ['City Construction','Truegold, Charm score and construction/research/training speedups.'],
        ['Hero Development','Mithril, Widgets, Hero Roulette, Forgehammers, Hero Shards, Truegold and speedups.'],
        ['Basic Skills','Taming Marks, Hero Roulette, Hero Shards, Charm score and Pet advancement.'],
        ['Combat Training','Mithril, Widgets, Forgehammers, Charm score and troop training/promotion.'],
        ['Basic Skills II','Mithril, Widgets, Forgehammers, Truegold and speedups.'],
        ['Combat Training II','Governor Gear and troop training/promotion.'],
        ['Hero Development II','Taming Marks, Hero Shards, Truegold, Pet advancement, Governor Gear, speedups and gathering.']
      ],
      fr:[
        ['Développement urbain','Truegold, score de charmes et accélérateurs de construction/recherche/entraînement.'],
        ['Développement des héros','Mithril, Widgets, Roulette des héros, Marteaux de forge, fragments, Truegold et accélérateurs.'],
        ['Compétences de base','Marques de dressage, Roulette, fragments, score de charmes et progression des familiers.'],
        ['Entraînement au combat','Mithril, Widgets, Marteaux, score de charmes et entraînement/promotion des troupes.'],
        ['Compétences de base II','Mithril, Widgets, Marteaux, Truegold et accélérateurs.'],
        ['Entraînement au combat II','Équipement du gouverneur et entraînement/promotion des troupes.'],
        ['Développement des héros II','Marques de dressage, fragments, Truegold, familiers, équipement, accélérateurs et collecte.']
      ]
    };
    const coach={};
    for(const lang of ['de','en','fr']){
      const p=plans[lang][dayNo-1];
      const save=lang==='de'?'Nur lohnende Minimalziele erreichen; keine KvK-Vorräte für die Rangliste verbrennen.':lang==='fr'?'Atteins seulement les paliers rentables ; ne brûle pas les réserves KvK pour le classement.':'Reach only worthwhile milestones; do not burn KvK reserves for ranking.';
      const steps=[p[0]+': '+p[1],save];
      if((date==='2026-09-22'||date==='2026-09-23')&&(dayNo===2||dayNo===3)){
        steps.push(lang==='de'?'Einmalige 1044-Ausnahme für diesen SG: An Tag 2 und 3 sind bis zu 4× des jeweiligen Mindestziels erlaubt.':lang==='fr'?'Exception unique 1044 pour ce SG : aux jours 2 et 3, jusqu’à 4× l’objectif minimum correspondant est autorisé.':'One-off 1044 exception for this SG: on Days 2 and 3, up to 4× the respective minimum target is allowed.');
      }
      coach[lang]={points:p[1],steps,details:[lang==='de'?('Strongest Governor · Tag '+dayNo+' von 7'):lang==='fr'?('Strongest Governor · jour '+dayNo+' sur 7'):('Strongest Governor · Day '+dayNo+' of 7')]};
    }
    return coach;
  }

  function goldenGlaivesCoach(dayNo){
    const coach={};
    for(const lang of ['de','en','fr']){
      if(dayNo===3){
        coach[lang]={
          points:lang==='de'?'Einlösetag · keine neuen Dim Goldstones mehr':lang==='fr'?'Jour d’échange · plus de nouveaux Dim Goldstones':'Redemption day · no new Dim Goldstones',
          steps:[
            lang==='de'?'Verbleibende Dim Goldstones heute im Event-Shop ausgeben.':lang==='fr'?'Dépense aujourd’hui les Dim Goldstones restants dans la boutique.':'Spend any remaining Dim Goldstones in the event shop today.',
            lang==='de'?'Heute werden keine neuen Dim Goldstones mehr gesammelt; ungenutzte Steine werden nach Eventende automatisch umgewandelt.':lang==='fr'?'Aucun nouveau Dim Goldstone ne peut être obtenu aujourd’hui ; les pierres restantes seront converties automatiquement après l’événement.':'No new Dim Goldstones can be collected today; unused stones are converted automatically after the event.'
          ],
          details:[lang==='de'?'Golden Glaives · Tag 3 von 3':lang==='fr'?'Golden Glaives · jour 3 sur 3':'Golden Glaives · Day 3 of 3']
        };
      }else{
        coach[lang]={
          points:lang==='de'?'Intel-Missionen und Golden Glaives für Dim Goldstones':lang==='fr'?'Missions de renseignement et Golden Glaives pour les Dim Goldstones':'Intel Missions and Golden Glaives for Dim Goldstones',
          steps:[
            lang==='de'?'Intel-Missionen abschließen und Golden Glaives jagen, um Dim Goldstones zu sammeln.':lang==='fr'?'Termine les missions de renseignement et chasse les Golden Glaives pour obtenir des Dim Goldstones.':'Complete Intel Missions and hunt Golden Glaives to collect Dim Goldstones.',
            lang==='de'?'Shop-Belohnungen gezielt einlösen; Goldstones nicht bis nach Eventende liegen lassen.':lang==='fr'?'Échange les récompenses utiles et ne garde pas les Goldstones après la fin.':'Redeem useful shop rewards and do not leave Goldstones unused after the event.'
          ],
          details:[lang==='de'?('Golden Glaives · Sammeltag '+dayNo+' von 2'):lang==='fr'?('Golden Glaives · collecte '+dayNo+' sur 2'):('Golden Glaives · collection day '+dayNo+' of 2')]
        };
      }
    }
    return coach;
  }

  function kvkPrepCoach(dayNo){
    const plans={
      de:[
        ['Stadtentwicklung','Intel-Missionen, Truegold/Truegold-Staub/gehärtetes Truegold, Amulettwert und Speedups.'],
        ['Grundfertigkeiten','Heldensplitter, Heldenroulette, Meistermaterialien, Truegold, Speedups und Sammeln.'],
        ['Pet-Training','Zähmungsmarken, Pet-Fortschritt, Amulette, Heldensplitter, Heldenroulette und Intel-Missionen.'],
        ['Ausrüstung & Truppen','Mithril, Widgets, Schmiedehämmer, Amulette sowie Truppenausbildung/-beförderung.'],
        ['Finale','Alle relevanten Kategorien sind geöffnet; verbliebene Vorräte gezielt nach NRW-/Discord-Plan einsetzen.']
      ],
      en:[
        ['City Construction','Intel Missions, Truegold/Truegold Dust/Tempered Truegold, Charm score and speedups.'],
        ['Basic Skills','Hero Shards, Hero Roulette, Master materials, Truegold, speedups and gathering.'],
        ['Pet Training','Taming Marks, Pet advancement, Charms, Hero Shards, Hero Roulette and Intel Missions.'],
        ['Gear & Troops','Mithril, Widgets, Forgehammers, Charms and troop training/promotion.'],
        ['Finale','All major categories are open; spend remaining reserves only according to the NRW/Discord plan.']
      ],
      fr:[
        ['Développement urbain','Missions de renseignement, Truegold/poussière/Truegold renforcé, charmes et accélérateurs.'],
        ['Compétences de base','Fragments, Roulette, matériaux de Maître, Truegold, accélérateurs et collecte.'],
        ['Familiers','Marques de dressage, progression, charmes, fragments, Roulette et missions de renseignement.'],
        ['Équipement & troupes','Mithril, Widgets, Marteaux, charmes et entraînement/promotion des troupes.'],
        ['Finale','Toutes les grandes catégories sont ouvertes ; utilise les réserves restantes selon le plan NRW/Discord.']
      ]
    };
    const coach={};
    for(const lang of ['de','en','fr']){
      const p=plans[lang][dayNo-1];
      coach[lang]={points:p[1],steps:[p[0]+': '+p[1],lang==='de'?'Vor größeren Ausgaben zuerst NRW-/Discord-Absprachen prüfen.':lang==='fr'?'Avant toute grosse dépense, vérifie les consignes NRW/Discord.':'Check NRW/Discord coordination before major spending.'],details:[lang==='de'?('KvK-Vorbereitung · Tag '+dayNo+' von 5'):lang==='fr'?('Préparation KvK · jour '+dayNo+' sur 5'):('KvK Preparation · Day '+dayNo+' of 5')]};
    }
    return coach;
  }

  function officialRhythmFor(date){
    const d=new Date(`${date}T00:00:00Z`),cycleAnchor=Date.UTC(2026,8,14),elapsed=Math.floor((d.getTime()-cycleAnchor)/day),cycleDay=((elapsed%28)+28)%28,cycleStart=d.getTime()-cycleDay*day;
    const at=n=>dateKey(new Date(cycleStart+n*day));
    const result=[];

    // Light-week side events. Type B deliberately spills into SG/KvK day 1.
    const sideSlots=[
      {from:0,to:1,kind:'armament',type:1},
      {from:2,to:3,kind:'officer',type:1},
      {from:4,to:5,kind:'armament',type:2},
      {from:6,to:7,kind:'officer',type:2},
      {from:14,to:15,kind:'armament',type:1},
      {from:16,to:17,kind:'officer',type:1},
      {from:18,to:19,kind:'armament',type:2},
      {from:20,to:21,kind:'officer',type:2}
    ];
    for(const slot of sideSlots){
      if(cycleDay>=slot.from&&cycleDay<=slot.to) result.push(rhythmEvent(slot.kind,slot.type,at(slot.from)));
    }

    // Main 28-day wheel.
    if(cycleDay<=6){
      result.push(makeCycleEvent('rhythm-alliance-brawl-'+at(0),at(0),at(6),{de:'Allianzgemenge',en:'Alliance Brawl',fr:'Alliance Brawl'},'⚔️',null));
      result.push(makeCycleEvent('rhythm-merchant-empire-'+at(0),at(0),at(6),{de:'Handelsimperium',en:'Merchant Empire',fr:'Empire commercial'},'🏛️',null));
    }
    if(cycleDay>=7&&cycleDay<=13){
      const sgDay=cycleDay-6;
      result.push(makeCycleEvent('rhythm-strongest-governor-'+at(7),at(7),at(13),{de:'Stärkster Gouverneur',en:'Strongest Governor',fr:'Gouverneur le plus puissant'},'🏅',strongestGovernorCoach(sgDay,date),{sourceUrl:'https://kingshotdata.com/events/strongest-governor-event/'}));
    }
    if(cycleDay>=14&&cycleDay<=19){
      const mobilizeCoach={
        de:{points:'Allianz-Mobilisierung · Vorräte für KvK schonen',steps:['Nur kostenlose bzw. ohnehin geplante Aufgaben erledigen.','Truegold, Splitter, Pet-, Ausrüstungs- und Speedup-Vorräte für die kommende KvK-Vorbereitung halten.'],details:['Tag 20 des Zyklus enthüllt das KvK-Matchmaking.']},
        en:{points:'Alliance Mobilization · preserve reserves for KvK',steps:['Do only free tasks or actions you planned anyway.','Hold Truegold, shards, Pet, gear and speedup reserves for the upcoming KvK Preparation.'],details:['Cycle day 20 reveals KvK matchmaking.']},
        fr:{points:'Mobilisation d’alliance · garde les réserves pour le KvK',steps:['Fais seulement les tâches gratuites ou déjà prévues.','Garde Truegold, fragments, ressources de familiers/équipement et accélérateurs pour la préparation KvK.'],details:['Le jour 20 du cycle révèle le matchmaking KvK.']}
      };
      result.push(makeCycleEvent('rhythm-alliance-mobilization-'+at(14),at(14),at(19),{de:'Allianz-Mobilisierung',en:'Alliance Mobilization',fr:'Mobilisation d’alliance'},'📣',mobilizeCoach));
    }
    if(cycleDay===20){
      const prepCoach={
        de:{points:'Morgen beginnt die KvK-Vorbereitung',steps:['Ab 08:00 UTC Intel-Missionen nicht mehr abschließen, damit sie für Tag 1 bereitstehen.','KvK-Vorräte heute vollständig halten und Matchmaking/Discord prüfen.'],details:['Ruhiger Zwischentag vor der fünf­tägigen Vorbereitung.']},
        en:{points:'KvK Preparation starts tomorrow',steps:['From 08:00 UTC, stop completing Intel Missions so they bank for Day 1.','Hold all KvK reserves today and check matchmaking/Discord.'],details:['Quiet bridge day before the five-day Preparation phase.']},
        fr:{points:'La préparation KvK commence demain',steps:['À partir de 08:00 UTC, ne termine plus les missions de renseignement afin de les conserver pour le jour 1.','Garde toutes les réserves KvK et vérifie le matchmaking/Discord.'],details:['Journée calme avant les cinq jours de préparation.']}
      };
      result.push(makeCycleEvent('rhythm-kvk-prep-warning-'+at(20),at(20),at(20),{de:'KvK · Vorbereitung morgen',en:'KvK · Preparation tomorrow',fr:'KvK · Préparation demain'},'🛡️',prepCoach));
    }
    if(cycleDay>=21&&cycleDay<=25){
      const prepDay=cycleDay-20;
      result.push(makeCycleEvent('rhythm-kingdom-of-power-prep-'+at(21),at(21),at(25),{de:'KvK-Vorbereitung',en:'Kingdom of Power Preparation',fr:'Préparation KvK'},'👑',kvkPrepCoach(prepDay)));
    }
    if(cycleDay>=26&&cycleDay<=27){
      const battleCoach={
        de:{points:'KvK-Kampfwochenende',steps:['Vor Öffnung des gegnerischen Königreichs Schild aktivieren und Krankenstation freihalten.','Castle-Battle- und NAP-Anweisungen auf Discord befolgen; keine unkoordinierten Stadtangriffe.'],details:['Die Kampfphase folgt direkt auf die fünf Prep-Tage.']},
        en:{points:'KvK battle weekend',steps:['Activate a shield before cross-kingdom access opens and keep the infirmary clear.','Follow Castle Battle and NAP instructions on Discord; no uncoordinated city attacks.'],details:['The battle phase follows the five Preparation days.']},
        fr:{points:'Week-end de bataille KvK',steps:['Active un bouclier avant l’ouverture inter-royaumes et garde l’infirmerie libre.','Suis les consignes Castle Battle/NAP sur Discord ; aucune attaque de ville non coordonnée.'],details:['La phase de combat suit directement les cinq jours de préparation.']}
      };
      result.push(makeCycleEvent('rhythm-kvk-battle-'+at(26),at(26),at(27),{de:'KvK · Kampfwochenende',en:'KvK · Battle Weekend',fr:'KvK · Week-end de bataille'},'🏰',battleCoach));
    }

    // Golden Glaives overlaps the Monday start of SG and KvK Prep.
    for(const from of [7,21]){
      if(cycleDay>=from&&cycleDay<=from+2){
        result.push(makeCycleEvent('rhythm-golden-glaives-'+at(from),at(from),at(from+2),{de:'Golden Glaives',en:'Golden Glaives',fr:'Golden Glaives'},'⚔️',goldenGlaivesCoach(cycleDay-from+1),{iconUrl:'https://kingshotdata.com/uploads/2025/05/golden-glaives-event-icon.webp'}));
      }
    }

    // Hero Roulette begins on day 2 of SG/KvK and lasts three days.
    for(const from of [8,22]){
      if(cycleDay>=from&&cycleDay<=from+2){
        result.push(makeCycleEvent('rhythm-hero-roulette-'+at(from),at(from),at(from+2),{de:'Heldenroulette',en:'Hero Roulette',fr:'Roulette des héros'},'🎡',null));
      }
    }

    // Periodic light-week companions. Marked predicted so players know to verify in game.
    for(const from of [0,14]){
      if(cycleDay>=from&&cycleDay<=from+1){
        result.push({...makeCycleEvent('rhythm-champagne-fair-'+at(from),at(from),at(from+1),{de:'Champagne Fair',en:'Champagne Fair',fr:'Champagne Fair'},'🥂',null),confidence:'predicted'});
      }
      if(cycleDay>=from+1&&cycleDay<=from+3){
        result.push({...makeCycleEvent('rhythm-fishing-'+at(from+1),at(from+1),at(from+3),{de:'Fischerturnier',en:'Fishing Tournament',fr:'Tournoi de pêche'},'🎣',null),confidence:'predicted'});
      }
    }

    return result;
  }


  // Optional published AllianceOS recurrence override. The original 28-day generator stays intact.
  const keyFor=e=>{
    const x=String(e?.id||"").toLowerCase();
    for(const [needle,key] of [["alliance-brawl","brawl"],["strongest-governor","strongest"],["kingdom-of-power-prep","kvk"],["alliance-mobilization","mobilization"],["merchant-empire","merchant"],["golden-glaives","golden"],["officer-project","officer"],["armament-competition","armament"],["rhythm-officer","officer"],["rhythm-armament","armament"],["viking","viking"],["fishing","fishing"],["eternity","eternity"],["champagne","champagne"],["bear-trap","bear"],["hero-roulette","roulette"],["alliance-championship","championship"],["kill-event","kill"]]){
      if(x.includes(needle))return key;
    }
    return "";
  };
  const groupLabels={
    brawl:{de:"Allianzgemenge",en:"Alliance Brawl",fr:"Alliance Brawl"},
    strongest:{de:"Stärkster Gouverneur",en:"Strongest Governor",fr:"Strongest Governor"},
    kvk:{de:"KvK-Vorbereitung",en:"KvK Preparation",fr:"Préparation KvK"},
    mobilization:{de:"Allianz-Mobilisierung",en:"Alliance Mobilization",fr:"Mobilisation d’alliance"},
    merchant:{de:"Handelsimperium",en:"Merchant Empire",fr:"Empire commercial"},
    golden:{de:"Golden Glaives",en:"Golden Glaives",fr:"Golden Glaives"},
    officer:{de:"Offiziersprojekt",en:"Officer Project",fr:"Projet d’officier"},
    armament:{de:"Rüstungswettbewerb",en:"Armament Competition",fr:"Compétition d’armement"},
    viking:{de:"Wikinger-Vergeltung",en:"Viking Vengeance",fr:"Viking Vengeance"},
    fishing:{de:"Fischerturnier",en:"Fishing Tournament",fr:"Tournoi de pêche"},
    bear:{de:"Bärenfalle",en:"Bear Trap",fr:"Piège à ours"},
    eternity:{de:"Eternity’s Reach",en:"Eternity’s Reach",fr:"Eternity’s Reach"},
    champagne:{de:"Champagne Fair",en:"Champagne Fair",fr:"Champagne Fair"},
    roulette:{de:"Heldenroulette",en:"Hero Roulette",fr:"Roulette des héros"},
    championship:{de:"Allianzmeisterschaft",en:"Alliance Championship",fr:"Championnat d’alliance"},
    kill:{de:"Kill Event",en:"Kill Event",fr:"Kill Event"}
  };
  function withCycles(date,cycles){
    const normal=officialRhythmFor(date);
    if(!Array.isArray(cycles)||!cycles.length)return normal;
    const overrides=cycles.filter(c=>c&&c.enabled!==false&&/^[a-z0-9-]{2,70}$/.test(c.group_key||"") &&
      /^\d{4}-\d{2}-\d{2}$/.test(c.anchor_date||"")&&Number.isInteger(c.interval_days)&&c.interval_days>=1&&
      Number.isInteger(c.duration_days)&&c.duration_days>=1&&c.duration_days<=14&&c.duration_days<=c.interval_days);
    if(!overrides.length)return normal;
    const replaced=new Set(overrides.map(c=>c.group_key));
    const result=normal.filter(e=>!replaced.has(keyFor(e)));
    const dayMs=Date.parse(date+"T00:00:00Z");
    for(const c of overrides){
      const diff=Math.round((dayMs-Date.parse(c.anchor_date+"T00:00:00Z"))/day);
      if(!Number.isFinite(diff)||diff<0)continue;
      const mod=diff%c.interval_days;
      if(mod>=c.duration_days)continue;
      const start=dateKey(new Date(dayMs-mod*day)),end=dateKey(new Date(dayMs+(c.duration_days-mod-1)*day));
      const name=(c.title&&Object.keys(c.title).length?c.title:null)||groupLabels[c.group_key]||{de:c.group_key,en:c.group_key,fr:c.group_key};
      result.push({id:"rhythm-"+c.group_key+"-"+start,start,end,name,icon:"📅",confidence:"alliance-schedule",aos_group:c.group_key,aos_phase:mod+1});
    }
    return result;
  }
  root.NRW_EVENT_RHYTHM=Object.freeze({forDate:withCycles,baseForDate:officialRhythmFor,groupKey:keyFor,groupLabels});
})(window);
