/* Read-only presentation of the advisor's actual outputs. No scoring, profile
 * fields, candidate ordering or damage calculations are changed here. */
(function(root){
'use strict';
const words={
 why:['Warum dieser Held?','Why this hero?','Pourquoi ce héros ?','¿Por qué este héroe?'],
 compare:['Direkter Vergleich','Direct comparison','Comparaison directe','Comparación directa'],
 choose:['Vergleichen mit','Compare with','Comparer avec','Comparar con'],
 chooseHint:['Aus deinen ausgewählten Helden derselben Truppenklasse. Die Auswahl ändert nur den Vergleich, nicht deine Starter oder Formationen.','From your selected heroes of the same troop class. This changes only the comparison, not your starters or formations.','Parmi tes héros sélectionnés de la même classe. Ce choix change uniquement la comparaison, pas tes lanceurs ni tes formations.','Entre tus héroes seleccionados de la misma clase. Solo cambia la comparación, no tus líderes ni tus formaciones.'],
 next:['Knapp dahinter','Next candidates','Autres candidats','Otros candidatos'],
 index:['Modellindex','Model index','Indice du modèle','Índice del modelo'],
 baseline:['100 = gleiche Rally ohne diesen Helden. Isolierter Beitrag im Empfehlungsmodell; kein vollständiger Teamvergleich und kein echter Bärenschaden.','100 = the same rally without this hero. Isolated contribution in the recommendation model; not a full team comparison or actual Bear damage.','100 = le même rally sans ce héros. Contribution isolée dans le modèle de recommandation ; ni comparaison d’équipes complètes ni dégâts réels.','100 = el mismo rally sin este héroe. Aporte aislado en el modelo de recomendación; no compara equipos completos ni representa daño real.'],
 conditions:['Beide Kandidaten verwenden dieselben Kampfwerte, T-/TG-Referenzen und Truppenklassengewichte. Heldenwahl und Verteilung wurden gemeinsam angenähert.','Both candidates use the same combat stats, T/TG references and troop-class weights. Hero choice and composition were approximated together.','Les deux candidats utilisent les mêmes statistiques, références T/TG et poids de troupes. Héros et répartition sont estimés ensemble.','Ambos candidatos usan las mismas estadísticas, referencias T/TG y pesos de tropas. Héroes y reparto se aproximaron conjuntamente.'],
 stored:['Gespeicherte Eingaben','Saved inputs','Données enregistrées','Datos guardados'],
 entered:['Sterne, Tier und Widget stammen aus deinem Profil. Dies bestätigt keine offizielle Kingshot-Schadensformel.','Stars, tier and widget come from your profile. This does not confirm an official Kingshot damage formula.','Étoiles, palier et widget viennent de ton profil. Cela ne confirme pas une formule officielle de dégâts Kingshot.','Estrellas, nivel y widget proceden de tu perfil. Esto no confirma una fórmula oficial de daño de Kingshot.'],
 assumptions:['Modellannahmen','Model assumptions','Hypothèses du modèle','Suposiciones del modelo'],
 assumed:['Skilllevel {level} aus Sternen als maximal ausgebaut angenommen; nicht separat bestätigt. Heldenlevel im vereinfachten Workflow: 80.','Skill level {level} assumed maxed from stars; not separately confirmed. Hero level in the simplified workflow: 80.','Niveau de compétence {level} supposé maximal selon les étoiles ; non confirmé séparément. Niveau du héros dans ce parcours : 80.','Habilidades de nivel {level} supuestas al máximo según las estrellas; sin confirmar por separado. Nivel del héroe en este flujo: 80.'],
 actual:['Gespeicherte Skilllevel werden verwendet. Heldenlevel im vereinfachten Workflow: 80.','Saved skill levels are used. Hero level in the simplified workflow: 80.','Les niveaux de compétence enregistrés sont utilisés. Niveau du héros dans ce parcours : 80.','Se usan los niveles de habilidad guardados. Nivel del héroe en este flujo: 80.'],
 unknown:['Nicht vollständig modelliert','Not fully modeled','Modélisation incomplète','Modelado incompleto'],
 noUnknown:['Keine weiteren unbekannten Skill-Effekte im vorliegenden Datensatz. Das Community-Modell bleibt eine Näherung.','No further unknown skill effects in this dataset. The community model remains an approximation.','Aucun autre effet inconnu dans ces données. Le modèle communautaire reste approximatif.','No hay más efectos desconocidos en estos datos. El modelo comunitario sigue siendo aproximado.'],
 partial:['Unvollständige Daten – der Abstand ist keine gesicherte Schadensprognose.','Incomplete data — the gap is not a reliable damage prediction.','Données incomplètes — cet écart ne garantit pas les dégâts.','Datos incompletos: la diferencia no garantiza el daño.'],
 overlap:['Die Modellbereiche überlappen; ungeklärte Effekte können die Reihenfolge ändern.','Model ranges overlap; unresolved effects may change the order.','Les plages se chevauchent ; des effets incertains peuvent changer l’ordre.','Los rangos se solapan; los efectos inciertos pueden cambiar el orden.'],
 caution:['Mit Skillannahmen – Modellvorsprung, keine garantierte Überlegenheit.','Uses skill assumptions — a model lead, not guaranteed superiority.','Avec hypothèses de compétences — avance du modèle, sans garantie.','Con habilidades supuestas: ventaja del modelo, sin garantía.'],
 small:['Kleiner Modellvorsprung','Small model lead','Faible avance du modèle','Pequeña ventaja del modelo'],
 clear:['Deutlicher Modellvorsprung','Clear model lead','Avance nette du modèle','Ventaja clara del modelo'],
 tie:['Gleicher Modellwert','Equal model score','Même indice','Mismo índice'],
 gap:['{winner} liegt im konservativen Modell um {gap} % vor {other}.','{winner} leads {other} by {gap}% in the conservative model.','{winner} devance {other} de {gap} % dans le modèle prudent.','{winner} supera a {other} un {gap} % en el modelo conservador.'],
 tied:['Identische Modellwerte; die bestehende Sortierung entscheidet alphabetisch.','Identical model scores; the existing sort breaks ties alphabetically.','Indices identiques ; le tri existant départage par ordre alphabétique.','Índices idénticos; el orden existente desempata alfabéticamente.'],
 noAlternative:['Kein weiterer bewertbarer Held dieser Klasse gespeichert.','No other scored hero of this class saved.','Aucun autre héros évaluable de cette classe enregistré.','No hay otro héroe evaluable guardado de esta clase.'],
 missing:['Referenz oder Sterne fehlen – kein belastbarer Modellindex.','Reference or stars missing — no reliable model index.','Référence ou étoiles absentes — indice indisponible.','Faltan referencia o estrellas: índice no disponible.'],
 pending:['Sternstufe noch nicht geprüft.','Star rating not yet reviewed.','Étoiles non vérifiées.','Estrellas sin revisar.'],
 illustrative:['Kampfwerte fehlen: illustrative Truppenklassengewichte und Referenzwerte.','Combat stats missing: illustrative troop-class weights and reference values.','Statistiques manquantes : poids et références illustratifs.','Faltan estadísticas: pesos y referencias ilustrativos.'],
 weight:['Anteil dieser Truppenklasse am Modell-Basisschaden: {weight} %.','This troop class contributes {weight}% of modeled baseline damage.','Cette classe représente {weight} % des dégâts de base du modèle.','Esta clase aporta el {weight} % del daño base del modelo.'],
 base:['Expeditionsangriff der eigenen Klasse','Own-class expedition attack','Attaque d’expédition de sa classe','Ataque de expedición de su clase'],
 skills:['Berücksichtigte offensive Fähigkeiten','Offensive skills included','Compétences offensives incluses','Habilidades ofensivas incluidas'],
 noSkills:['Keine offensiven Effekte im vorliegenden Datensatz berücksichtigt.','No offensive effects included from this dataset.','Aucun effet offensif inclus dans ces données.','Sin efectos ofensivos incluidos en estos datos.'],
 attack:['Angriff','Attack','Attaque','Ataque'],lethality:['Tödlichkeit','Lethality','Létalité','Letalidad'],damage:['Schaden','Damage','Dégâts','Daño'],
 squad:['Alle Truppen','All troops','Toutes les troupes','Todas las tropas'],
 infantry:['Infanterie','Infantry','Infanterie','Infantería'],cavalry:['Kavallerie','Cavalry','Cavalerie','Caballería'],archer:['Bogenschützen','Archers','Archers','Arqueros'],
 expected:['Erwartungswert','Expected value','Valeur attendue','Valor esperado'],
 range:['Untergrenze / Sensitivitätsobergrenze','Lower estimate / sensitivity upper bound','Estimation basse / borne de sensibilité haute','Estimación inferior / límite de sensibilidad superior'],
 widget:['Offensiver Rally-Widget-Effekt','Offensive rally widget effect','Effet offensif du widget de rally','Efecto ofensivo del widget de rally'],
 noWidget:['Kein offensiver Rally-Widget-Effekt berücksichtigt. Ausrüstungswerte werden hier nicht erneut addiert.','No offensive rally widget effect included. Gear stats are not added again here.','Aucun effet offensif de widget inclus. Les statistiques d’équipement ne sont pas ajoutées à nouveau.','Sin efecto ofensivo de widget incluido. Las estadísticas de equipo no se suman de nuevo.'],
 storedUnknown:['Nicht gespeichert','Not saved','Non enregistré','Sin guardar'],
 difference:['Warum der Abstand?','Why the gap?','Pourquoi cet écart ?','¿Por qué la diferencia?'],
 decomposition:['Der Index setzt sich aus klassengewichtetem Expeditionsangriff, den unten ausgewiesenen Skill-Effekten und dem offensiven Widget-Faktor zusammen. Die Werte wirken gemeinsam; einzelne Prozentboni lassen sich nicht als Schadensprozente addieren.','The index combines class-weighted expedition attack, the skill effects listed below and the offensive widget factor. Effects interact; individual percentage bonuses cannot be added as damage percentages.','L’indice combine attaque pondérée, effets de compétences ci-dessous et facteur du widget offensif. Ces effets interagissent ; leurs pourcentages ne s’additionnent pas en dégâts.','El índice combina ataque ponderado, efectos de habilidades y factor del widget ofensivo. Interactúan: sus porcentajes no se suman como daño.'],
 stats:['Sterne / Tier / Widget','Stars / tier / widget','Étoiles / palier / widget','Estrellas / nivel / widget'],
 excluded:['Weitere Effekte sind als defensiv, wirtschaftlich oder für das Bärenziel ungeeignet ausgeschlossen: {count}.','Other effects excluded as defensive, economic or unsuitable for the Bear target: {count}.','Autres effets exclus car défensifs, économiques ou inadaptés à l’ours : {count}.','Otros efectos excluidos por ser defensivos, económicos o inadecuados para el oso: {count}.'],
 unresolved:['Mechanik oder Bären-Timing nicht verifiziert.','Mechanic or Bear timing not verified.','Mécanique ou timing contre l’ours non vérifié.','Mecánica o tiempos contra el oso sin verificar.']
};
function language(){return root.NRW_BEAR_I18N?.language?.()||'en';}
function tr(key,args={}){const row=words[key];let s=row?.[{de:0,en:1,fr:2,es:3}[language()]??1]||key;for(const [k,v] of Object.entries(args))s=s.replaceAll('{'+k+'}',String(v));return s;}
function fmt(x){return Number.isFinite(x)?x.toLocaleString(language(),{maximumFractionDigits:2}):'—';}
function alternatives(group){
 return (group?.choices||[]).filter(h=>h.name!==group?.best?.name&&h.type===group.type);
}
function comparison(group,selectedName=null){
 const winner=group?.best,available=alternatives(group);
 const other=available.find(h=>h.name===selectedName)||available.find(h=>Number.isFinite(h.score))||null;
 if(!winner||!Number.isFinite(winner.score))return {winner,other,gap:null,state:'missing',uncertain:true};
 if(other&&!Number.isFinite(other.score))return {winner,other,gap:null,state:'missing',uncertain:true};
 const incomplete=h=>h.confidence==='limited'||h.starPendingReview||!h.usesAttackReference||h.unmodeledSkills?.length||h.rankingBasis==='illustrative';
 const assumed=winner.assumedSkill||other?.assumedSkill;
 const overlap=Boolean(other&&Math.max(winner.conservativeScore,other.conservativeScore)<=Math.min(winner.optimisticScore,other.optimisticScore));
 const gap=other?.score>0?(winner.score/other.score-1)*100:null;
 const provisional=winner.includesUnverifiedBearUptime||other?.includesUnverifiedBearUptime;
 const state=incomplete(winner)||(other&&incomplete(other))?'partial':overlap&&winner.score!==other.score?'overlap':provisional?'partial':assumed?'caution':'higher';
 return {winner,other,gap,state,uncertain:state!=='higher',strength:gap===null?null:Math.abs(gap)<1e-8?'tie':gap<5?'small':'clear'};
}
function node(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function p(text,cls='bear-name-muted'){return node('p',cls,text);}
function identity(hero,image){
 const n=node('div','bear-advice-identity');if(image){const img=node('img');img.src=image;img.alt='';img.loading='lazy';n.append(img);}
 const copy=node('div');copy.append(node('strong','',hero.name));
 copy.append(node('small','',`${fmt(hero.stars)} ★ · T${fmt(hero.tier)} · Widget ${hero.widget===null?tr('storedUnknown'):'+'+fmt(hero.widget)}`));n.append(copy);return n; // taste-skill-ignore: stored Kingshot star progression, not a decorative icon.
}
function effects(hero){
 const list=node('ul','bear-advice-effects');
 for(const effect of hero.offensiveSkills||[]){
  const cls=Number.isInteger(effect.type)?tr(['infantry','cavalry','archer'][effect.type]):tr('squad');
  const metric=tr(effect.kind.includes('attack')?'attack':effect.kind==='lethality'?'lethality':'damage');
  const amount=effect.uncertain?`${fmt(Number(effect.lower)||0)}–${fmt(effect.amount)}`:fmt(effect.amount);
  const expected=effect.expected||/proc|probability|timing|every/.test(effect.assumption||'');
  const item=node('li');item.append(node('span','',effect.name),node('small','',`${cls} · ${metric} +${amount} %${expected?' · '+tr('expected'):''}${effect.uncertain?' · '+tr('unresolved'):''}`));list.append(item);
 }return list.children.length?list:p(tr('noSkills'));
}
function evidence(hero){
 const content=node('div','bear-advice-evidence');
 content.append(node('h4','',tr('stored')),p(tr('entered')));
 if(hero.starPendingReview)content.append(p(tr('pending'),'bear-advice-caution'));
 content.append(node('h4','',tr('assumptions')),p(hero.assumedSkill?tr('assumed',{level:fmt(hero.skillCap)}):tr('actual')));
 if(hero.rankingBasis==='illustrative')content.append(p(tr('illustrative'),'bear-advice-caution'));
 content.append(node('h4','',tr('unknown')));
 const unknown=hero.uncertainSkills||[];
 if(unknown.length)for(const e of unknown)content.append(p((e.name?e.name+' · ':'')+tr('unresolved')));
 if(hero.includesUnverifiedBearUptime)content.append(p(tr('range')+': '+fmt(hero.conservativeScore)+' / '+fmt(hero.optimisticScore)));
 if(!unknown.length&&!hero.includesUnverifiedBearUptime)content.append(p(tr('noUnknown')));
 if(hero.irrelevantSkills?.length)content.append(p(tr('excluded',{count:hero.irrelevantSkills.length})));
 return content;
}
function candidate(hero,image){
 const col=node('article','bear-advice-candidate');col.append(identity(hero,image));
 const score=node('div','bear-advice-value');score.append(node('span','',tr('index')),node('strong','',fmt(hero.score)));col.append(score);
 col.append(p(tr('base')+': '+fmt(hero.nativeExpeditionAtk)+' %'));
 col.append(p(tr('weight',{weight:fmt(hero.attackWeight*100)})));
 col.append(node('h4','',tr('skills')),effects(hero));
 col.append(p(hero.widgetEffect>0?tr('widget')+': '+tr(hero.widgetType==='rally-attack'?'attack':'lethality')+' +'+fmt(hero.widgetEffect)+' %':tr('noWidget')));
 return col;
}
function render(group,imageFor=()=>null){
 const details=node('details','bear-advice');details.dataset.heroClass=group.type;
 details.append(node('summary','',tr('why')));
 const available=alternatives(group),initial=comparison(group);
 let select=null;
 if(initial.winner&&available.length){
  const picker=node('label','bear-name-field bear-advice-picker');
  picker.append(node('span','',tr('choose')));
  select=node('select','bear-advice-select');
  select.setAttribute('aria-label',tr('choose'));
  select.dataset.bearComparison=group.type;
  for(const h of available){
   const option=node('option','',h.name+(Number.isFinite(h.score)?'':' · '+tr('missing')));
   option.value=h.name;select.append(option);
  }
  select.value=initial.other?.name||available[0].name;
  picker.append(select);details.append(picker,p(tr('chooseHint')));
 }
 const body=node('div','bear-advice-body');details.append(body);
 function paint(){
 const info=comparison(group,select?.value),{winner,other}=info;
 body.replaceChildren();
 if(!winner){body.append(p(tr('missing')));return;}
 if(info.strength)body.append(node('strong','bear-advice-verdict',tr(info.strength)));
 if(info.gap!==null)body.append(p(info.strength==='tie'?tr('tied'):tr('gap',{winner:winner.name,other:other.name,gap:fmt(info.gap)})));
 if(info.uncertain)body.append(p(tr(info.state==='missing'?'missing':info.state),'bear-advice-caution'));
 body.append(p(tr('baseline')),p(tr('conditions')));
 body.append(node('h4','',tr('compare')));
 const comparisonGrid=node('div','bear-advice-comparison');comparisonGrid.append(candidate(winner,imageFor(winner.name)));
 if(other)comparisonGrid.append(candidate(other,imageFor(other.name)));else body.append(p(tr('noAlternative')));
 body.append(comparisonGrid,node('h4','',tr('difference')),p(tr('decomposition')));
 const provenance=node('div','bear-advice-provenance');
 for(const h of [winner,other].filter(Boolean)){const section=node('section');section.append(node('h4','',h.name),evidence(h));provenance.append(section);}
 body.append(provenance);
 const next=available.slice(0,3);
 if(next.length){body.append(node('h4','',tr('next')));const list=node('ul','bear-advice-alternatives');
  for(const h of next){const li=node('li');li.append(identity(h,imageFor(h.name)),node('span','',Number.isFinite(h.score)?tr('index')+' '+fmt(h.score):tr('missing')));list.append(li);}body.append(list);
 }
 }
 // Repaint only the evidence. Keep the native selector, keyboard focus and
 // disclosure in place; never invoke ranking, saving or formation code.
 select?.addEventListener('change',paint);paint();return details;
}
root.NRW_BEAR_HERO_EXPLANATIONS={comparison,alternatives,render,tr,words};
})(window);
