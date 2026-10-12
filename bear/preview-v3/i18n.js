/* NRW Bear V3 text-only localisation; shares nrw_page_lang with Welcome NRW.
 * Game character names, canonical skill names and stored IDs never translate.
 */
(function(root){
'use strict';
const table=[
['Deine Helden','Your heroes','Tes héros','Tus héroes'],
['Aus deinen ausgewählten Helden.','Based on your selected heroes.','D’après les héros sélectionnés.','Según los héroes seleccionados.'],
['Deine Bear-Formation. Ohne Screenshot-Marathon.','Your Bear formation. No screenshot marathon.','Ta formation Ours. Sans avalanche de captures.','Tu formación del Oso. Sin maratón de capturas.'],
['🐻 NRW · BÄREN-OPTIMIERER','🐻 NRW · BEAR OPTIMIZER','🐻 NRW · OPTIMISEUR OURS','🐻 NRW · OPTIMIZADOR DEL OSO'],
['Nur deinen Spielernamen eingeben. Danach wählst du zwischen Heldenempfehlung und erweiterter Schadensoptimierung.','Enter your player name, then choose hero recommendations or advanced damage optimization.','Saisis ton pseudo, puis choisis les héros ou l’optimisation avancée des dégâts.','Introduce tu nombre y elige héroes u optimización avanzada de daño.'],
['Dein Kingshot-Name','Your Kingshot name','Ton pseudo Kingshot','Tu nombre en Kingshot'],
['Profil öffnen / neu anlegen →','Open / create profile →','Ouvrir / créer le profil →','Abrir / crear perfil →'],
['Bitte einen Namen mit mindestens zwei Zeichen eingeben.','Enter a name of at least two characters.','Saisis un nom de deux caractères minimum.','Introduce un nombre de al menos dos caracteres.'],
['Hinweis: Wenn GitHub-Speicherung aktiviert ist, kann jeder, der diesen Namen kennt, die hinterlegten Spielwerte lesen. Es werden keine Screenshots oder Kingshot-IDs gespeichert.','Note: When shared GitHub storage is enabled, anyone knowing this name can view its game stats. No screenshots or game IDs are stored.','Note : avec la sauvegarde GitHub activée, toute personne connaissant ce pseudo peut voir les stats. Aucune capture ni ID de jeu n’est stockée.','Aviso: con el almacenamiento de GitHub activado, cualquiera que conozca el nombre podrá ver sus datos. No se guardan capturas ni IDs.'],
['Bereits auf diesem Gerät geöffnet','Recently opened on this device','Ouverts récemment sur cet appareil','Abiertos recientemente en este dispositivo'],
['← Namen wechseln','← Change name','← Changer de pseudo','← Cambiar nombre'],
['Jetzt speichern','Save now','Enregistrer','Guardar ahora'],
['Was möchtest du optimieren?','What would you like to optimize?','Que veux-tu optimiser ?','¿Qué quieres optimizar?'],
['⚔️ Nur Starter-/Joiner-Helden','⚔️ Starter / joiner heroes only','⚔️ Héros lanceurs / participants','⚔️ Solo héroes de inicio / apoyo'],
['📈 Erweiterte Schadensoptimierung','📈 Advanced damage optimization','📈 Optimisation avancée des dégâts','📈 Optimización avanzada del daño'],
['Alle Eingaben werden unter diesem Namen gespeichert. OCR bleibt ausgeschaltet. Auf anderen Geräten ist derselbe Name abrufbar, sobald die GitHub-Synchronisierung eingerichtet ist.','Inputs are stored under this name. OCR is disabled. Cross-device sync will follow when GitHub storage is enabled.','Les données sont sauvegardées sous ce pseudo. L’OCR est désactivé. La synchronisation suivra avec GitHub.','Los datos se guardan con este nombre. OCR desactivado. La sincronización llegará al activar GitHub.'],
['← Modus wählen','← Choose mode','← Choisir le mode','← Elegir modo'],
['Märsche insgesamt','Total marches','Nombre de marches','Total de marchas'],
['Anklicken = im Besitz. Alle Helden gelten als Level 80. Sterne/Tier und bei goldenen Helden Widget einstellen.','Tap to mark owned. All heroes are level 80. Set stars/tier and widget (gold heroes only).','Touche pour sélectionner. Tous les héros sont niveau 80. Règle étoiles/paliers et widget (héros dorés).','Toca para seleccionar. Todos los héroes son nivel 80. Ajusta estrellas/etapas y widget (solo dorados).'],
['Generation 1 · Basishelden','Generation 1 · Base heroes','Génération 1 · Héros de base','Generación 1 · Héroes básicos'],
['Widget','Widget','Widget','Widget'],
['Truppen ergänzen (optional)','Add troops (optional)','Ajouter des troupes (optionnel)','Añadir tropas (opcional)'],
['Truppen','Troops','Troupes','Tropas'],
['Pro Truppentyp beliebig viele T- und TG-Stufen hinzufügen. Die Summen werden automatisch ermittelt.','Add any number of T/TG troop levels per troop type. Totals update automatically.','Ajoute autant de niveaux T/TG que nécessaire. Les totaux se mettent à jour.','Añade tantos niveles T/TG como necesites. Los totales se actualizan.'],
['Typ','Type','Type','Tipo'],['Anzahl','Count','Nombre','Cantidad'],
['+ Truppen hinzufügen','+ Add troops','+ Ajouter des troupes','+ Añadir tropas'],
['Marschkapazität ohne Helden (optional)','March capacity without heroes (optional)','Capacité de marche sans héros (optionnel)','Capacidad de marcha sin héroes (opcional)'],
['Mit Marschkapazität und Truppenbestand werden genaue Stückzahlen pro Marsch berechnet.','Enter capacity and troop inventory for exact counts per march.','Renseigne capacité et troupes pour obtenir les quantités par marche.','Introduce capacidad y tropas para calcular cantidades por marcha.'],
['Optional für die schnelle Heldenempfehlung.','Optional for quick hero recommendations.','Optionnel pour les conseils rapides.','Opcional para recomendaciones rápidas.'],
['Basiswerte & aktive Buffs','Base stats & active buffs','Stats de base et bonus actifs','Estadísticas base y bonificaciones activas'],
['Angriff und Tödlichkeit aller Truppentypen aus der Bonusübersicht. Fehlende Werte bleiben offen – keine stillen Schätzungen.','Enter attack and lethality from the bonus overview. Missing values are not guessed.','Saisis attaque et létalité depuis les bonus. Les valeurs manquantes ne sont pas devinées.','Introduce ataque y letalidad del resumen de bonificaciones. No se inventan valores.'],
['Anzahl aller Märsche (inkl. eigener Rally)','Number of marches (including own rally)','Nombre de marches (rally personnel inclus)','Número de marchas (incluido tu rally)'],
['Basis-Marschkapazität ohne Helden','Base march capacity without heroes','Capacité de marche sans héros','Capacidad base de marcha sin héroes'],
['Angriff %','Attack %','Attaque %','Ataque %'],
['Tödlichkeit %','Lethality %','Létalité %','Letalidad %'],
['Infanterie','Infantry','Infanterie','Infantería'],
['Kavallerie','Cavalry','Cavalerie','Caballería'],
['Bogenschützen','Archers','Archers','Arqueros'],
['Inf','Inf','Inf','Inf'],['Kav','Cav','Cav','Cab'],['Bog','Arc','Arc','Arq'],
['Herkunft dieser Werte','Source of these stats','Origine de ces stats','Origen de estos datos'],
['Bereits kombinierte Kampfwerte','Combined combat stats','Stats de combat combinées','Estadísticas de combate combinadas'],
['Separate Werte aus Bonusübersicht','Separate bonus overview values','Valeurs séparées de l’aperçu des bonus','Valores separados de resumen de bonificaciones'],
['Schwadron Angriff %','Squad attack %','Attaque d’escouade %','Ataque del escuadrón %'],
['Schwadron Tödlichkeit %','Squad lethality %','Létalité d’escouade %','Letalidad del escuadrón %'],
['Pets & Valora','Pets & Valora','Animaux & Valora','Mascotas y Valora'],
['Fähigkeitslevel','Skill level','Niveau de compétence','Nivel de habilidad'],
['Riesennashorn','Giant Rhino','Rhinocéros géant','Rinoceronte gigante'],
['Schwarzer Panther','Black Panther','Panthère noire','Pantera negra'],
['Eisenpanzer-Kriegsbär','Ironclad War Bear','Ours de guerre cuirassé','Oso de guerra acorazado'],
['Elch','Moose','Élan','Alce'],
['Mächtiger Bison','Mighty Bison','Bison puissant','Bisonte poderoso'],
['Aktive Buffs markieren. Die bereits eingetragenen Kampfwerte nicht doppelt erhöhen.','Select active buffs. Do not count buffs already included in combat stats twice.','Sélectionne les bonus actifs. Ne les compte pas deux fois.','Marca las bonificaciones activas. No las cuentes dos veces.'],
['Aktive Pet-ATK/LET-Buffs sind bereits in diesen Werten enthalten','Active pet ATK/LET buffs are already included in these stats','Les bonus ATQ/LÉT des animaux sont déjà inclus','Las bonificaciones ATQ/LET ya están incluidas'],
['Heldenausrüstung nach dem Umziehen prüfen','Check hero gear after moving it','Vérifier l’équipement après transfert','Comprueba el equipo tras moverlo'],
['Ziehe zuerst deine beste Heldenausrüstung auf die drei empfohlenen Starter um. Trage DANACH ihre tatsächlichen Expeditionsboni für Angriff und Tödlichkeit ein. Nichts wird doppelt addiert.','Move your best gear to the three recommended starters first. THEN enter their actual expedition attack and lethality. No double counting.','Transfère ton meilleur équipement sur les trois lanceurs recommandés. ENSUITE renseigne attaque et létalité d’expédition. Pas de double comptage.','Mueve el mejor equipo a los tres héroes de inicio recomendados. DESPUÉS introduce ataque y letalidad de expedición. Sin duplicados.'],
['Expeditions-Angriff %','Expedition attack %','Attaque d’expédition %','Ataque de expedición %'],
['Expeditions-Tödlichkeit %','Expedition lethality %','Létalité d’expédition %','Letalidad de expedición %'],
['Empfohlene Starter','Recommended starters','Lanceurs recommandés','Héroes de inicio recomendados'],
['Die Heldenwahl ist modellbasiert. Alle Helden sind Level 80, die Skills werden aus Sternen als maximal ausgebaut angenommen.','Model-based selection. All heroes are level 80; skill levels assume their star-based maximum.','Sélection basée sur un modèle. Héros niveau 80, compétences estimées au maximum permis par les étoiles.','Selección basada en modelo. Héroes nivel 80; habilidades al máximo permitido por estrellas.'],
['Werte geprüft','Stats checked','Stats vérifiées','Datos comprobados'],
['Schätzung – Werte ergänzen','Estimate – add stats','Estimation – compléter les stats','Estimación – añade datos'],
['Deine Starter- & Joiner-Formationen','Your starter & joiner formations','Tes formations lanceur et renfort','Tus formaciones de inicio y apoyo'],
['Eigene Starter-Rally','Own starter rally','Ton propre rally','Tu propio rally'],
['Nicht belegt','Empty','Vide','Vacío'],
['Bitte einen passenden Joiner-Helden ergänzen.','Add a suitable joiner hero.','Ajoute un héros participant adapté.','Añade un héroe de apoyo adecuado.'],
['Bitte zuerst deine Helden auswählen.','Select your heroes first.','Sélectionne d’abord tes héros.','Selecciona primero tus héroes.'],
['Truppenbestände werden nur einmal verteilt. Bogenschützen haben für Joiner Vorrang.','Troops are allocated once. Joiners have priority for scarce archers.','Les troupes sont réparties une seule fois. Priorité aux archers pour les renforts.','Las tropas se asignan una vez. Prioridad a arqueros para apoyos.'],
['10/10/80 ist hier ein Richtwert. Mit deiner Marschkapazität und deinem Truppenbestand können wir die tatsächlichen Anzahlen ermitteln.','10/10/80 is a starting point. Enter march capacity and troops to get exact counts.','10/10/80 est un point de départ. Renseigne capacité et troupes pour les quantités exactes.','10/10/80 es una referencia. Introduce capacidad y tropas para cantidades exactas.'],
['Für genaue Truppenzahlen bitte die Bestände vervollständigen.','Complete troop inventory for exact numbers.','Complète les effectifs pour les nombres exacts.','Completa las tropas para obtener cantidades exactas.'],
['10/10/80 als Ausgangsformation; ohne Truppenbestände noch keine exakte Verteilung.','10/10/80 as a baseline; enter troop inventory for an exact allocation.','10/10/80 comme base ; saisis tes troupes pour une répartition exacte.','10/10/80 como base; introduce tropas para distribución exacta.'],
['⚔️ Formationen berechnen','⚔️ Calculate formations','⚔️ Calculer les formations','⚔️ Calcular formaciones'],
['☁️ Schadenswert berechnen','☁️ Calculate damage','☁️ Calculer les dégâts','☁️ Calcular daño'],
['Helden und Truppen werden zusammengestellt …','Selecting heroes and troops …','Assemblage des héros et troupes…','Preparando héroes y tropas…'],
['Schadenswerte werden berechnet …','Calculating damage …','Calcul des dégâts…','Calculando daño…'],
['Erweiterte Schadensoptimierung','Advanced damage optimization','Optimisation avancée des dégâts','Optimización avanzada del daño'],
['Helden-Referenzdaten werden noch geladen. Bitte danach erneut berechnen.','Hero reference data still loading. Try again shortly.','Données des héros en chargement. Réessaie bientôt.','Datos de héroes aún cargando. Vuelve a intentar.'],
['Für die Berechnung fehlen Truppen, Basiswerte oder die Marschkapazität.','Troops, base stats or march capacity are missing.','Troupes, stats ou capacité de marche manquantes.','Faltan tropas, estadísticas o capacidad de marcha.'],
['Keine gültige Marschkapazität.','No valid march capacity.','Aucune capacité de marche valide.','Sin capacidad de marcha válida.'],
['Mit diesen Truppen lässt sich keine gültige Formation berechnen.','No valid formation found for these troops.','Aucune formation possible avec ces troupes.','No hay formación válida con esas tropas.'],
['Berechnung anhand deiner ausgewählten Starter und Truppen.','Calculated from your selected starter heroes and troops.','Calcul basé sur les héros lanceurs et les troupes choisies.','Cálculo según héroes de inicio y tropas elegidos.'],
['⚠ Geschätzter Modellwert – kein bestätigter Kingshot-Schadenswert.','⚠ Estimated model index, not confirmed Kingshot damage.','⚠ Indice estimé, pas un dégât Kingshot confirmé.','⚠ Índice estimado, no es daño Kingshot confirmado.'],
['Ohne Joinerfähigkeiten','Without joiner skills','Sans compétences des renforts','Sin habilidades de apoyo'],
['Berechnung nicht verfügbar','Calculation unavailable','Calcul indisponible','Cálculo no disponible'],
['Modellindex','Model index','Indice du modèle','Índice del modelo'],
['Neuer Name – Eingaben werden automatisch gespeichert, sobald der Server bereit ist.','New profile – shared saving will activate when the server is ready.','Nouveau profil – sauvegarde partagée lorsque le serveur sera prêt.','Nuevo perfil – guardado compartido cuando el servidor esté listo.'],
['GitHub Pages: Eingaben werden nur lokal auf diesem Gerät gespeichert.','GitHub Pages preview: saved only on this device.','Aperçu GitHub Pages : données conservées sur cet appareil.','Vista previa GitHub Pages: solo se guarda en este dispositivo.'],
['GitHub Pages-Test: ausschließlich lokal gespeichert.','GitHub Pages preview: saved locally only.','Aperçu GitHub Pages : sauvegarde locale uniquement.','Vista previa GitHub Pages: guardado solo local.'],
['✓ Gespeichert (privates GitHub-Profil): ','✓ Saved (private GitHub profile): ','✓ Sauvegardé (profil GitHub privé) : ','✓ Guardado (perfil privado de GitHub): '],
['Bitte einen Namen mit mindestens zwei Zeichen eingeben.','Please enter at least two characters.','Saisis au moins deux caractères.','Introduce al menos dos caracteres.'],
['Starter ','Starter ','Lanceur ','Inicio '],
['Gemeinsames Profil geladen: ','Shared profile loaded: ','Profil partagé chargé : ','Perfil compartido cargado: '],
['Lokales Profil geöffnet. GitHub-Synchronisierung derzeit nicht verfügbar.','Local profile opened. GitHub sync is currently unavailable.','Profil local ouvert. Synchronisation GitHub indisponible.','Perfil local abierto. Sin sincronización de GitHub.'],
['Dieses Profil wird auf einem anderen Gerät verwaltet. Hier nur lokal gespeichert.','This profile is managed on another device. Saved locally only.','Ce profil est géré sur un autre appareil. Sauvegarde locale uniquement.','Este perfil se administra en otro dispositivo. Solo guardado local.'],
['Profil wurde zwischenzeitlich geändert. Neu öffnen, um Änderungen abzugleichen.','This profile was changed elsewhere. Reopen it to sync changes.','Ce profil a changé ailleurs. Rouvre-le pour synchroniser.','Este perfil cambió en otro dispositivo. Reábrelo para sincronizar.'],
['Nur lokal gespeichert – GitHub-Schreibzugang noch nicht bereit.','Saved locally only – GitHub writes not configured yet.','Sauvegarde locale – écriture GitHub non configurée.','Solo guardado local – escritura de GitHub no configurada.'],
['Nur lokal gespeichert – GitHub nicht erreichbar.','Saved locally only – GitHub unavailable.','Sauvegarde locale – GitHub indisponible.','Solo guardado local – GitHub no disponible.'],
['Noch fehlende Helden-/Pet-Angaben: ','Hero/pet info missing: ','Données héros/animaux manquantes : ','Faltan datos de héroes/mascotas: '],
['Generation ','Generation ','Génération ','Generación '],
['★','★','★','★']
];
const catalog={en:1,fr:2,es:3};
const exact=new Map(table.map(row=>[row[0],row]));
function language(){try{const x=localStorage.getItem('nrw_page_lang')||document.documentElement.lang||'en';return catalog[x]?x:x==='de'?'de':'en';}catch(_){return 'en';}}
function tr(v){
 if(typeof v!=='string'||!v||language()==='de')return v;
 const ix=catalog[language()];
 const entry=exact.get(v);if(entry)return entry[ix];
 // Dynamic labels assembled with a known translated static prefix.
 for(const prefix of ['Infanterie','Kavallerie','Bogenschützen','Starter ','Generation ','Gemeinsames Profil geladen: ','✓ Gespeichert (privates GitHub-Profil): ','Noch fehlende Helden-/Pet-Angaben: ']){
  if(v.startsWith(prefix)){const item=exact.get(prefix);
   if(item)return item[ix]+v.slice(prefix.length);}
 }
 if(v.endsWith('. Joiner'))return v.replace('. Joiner',language()==='fr'?'. renfort':language()==='es'?'. apoyo':'. join');
 if(v.endsWith('. Join'))return v.replace('. Join',language()==='fr'?'. renfort':language()==='es'?'. apoyo':'. join');
 return v;
}
function setLanguage(next){
 const lang=(next==='de'||next==='en'||next==='fr'||next==='es')?next:'en';
 try{localStorage.setItem('nrw_page_lang',lang);}catch(_){}
 document.documentElement.lang=lang;
 document.body.dataset.lang=lang;
 return lang;
}
root.NRW_BEAR_I18N={language,tr,setLanguage,supported:['de','en','fr','es']};
})(window);
