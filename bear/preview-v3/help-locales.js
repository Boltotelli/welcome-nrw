/* V3 Bear help translations: guide text and annotation labels only.
 * Screenshot pixels, crop geometry and game IDs remain unchanged.
 * Structure of each step: [explanation, [annotation captions...]].
 */
(function(root){
'use strict';
const guides={
 en:{
  troops:{title:"Troops: quantity, T level and TG level",steps:[
   ["Tap your profile picture at the top left to open your Governor profile.",["Profile picture (top left)"]],
   ["In your Governor profile, tap the “Squad” button near the bottom to open your full troop overview.",["Open Squad"]],
   ["Select “All” to include troops outside your city. For each troop type, the quantity appears below its name, the T level is the Roman numeral beneath its icon (X = T10), and the TG level is the gold number in the top-right corner (6 = TG6). Enter different tiers of the same troop type on separate rows.",["“All” — all troops","Type: Apex Infantry","Quantity: 637,997","T level: X = T10","TG level: gold 6 = TG6"]]
  ]},
  march:{title:"Total number of marches",steps:[
   ["Important: Always include your own starter march in the total. This is not just the number of rallies you join.",[]],
   ["Example: 1 rally you start + 6 rallies you join = 7 marches in total. Select 7 in the optimizer.",[]]
  ]},
  capacity:{title:"Find your base march capacity",steps:[
   ["On the city screen, tap your personal power at the top left — the number beside the fist icon, not your portrait.",["Personal power"]],
   ["Scroll down to “Military” in the “Bonus Overview”. Copy the value for “Deployment Capacity” (112,100 in this example). “March Queue” is only the number of available marches, NOT your troop capacity. Do not manually add extra hero, Pet, Valora or Marshal bonuses.",["Military","Deployment Capacity: 112,100"]]
  ]},
  combatStats:{title:"Squad, Infantry, Cavalry and Archers",steps:[
   ["Tap your personal power at the top left (fist icon with a number) to open “Bonus Overview”.",["Personal power"]],
   ["Under “Military”, find “Squads’ Attack” and “Squads’ Lethality”. The example shows 276.3% Attack and 60.1% Lethality. Defense and Health are not needed.",["Squads’ Attack: 276.3%","Squads’ Lethality: 60.1%"]],
   ["Scroll further down. For each troop type, note “Attack” and “Lethality”: Infantry 184.4 / 276.5%, Cavalry 174.9 / 250.7%, Archers 252.9 / 318.8%. Ignore Defense and Health. Enter separate values that have not already been combined, without temporary active buffs.",["Infantry Attack","Infantry Lethality","Cavalry Attack","Cavalry Lethality","Archer Attack","Archer Lethality"]]
  ]},
  heroes:{title:"Hero overview, stars and Widgets",steps:[
   ["From your city, tap “Heroes” in the bottom menu to open your full hero roster.",["Open Heroes"]],
   ["Select every hero you own in the optimizer. Read their star level and progress from the flowers below each portrait. The calculator treats all heroes as level 80. Note: “S4”, “S5”, etc. at the top right indicate hero generation, NOT the number of stars.",["Owned hero","Flowers = star progress","S5 = generation, not stars"]],
   ["Tap the portrait of a gold hero, open “Gear” and find the exclusive Widget at the bottom. In the example, Long Fei’s “Immortal’s Flask +5” has Widget level 5. The gear beside the hero is NOT the Widget.",["Widget: +5","Gear tab"]]
  ]},
  expedition:{title:"Check hero stats after changing gear",steps:[
   ["First equip your best gear on the three recommended starter heroes. Then open each hero, tap “Stats” and the list icon at the bottom right. Repeat for all three starters.",["Stats","Open detailed stats"]],
   ["In the “Expedition” section, read ONLY Attack and Lethality, e.g. Yang’s Archer Attack +492.17% and Archer Lethality +323.80%. Do not enter Defense, Health or “Conquest”. The troop type depends on the starter hero. Record values only AFTER changing gear, and do not count them twice in base stats.",["Expedition Attack: +492.17%","Expedition Lethality: +323.80%"]]
  ]},
  pets:{title:"Pet buffs: skills and levels",steps:[
   ["Open “Pet Skill”. The crossed swords indicate combat skills, and “Lv.” on each icon shows the skill level. Tap the relevant skill to verify its name and actual effect.",["Combat icon","Level beneath Pet icon","Open example skill"]],
   ["The details show skill name, level, duration and cooldown. Example: “Antler Impact Lv. 5” grants 100,000 RALLY capacity for 2 hours — NOT your personal march capacity. Enable only Pet buffs that will actually be active during Bear Trap. A cooldown alone does not prove a buff is active.",["Antler Impact Lv. 5","+100,000 Rally Capacity, not March Capacity"]]
  ]},
  valora:{title:"Valora: Hunter Instinct and Savage Advantage",steps:[
   ["In your city, tap the Master building displaying Valora’s portrait and green progress bar.",["Open Master building"]],
   ["Open Valora’s “Stats” and tap the skill icon at the bottom left. “Hunter Instinct Lv. 9” grants +24% personal Bear Hunt Damage Points here. “Next Level Bonus” (+27%) does NOT apply yet. The relationship rank “Close 2” at the top left is not a skill level either.",["Hunter Instinct level 9","Current bonus: +24%","Hunter Instinct icon (bottom left)"]],
   ["Switch to “Skills” and tap “Savage Advantage” at the bottom right. The shown level 10 grants +30,000 Bear Hunt Squad Capacity. IMPORTANT: Hunter Instinct and Savage Advantage have INDEPENDENT skill levels. Never automatically enter the same level for both.",["Savage Advantage level 10","+30,000 Bear Hunt Squad Capacity","Savage Advantage skill (bottom right)","Skills"]]
  ]}
 },
 fr:{
  troops:{title:"Troupes : quantité, niveau T et niveau TG",steps:[
   ["Appuie sur ton portrait en haut à gauche pour ouvrir ton profil de gouverneur.",["Portrait en haut à gauche"]],
   ["Dans ton profil de gouverneur, appuie sur « Squad » en bas pour afficher toutes tes troupes.",["Ouvrir Squad"]],
   ["Choisis « All » pour inclure les troupes hors de la ville. Pour chaque type, la quantité est sous le nom, le niveau T est indiqué en chiffres romains sous l’icône (X = T10) et le niveau TG est le nombre doré en haut à droite (6 = TG6). Ajoute une ligne distincte pour chaque niveau d’un même type.",["« All » — toutes les troupes","Type : Apex Infantry","Quantité : 637 997","Niveau T : X = T10","Niveau TG : 6 doré = TG6"]]
  ]},
  march:{title:"Nombre total de marches",steps:[
   ["Important : compte toujours ta propre marche de départ dans le total. Il ne s’agit pas seulement des rallyes que tu rejoins.",[]],
   ["Exemple : 1 rallye que tu lances + 6 rallyes rejoints = 7 marches au total. Sélectionne donc 7 dans l’optimiseur.",[]]
  ]},
  capacity:{title:"Trouver la capacité de marche de base",steps:[
   ["Sur l’écran de la ville, appuie sur ta puissance personnelle en haut à gauche — le nombre à côté du poing, et non ton portrait.",["Puissance personnelle"]],
   ["Dans « Bonus Overview », fais défiler jusqu’à « Military ». Recopie « Deployment Capacity » (112 100 dans cet exemple). « March Queue » indique uniquement le nombre de marches disponibles, PAS la capacité en troupes. N’ajoute pas toi-même les bonus des héros, familiers, de Valora ou du Maréchal.",["Military","Deployment Capacity : 112 100"]]
  ]},
  combatStats:{title:"Escouade, infanterie, cavalerie et archers",steps:[
   ["Appuie sur ta puissance personnelle en haut à gauche (poing avec un nombre) pour ouvrir « Bonus Overview ».",["Puissance personnelle"]],
   ["Dans « Military », repère « Squads’ Attack » et « Squads’ Lethality ». L’exemple affiche 276,3 % d’attaque et 60,1 % de létalité. La défense et les PV ne sont pas demandés.",["Squads’ Attack : 276,3 %","Squads’ Lethality : 60,1 %"]],
   ["Plus bas, relève « Attack » et « Lethality » pour chaque type : infanterie 184,4 / 276,5 %, cavalerie 174,9 / 250,7 %, archers 252,9 / 318,8 %. Ignore la défense et les PV. Saisis des valeurs séparées, non déjà cumulées, sans bonus temporaires actifs.",["Attaque de l’infanterie","Létalité de l’infanterie","Attaque de la cavalerie","Létalité de la cavalerie","Attaque des archers","Létalité des archers"]]
  ]},
  heroes:{title:"Liste des héros, étoiles et Widgets",steps:[
   ["Depuis la ville, appuie sur « Heroes » dans le menu du bas pour ouvrir la liste complète de tes héros.",["Ouvrir Heroes"]],
   ["Sélectionne dans l’optimiseur tous les héros que tu possèdes. Lis leur nombre d’étoiles et leur progression grâce aux fleurs sous chaque portrait. Le calculateur considère tous les héros au niveau 80. Attention : « S4 », « S5 », etc. en haut à droite indiquent la génération, PAS le nombre d’étoiles.",["Héros possédé","Fleurs = progression des étoiles","S5 = génération, pas étoiles"]],
   ["Appuie sur le portrait d’un héros doré, ouvre « Gear » et repère le Widget exclusif en bas. Dans cet exemple, « Immortal’s Flask +5 » de Long Fei correspond au niveau de Widget 5. L’équipement autour du héros n’est PAS le Widget.",["Widget : +5","Onglet Gear"]]
  ]},
  expedition:{title:"Vérifier les statistiques après avoir changé l’équipement",steps:[
   ["Équipe d’abord tes trois héros de départ recommandés avec ton meilleur équipement. Ouvre ensuite chaque héros, appuie sur « Stats », puis sur l’icône de liste en bas à droite. Répète pour les trois héros.",["Stats","Ouvrir les statistiques détaillées"]],
   ["Dans la section « Expedition », relève UNIQUEMENT l’attaque et la létalité, par exemple Yang : Archer Attack +492,17 % et Archer Lethality +323,80 %. Ne saisis ni la défense, ni les PV, ni « Conquest ». Le type de troupe dépend du héros. Relève les valeurs APRÈS le changement d’équipement, sans les ajouter deux fois aux statistiques de base.",["Attaque Expedition : +492,17 %","Létalité Expedition : +323,80 %"]]
  ]},
  pets:{title:"Bonus des familiers : compétences et niveaux",steps:[
   ["Ouvre « Pet Skill ». Les épées croisées désignent les compétences de combat et « Lv. » sur chaque icône indique le niveau de compétence. Appuie sur la compétence voulue pour vérifier son nom et son effet.",["Icône de combat","Niveau sous l’icône du familier","Ouvrir la compétence montrée"]],
   ["Les détails indiquent le nom, le niveau, la durée et le délai de récupération. Exemple : « Antler Impact Lv. 5 » donne 100 000 de capacité de RALLYE pendant 2 heures — PAS ta capacité de marche personnelle. Active uniquement les bonus réellement actifs durant le piège à ours. Un délai de récupération ne prouve pas qu’un bonus est actif.",["Antler Impact Lv. 5","+100 000 capacité de rallye, pas de marche"]]
  ]},
  valora:{title:"Valora : Hunter Instinct et Savage Advantage",steps:[
   ["Dans la ville, appuie sur le bâtiment du Maître qui affiche le portrait de Valora et une barre de progression verte.",["Ouvrir le bâtiment du Maître"]],
   ["Ouvre les « Stats » de Valora et appuie sur l’icône de compétence en bas à gauche. « Hunter Instinct Lv. 9 » donne ici +24 % de points de dégâts personnels à la chasse à l’ours. Le « Next Level Bonus » (+27 %) ne s’applique PAS encore. Le rang relationnel « Close 2 » en haut à gauche n’est pas non plus un niveau de compétence.",["Hunter Instinct niveau 9","Bonus actuel : +24 %","Icône Hunter Instinct (en bas à gauche)"]],
   ["Va dans « Skills » et appuie sur « Savage Advantage » en bas à droite. Le niveau 10 montré apporte +30 000 de capacité d’escouade pour la chasse à l’ours. IMPORTANT : Hunter Instinct et Savage Advantage ont des niveaux INDÉPENDANTS. Ne saisis jamais automatiquement le même niveau pour les deux.",["Savage Advantage niveau 10","+30 000 capacité d’escouade de chasse à l’ours","Compétence Savage Advantage (en bas à droite)","Skills"]]
  ]}
 },
 es:{
  troops:{title:"Tropas: cantidad, nivel T y nivel TG",steps:[
   ["Toca tu foto de perfil arriba a la izquierda para abrir tu perfil de gobernador.",["Foto de perfil (arriba a la izquierda)"]],
   ["En tu perfil de gobernador, toca el botón «Squad» de la parte inferior para abrir el resumen de todas tus tropas.",["Abrir Squad"]],
   ["Selecciona «All» para incluir las tropas fuera de tu ciudad. En cada tipo, la cantidad aparece bajo el nombre, el nivel T es el número romano bajo el icono (X = T10) y el nivel TG es el número dorado en la esquina superior derecha (6 = TG6). Introduce cada nivel de un mismo tipo de tropa en una fila distinta.",["«All»: todas las tropas","Tipo: Apex Infantry","Cantidad: 637.997","Nivel T: X = T10","Nivel TG: 6 dorado = TG6"]]
  ]},
  march:{title:"Número total de marchas",steps:[
   ["Importante: incluye siempre tu propia marcha inicial en el total. No es solo el número de rallies a los que te unes.",[]],
   ["Ejemplo: 1 rally que inicias + 6 rallies a los que te unes = 7 marchas en total. Selecciona 7 en el optimizador.",[]]
  ]},
  capacity:{title:"Encontrar la capacidad base de marcha",steps:[
   ["En la ciudad, toca tu poder personal arriba a la izquierda: el número junto al icono del puño, no tu retrato.",["Poder personal"]],
   ["En «Bonus Overview», baja hasta «Military». Copia «Deployment Capacity» (112.100 en este ejemplo). «March Queue» indica únicamente el número de marchas disponibles, NO la capacidad de tropas. No sumes por tu cuenta los bonos de héroes, mascotas, Valora o Mariscal.",["Military","Deployment Capacity: 112.100"]]
  ]},
  combatStats:{title:"Escuadrón, infantería, caballería y arqueros",steps:[
   ["Toca tu poder personal arriba a la izquierda (puño con un número) para abrir «Bonus Overview».",["Poder personal"]],
   ["En «Military», busca «Squads’ Attack» y «Squads’ Lethality». El ejemplo muestra 276,3 % de ataque y 60,1 % de letalidad. No se necesitan defensa ni salud.",["Squads’ Attack: 276,3 %","Squads’ Lethality: 60,1 %"]],
   ["Baja más y anota «Attack» y «Lethality» para cada tipo: infantería 184,4 / 276,5 %, caballería 174,9 / 250,7 %, arqueros 252,9 / 318,8 %. Ignora defensa y salud. Introduce valores separados, que aún no estén sumados, y sin bonos temporales activos.",["Ataque de infantería","Letalidad de infantería","Ataque de caballería","Letalidad de caballería","Ataque de arqueros","Letalidad de arqueros"]]
  ]},
  heroes:{title:"Resumen de héroes, estrellas y Widgets",steps:[
   ["Desde la ciudad, toca «Heroes» en el menú inferior para abrir la lista completa de héroes.",["Abrir Heroes"]],
   ["Marca en el optimizador todos los héroes que tengas. Comprueba sus estrellas y el progreso en las flores bajo cada retrato. El calculador considera que todos los héroes están al nivel 80. Atención: «S4», «S5», etc. arriba a la derecha indican la generación del héroe, NO el número de estrellas.",["Héroe disponible","Flores = progreso de estrellas","S5 = generación, no estrellas"]],
   ["Toca el retrato de un héroe dorado, abre «Gear» y busca su Widget exclusivo en la parte inferior. En el ejemplo, «Immortal’s Flask +5» de Long Fei es Widget de nivel 5. El equipo a ambos lados del héroe NO es el Widget.",["Widget: +5","Pestaña Gear"]]
  ]},
  expedition:{title:"Revisar estadísticas tras cambiar el equipo",steps:[
   ["Primero equipa a los tres héroes iniciales recomendados con tu mejor equipo. Después abre cada héroe, toca «Stats» y el icono de lista de la esquina inferior derecha. Repite el proceso con los tres héroes.",["Stats","Abrir estadísticas detalladas"]],
   ["En «Expedition» lee SOLO ataque y letalidad, por ejemplo para Yang: Archer Attack +492,17 % y Archer Lethality +323,80 %. No introduzcas defensa, salud ni «Conquest». El tipo de tropa depende del héroe inicial. Registra los valores DESPUÉS de cambiar el equipo y no los sumes dos veces a las estadísticas base.",["Ataque Expedition: +492,17 %","Letalidad Expedition: +323,80 %"]]
  ]},
  pets:{title:"Bonos de mascotas: habilidades y niveles",steps:[
   ["Abre «Pet Skill». Las espadas cruzadas indican habilidades de combate y «Lv.» en cada icono indica el nivel de habilidad. Toca la habilidad correspondiente para comprobar su nombre y efecto real.",["Icono de combate","Nivel bajo el icono de mascota","Abrir habilidad del ejemplo"]],
   ["Los detalles muestran nombre, nivel, duración y tiempo de recarga. Ejemplo: «Antler Impact Lv. 5» otorga 100.000 de capacidad de RALLY durante 2 horas, NO tu capacidad de marcha personal. Activa solo los bonos que realmente estén vigentes durante la Trampa del Oso. Un tiempo de recarga no demuestra que el bono esté activo.",["Antler Impact Lv. 5","+100.000 capacidad de rally, no de marcha"]]
  ]},
  valora:{title:"Valora: Hunter Instinct y Savage Advantage",steps:[
   ["En tu ciudad, toca el edificio del Maestro que muestra el retrato de Valora y una barra de progreso verde.",["Abrir edificio del Maestro"]],
   ["Abre «Stats» de Valora y toca el icono de habilidad abajo a la izquierda. «Hunter Instinct Lv. 9» otorga aquí +24 % de puntos de daño personales en la Caza del Oso. «Next Level Bonus» (+27 %) todavía NO se aplica. El nivel de relación «Close 2» arriba a la izquierda tampoco es un nivel de habilidad.",["Hunter Instinct nivel 9","Bono actual: +24 %","Icono Hunter Instinct (abajo a la izquierda)"]],
   ["Cambia a «Skills» y toca «Savage Advantage» abajo a la derecha. El nivel 10 mostrado otorga +30.000 de capacidad de escuadrón para la Caza del Oso. IMPORTANTE: Hunter Instinct y Savage Advantage tienen niveles de habilidad INDEPENDIENTES. Nunca asignes automáticamente el mismo nivel a ambos.",["Savage Advantage nivel 10","+30.000 capacidad de escuadrón de Caza del Oso","Habilidad Savage Advantage (abajo a la derecha)","Skills"]]
  ]}
 }
};
const ui={
 en:{
  '📷 Bild lädt …':'📷 Loading image…',
  'Bildbereich vorübergehend nicht verfügbar.':'Image area temporarily unavailable.',
  '🔍 Bild vergrößern':'🔍 Enlarge image',
  'Bild verkleinern':'Shrink image',
  'Hilfe schließen':'Close help',
  '← Zurück':'← Back',
  'Weiter →':'Next →',
  'Verstanden ✓':'Got it ✓',
  '📷 Screenshot wird geladen …':'📷 Loading screenshot…',
  'Screenshot konnte nicht geladen werden. Die Anleitung bleibt lesbar.':'Screenshot could not be loaded. You can still read the guide.',
  'Wo finde ich diesen Wert?':'Where can I find this value?',
  'Hilfe: ':'Help: ',
  'Original Kingshot-Screenshot: ':'Original Kingshot screenshot: '
 },
 fr:{
  '📷 Bild lädt …':'📷 Chargement de l’image…',
  'Bildbereich vorübergehend nicht verfügbar.':'Zone de l’image temporairement indisponible.',
  '🔍 Bild vergrößern':'🔍 Agrandir l’image',
  'Bild verkleinern':'Réduire l’image',
  'Hilfe schließen':'Fermer l’aide',
  '← Zurück':'← Retour',
  'Weiter →':'Suivant →',
  'Verstanden ✓':'Compris ✓',
  '📷 Screenshot wird geladen …':'📷 Chargement de la capture…',
  'Screenshot konnte nicht geladen werden. Die Anleitung bleibt lesbar.':'Impossible de charger la capture. Le guide reste lisible.',
  'Wo finde ich diesen Wert?':'Où trouver cette valeur ?',
  'Hilfe: ':'Aide : ',
  'Original Kingshot-Screenshot: ':'Capture originale de Kingshot : '
 },
 es:{
  '📷 Bild lädt …':'📷 Cargando imagen…',
  'Bildbereich vorübergehend nicht verfügbar.':'Zona de imagen temporalmente no disponible.',
  '🔍 Bild vergrößern':'🔍 Ampliar imagen',
  'Bild verkleinern':'Reducir imagen',
  'Hilfe schließen':'Cerrar ayuda',
  '← Zurück':'← Atrás',
  'Weiter →':'Siguiente →',
  'Verstanden ✓':'Entendido ✓',
  '📷 Screenshot wird geladen …':'📷 Cargando captura…',
  'Screenshot konnte nicht geladen werden. Die Anleitung bleibt lesbar.':'No se pudo cargar la captura. Puedes seguir leyendo la guía.',
  'Wo finde ich diesen Wert?':'¿Dónde encuentro este valor?',
  'Hilfe: ':'Ayuda: ',
  'Original Kingshot-Screenshot: ':'Captura original de Kingshot: '
 }
};
root.NRW_BEAR_HELP_LOCALES={guides,ui};
})(window);
