import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.58.0/+esm";
import {createEventHub} from "./event-library.js?v=pages-1";
import {createOperations} from "./operations.js?v=pages-1";

// Private AllianceOS pilot. Data is NEVER stored in localStorage; only auth session is.
// All records and permissions are issued by the authenticated Edge Function.
const LEITUNG_PATH=new URL("./",import.meta.url).pathname;
const SITE_PATH=new URL("../",import.meta.url).pathname;
const BASE="https://bdzlgirowutasrsycjfj.supabase.co";
const FUNCTION=BASE+"/functions/v1/allianceos-leitung";
const supabase=createClient(BASE,"sb_publishable_8i1ismeQtj9WM-xVN_Vm0w_Tj7AvVtL",{
  auth:{storageKey:"aos_leitung_auth_v1",persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
});
const $=id=>document.getElementById(id);
const q=(sel,scope=document)=>[...scope.querySelectorAll(sel)];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const LANGS=["de","en","fr","es"],NAMES={de:"Deutsch",en:"English",fr:"Français",es:"Español"};
const copy={
de:{workplace:"LEITUNGSZENTRALE",overview:"Übersicht",roster:"Spielerverwaltung",transfers:"Transferplanung",languages:"Sprachen",laws:"Laws-Verwaltung",events:"Eventplanung",settings:"Allianz & Rechte",private:"Geschützter Bereich",scopeNotice:"Nur Daten deiner eigenen Allianz. Keine öffentlichen Spielerlisten.",backHome:"← Zurück zur Willkommensseite",logout:"Abmelden",securePilot:"ALLIANCEOS · GESCHÜTZTER PILOT",leadership:"Deine Allianz.",underControl:"Alles im Blick.",heroText:"Spieler, Transfers, Regeln und Termine zentral verwalten. Änderungen bleiben auf NRW beschränkt.",activePlayers:"Aktive Spieler",fromRoster:"Aus dem Allianzregister",incoming:"Eingehende Transfers",plannedAndConfirmed:"In Planung / bestätigt",seatsAvailable:"Freie Plätze (geplant)",afterReservations:"Nach bestätigten Wechseln",publishedEvents:"Veröffentlichte Events",fromPlanner:"Aus der Eventplanung",transferHub:"Transfermanager",transferHubDesc:"Interessenten bis zur Aufnahme begleiten",open:"Öffnen →",nextEvents:"Anstehende Termine",nextEventsDesc:"Einmal planen, überall aktuell halten",pilotLabel:"Pilotstatus",pilotInfo:"Spieler werden aus vorhandenen Daten gelesen. Event-Bot, automatische KI-Übersetzungen, bezahlte Abonnements und Discord-Einladungen sind noch nicht angeschlossen. Es werden dafür keine fiktiven Ergebnisse angezeigt.",rosterEyebrow:"MITGLIEDER",rosterDesc:"Nur deine Allianz. Spielerdaten sind auf den letzten bekannten Stand begrenzt.",searchPlayers:"Name oder Spieler-ID suchen …",allStatuses:"Alle Status",active:"Aktiv",planned:"Geplant",left:"Ausgetreten",sortName:"Name A–Z",sortRank:"Rang absteigend",sortId:"Spieler-ID",player:"Spieler",rank:"Rang",strength:"Stärke",language:"Sprache",memberStatus:"Mitgliedschaft",addTransfer:"+ Transfer planen",transfersDesc:"Bewerbungen, Reservierungen, Wartelisten und abgeschlossene Wechsel.",interested:"Interessenten",shortlisted:"Vorgemerkt",confirmed:"Bestätigt",waiting:"Warteliste",allTransfers:"Alle Transfers",outgoing:"Ausgehende Transfers",direction:"Richtung",origin:"Herkunft",destination:"Ziel",window:"Zeitraum",status:"Status",supportedLanguages:"Unterstützte Sprachen",languageAccess:"Änderungen an Spracheinstellungen sind für R5 und berechtigte R4 möglich.",defaultLang:"Standardsprache",save:"Speichern",translationFlow:"Übersetzungsworkflow",translationStep1:"Originaltext schreiben",translationStep2:"Aktive Übersetzungen ergänzen und prüfen",translationStep3:"Gemeinsam veröffentlichen",translationWarning:"Eine automatische KI-Übersetzung ist noch nicht angeschlossen. Veröffentlichungen nutzen derzeit die manuell eingegebenen Texte.",languagesDesc:"Gemeinsame Spracheinstellungen für Willkommen, Leitungsseite und zukünftige Bots.",lawsDesc:"Entwürfe und veröffentlichte Fassungen mit Versionen; getrennt nach Königreich und Allianz.",addLaw:"+ Neue Regel",publicRuleNoticeTitle:"Veröffentlichungshinweis",publicRuleNotice:"Hier erstellte Laws gelten als AllianceOS-Fassung. Bestehende NAP-Gesetze werden nicht überschrieben. Königreichsgesetze erfordern eine gesonderte gemeinsame Freigabe.",eventsDesc:"Alle Zeiten werden in UTC gespeichert und für Spieler lokal angezeigt.",addEvent:"+ Event planen",eventSyncStatus:"Ausspielung",eventSyncNotice:"Öffentlich veröffentlichte Termine können von den Webseiten geladen werden. Discord-Ankündigungen und Erinnerungen benötigen noch den künftigen Event-Bot.",settingsDesc:"Stammdaten, Kapazitäten, Freigaben und Plattformmodule.",allianceConfig:"Allianzkonfiguration",allianceName:"Allianzname",capacity:"Maximale Mitglieder",logoUrl:"Logo-URL (optional)",discordGuild:"Discord Server-ID",adsEnable:"Werbung vormerken (noch nicht aktiv)",permissions:"Berechtigungen",rolesFuture:"R4-Rechte sind einzeln vorgesehen. Die sichere Einladungs- und Rollenvergabe wird als nächster Schritt freigeschaltet; vorhandene NAP-Zugänge werden nicht automatisch zu AllianceOS-R4.",subscription:"Abonnement",notConfigured:"Noch nicht eingerichtet",loginTitle:"Zugang zur Leitungszentrale",loginText:"Die Spielerlisten und internen Planungen sind geschützt. Melde dich mit einem bereits freigeschalteten Konto an.",password:"Passwort",login:"Anmelden",loginNote:"Es werden keine Konten automatisch angelegt. Zugriff erst nach Freigabe durch den AllianceOS-R5.",cancel:"Abbrechen",edit:"Bearbeiten",editPlayer:"Mitglied verwalten",editTransfer:"Transfer bearbeiten",newTransfer:"Transfer planen",newLaw:"Regel schreiben",editLaw:"Regel bearbeiten",newEvent:"Event erstellen",editEvent:"Event bearbeiten",noPlayers:"Keine Spieler gefunden.",noTransfers:"Noch keine Transfers geplant.",noEvents:"Noch keine Termine erfasst.",noLaws:"Noch keine Regeln in AllianceOS.",noUpcoming:"Keine anstehenden veröffentlichten Termine.",loading:"Lade Daten …",saved:"Änderungen gespeichert.",permissionDenied:"Keine Berechtigung für diesen Bereich.",sessionExpired:"Sitzung abgelaufen. Bitte erneut anmelden.",genericError:"Aktion konnte nicht ausgeführt werden.",locked:"Du hast keine AllianceOS-Freigabe für NRW.",loginFailed:"Anmeldung fehlgeschlagen. Bitte Zugangsdaten prüfen.",playerId:"Spieler-ID",playerName:"Ingame-Name",originKingdom:"Herkunftskönigreich",previousAlliance:"Bisherige Allianz",targetAlliance:"Zielallianz",power:"Spielerstärke (optional)",from:"Beginn",to:"Ende",notes:"Interne Notizen",directionIncoming:"Eingehend",directionOutgoing:"Ausgehend",waitlist:"Warteliste",completed:"Abgeschlossen",cancelled:"Abgebrochen",allowShare:"Für Transferabsprachen ausdrücklich freigeben (künftige Funktion)",scope:"Art der Regel",kingdom:"Königreichsgesetz",allianceLaw:"Allianzregel",lawNumber:"Nummer / Kennung",draft:"Entwurf",published:"Veröffentlicht",lawTitle:"Titel",lawText:"Regeltext",version:"Version",eventTitle:"Eventname",eventText:"Hinweise",startTime:"Start (lokale Uhrzeit)",endTime:"Ende (lokale Uhrzeit, optional)",requirements:"Teilnahmebedingungen",template:"Kingshot-Vorlage",reminders:"Erinnerungen (Minuten vor Start, durch künftigen Bot)",utcNote:"Beim Speichern wird automatisch in UTC umgerechnet.",saveSuccess:"Erfolgreich gespeichert.",profileLink:"Zum Bären-Optimierer",noPower:"Nicht verfügbar",freeSeats:"Plätze frei",unprotected:"Nicht öffentlich",r4Access:"R4 nur mit Freigabe",r5Access:"R5",invalidEmail:"Bitte eine gültige E-Mail-Adresse eingeben."},
en:{workplace:"LEADERSHIP CONSOLE",overview:"Overview",roster:"Player management",transfers:"Transfer planning",languages:"Languages",laws:"Laws management",events:"Event planning",settings:"Alliance & permissions",private:"Restricted access",scopeNotice:"Only your alliance's data. No public player lists.",backHome:"← Back to Welcome",logout:"Sign out",securePilot:"ALLIANCEOS · SECURE PILOT",leadership:"Your alliance.",underControl:"All in one place.",heroText:"Manage players, transfers, rules and events. Changes stay within NRW.",activePlayers:"Active players",fromRoster:"From the alliance roster",incoming:"Incoming transfers",plannedAndConfirmed:"Planned / confirmed",seatsAvailable:"Available seats (planned)",afterReservations:"After confirmed transfers",publishedEvents:"Published events",fromPlanner:"From the event planner",transferHub:"Transfer manager",transferHubDesc:"Guide candidates through onboarding",open:"Open →",nextEvents:"Upcoming events",nextEventsDesc:"Plan once, update everywhere",pilotLabel:"Pilot status",pilotInfo:"Players are read from existing records. Event bot, automatic AI translation, paid subscriptions and Discord invitations are not yet connected. No fictitious results are shown.",rosterEyebrow:"MEMBERS",rosterDesc:"Your alliance only. Player data reflects the last known state.",searchPlayers:"Search by name or player ID …",allStatuses:"All statuses",active:"Active",planned:"Planned",left:"Departed",sortName:"Name A–Z",sortRank:"Highest rank",sortId:"Player ID",player:"Player",rank:"Rank",strength:"Power",language:"Language",memberStatus:"Membership",addTransfer:"+ Plan transfer",transfersDesc:"Applications, reserved seats, waitlists and completed moves.",interested:"Interested",shortlisted:"Shortlisted",confirmed:"Confirmed",waiting:"Waitlist",allTransfers:"All transfers",outgoing:"Outgoing transfers",direction:"Direction",origin:"Origin",destination:"Destination",window:"Window",status:"Status",supportedLanguages:"Supported languages",languageAccess:"R5 and authorized R4 can change language settings.",defaultLang:"Default language",save:"Save",translationFlow:"Translation workflow",translationStep1:"Write original text",translationStep2:"Add and review active translations",translationStep3:"Publish together",translationWarning:"AI translation is not connected yet. Published versions use manually entered texts.",languagesDesc:"Shared language settings for Welcome, leadership and future bots.",lawsDesc:"Draft and published versions, separate for kingdom and alliance rules.",addLaw:"+ New rule",publicRuleNoticeTitle:"Publication notice",publicRuleNotice:"Laws created here are AllianceOS versions. Existing NAP laws are not replaced. Kingdom laws require separate joint approval.",eventsDesc:"Times are stored in UTC and displayed in each player's local timezone.",addEvent:"+ Plan event",eventSyncStatus:"Distribution",eventSyncNotice:"Publicly published dates can be loaded by the websites. Discord announcements and reminders still require the future event bot.",settingsDesc:"Core settings, capacity, permissions and platform modules.",allianceConfig:"Alliance settings",allianceName:"Alliance name",capacity:"Maximum members",logoUrl:"Logo URL (optional)",discordGuild:"Discord server ID",adsEnable:"Prepare ads (not active)",permissions:"Permissions",rolesFuture:"Individual R4 permissions are planned. Secure invitations and role assignment are the next step; existing NAP accounts are not automatically AllianceOS R4.",subscription:"Subscription",notConfigured:"Not configured",loginTitle:"Access the leadership console",loginText:"Player lists and internal plans are private. Sign in with an account that has already been authorized.",password:"Password",login:"Sign in",loginNote:"No accounts are created automatically. AllianceOS R5 approval is required.",cancel:"Cancel",edit:"Edit",editPlayer:"Manage member",editTransfer:"Edit transfer",newTransfer:"Plan transfer",newLaw:"Write rule",editLaw:"Edit rule",newEvent:"Create event",editEvent:"Edit event",noPlayers:"No matching players.",noTransfers:"No transfers planned yet.",noEvents:"No events recorded yet.",noLaws:"No AllianceOS rules yet.",noUpcoming:"No upcoming published events.",loading:"Loading data …",saved:"Changes saved.",permissionDenied:"You lack permission for this area.",sessionExpired:"Session expired. Please sign in again.",genericError:"The action could not be completed.",locked:"Your account is not authorized for NRW AllianceOS.",loginFailed:"Sign-in failed. Check your credentials.",playerId:"Player ID",playerName:"In-game name",originKingdom:"Origin kingdom",previousAlliance:"Previous alliance",targetAlliance:"Target alliance",power:"Player power (optional)",from:"Start",to:"End",notes:"Internal notes",directionIncoming:"Incoming",directionOutgoing:"Outgoing",waitlist:"Waitlist",completed:"Completed",cancelled:"Cancelled",allowShare:"Explicitly approve sharing for transfer talks (future feature)",scope:"Rule type",kingdom:"Kingdom law",allianceLaw:"Alliance rule",lawNumber:"Number / identifier",draft:"Draft",published:"Published",lawTitle:"Title",lawText:"Rule text",version:"Version",eventTitle:"Event name",eventText:"Instructions",startTime:"Start (local time)",endTime:"End (local time, optional)",requirements:"Participation requirements",template:"Kingshot template",reminders:"Reminders (minutes before event; future bot)",utcNote:"Automatically converted to UTC on saving.",saveSuccess:"Successfully saved.",profileLink:"Bear optimizer",noPower:"Unavailable",freeSeats:"Free seats",unprotected:"Not public",r4Access:"R4 with approval",r5Access:"R5",invalidEmail:"Enter a valid email address."},
fr:{workplace:"CENTRE DE DIRECTION",overview:"Vue d’ensemble",roster:"Gestion des joueurs",transfers:"Planification des transferts",languages:"Langues",laws:"Gestion des lois",events:"Calendrier des événements",settings:"Alliance et droits",private:"Accès protégé",scopeNotice:"Uniquement les données de votre alliance.",backHome:"← Retour à l’accueil",logout:"Se déconnecter",securePilot:"ALLIANCEOS · PILOTE SÉCURISÉ",leadership:"Votre alliance.",underControl:"Tout sous contrôle.",heroText:"Gérez joueurs, transferts, règles et événements depuis un seul endroit.",activePlayers:"Joueurs actifs",fromRoster:"Registre de l’alliance",incoming:"Transferts entrants",plannedAndConfirmed:"Prévus / confirmés",seatsAvailable:"Places disponibles",afterReservations:"Après réservations confirmées",publishedEvents:"Événements publiés",fromPlanner:"Depuis le calendrier",transferHub:"Gestionnaire de transferts",transferHubDesc:"Accompagner les candidats",open:"Ouvrir →",nextEvents:"Prochains événements",nextEventsDesc:"Planifier une fois, mettre à jour partout",pilotLabel:"État pilote",pilotInfo:"Les joueurs proviennent des registres existants. Bot d’événements, traductions IA, abonnements et invitations Discord ne sont pas encore connectés.",rosterEyebrow:"MEMBRES",rosterDesc:"Votre alliance uniquement. Dernier état connu.",searchPlayers:"Chercher un nom ou ID …",allStatuses:"Tous les statuts",active:"Actif",planned:"Prévu",left:"Parti",sortName:"Nom A–Z",sortRank:"Rang décroissant",sortId:"ID joueur",player:"Joueur",rank:"Rang",strength:"Puissance",language:"Langue",memberStatus:"Adhésion",addTransfer:"+ Planifier transfert",transfersDesc:"Candidatures, réservations, attentes et transferts terminés.",interested:"Intéressés",shortlisted:"Présélectionnés",confirmed:"Confirmés",waiting:"Liste d’attente",allTransfers:"Tous les transferts",outgoing:"Transferts sortants",direction:"Direction",origin:"Origine",destination:"Destination",window:"Période",status:"Statut",supportedLanguages:"Langues disponibles",languageAccess:"R5 et R4 autorisés peuvent gérer les langues.",defaultLang:"Langue par défaut",save:"Enregistrer",translationFlow:"Traductions",translationStep1:"Rédiger le texte original",translationStep2:"Ajouter et vérifier les traductions",translationStep3:"Publier simultanément",translationWarning:"La traduction IA n’est pas connectée. Les textes doivent être saisis manuellement.",languagesDesc:"Paramètres de langue partagés avec l’accueil et les futurs bots.",lawsDesc:"Brouillons et versions publiées, par royaume et alliance.",addLaw:"+ Nouvelle règle",publicRuleNoticeTitle:"Publication",publicRuleNotice:"Les règles ici ne remplacent pas les lois NAP existantes. Les lois du royaume nécessitent une validation commune.",eventsDesc:"Les heures sont stockées en UTC et affichées dans le fuseau local.",addEvent:"+ Ajouter événement",eventSyncStatus:"Diffusion",eventSyncNotice:"Les dates publiques peuvent être consultées sur le site. Les rappels Discord exigent le futur bot.",settingsDesc:"Paramètres, capacité, autorisations et modules.",allianceConfig:"Paramètres de l’alliance",allianceName:"Nom de l’alliance",capacity:"Capacité maximale",logoUrl:"URL du logo",discordGuild:"ID du serveur Discord",adsEnable:"Prévoir les publicités (inactives)",permissions:"Autorisations",rolesFuture:"Les droits R4 seront configurables. Les invitations sécurisées suivront. Les comptes NAP ne deviennent pas R4 automatiquement.",subscription:"Abonnement",notConfigured:"Non configuré",loginTitle:"Accès à la direction",loginText:"Données privées. Connectez-vous avec un compte autorisé.",password:"Mot de passe",login:"Se connecter",loginNote:"Aucun compte n’est créé automatiquement.",cancel:"Annuler",edit:"Modifier",editPlayer:"Gérer le membre",editTransfer:"Modifier le transfert",newTransfer:"Planifier transfert",newLaw:"Rédiger la loi",editLaw:"Modifier la loi",newEvent:"Créer événement",editEvent:"Modifier événement",noPlayers:"Aucun joueur trouvé.",noTransfers:"Aucun transfert prévu.",noEvents:"Aucun événement enregistré.",noLaws:"Aucune loi AllianceOS.",noUpcoming:"Aucun événement publié à venir.",loading:"Chargement…",saved:"Modifications enregistrées.",permissionDenied:"Vous n’avez pas les droits nécessaires.",sessionExpired:"Session expirée. Reconnectez-vous.",genericError:"Action impossible.",locked:"Vous n’avez pas accès à NRW AllianceOS.",loginFailed:"Connexion impossible. Vérifiez les identifiants.",playerId:"ID joueur",playerName:"Pseudo",originKingdom:"Royaume d’origine",previousAlliance:"Alliance précédente",targetAlliance:"Alliance cible",power:"Puissance (facultatif)",from:"Début",to:"Fin",notes:"Notes internes",directionIncoming:"Entrant",directionOutgoing:"Sortant",waitlist:"Attente",completed:"Terminé",cancelled:"Annulé",allowShare:"Autoriser explicitement le partage (fonction future)",scope:"Type de règle",kingdom:"Loi du royaume",allianceLaw:"Règle de l’alliance",lawNumber:"Numéro",draft:"Brouillon",published:"Publié",lawTitle:"Titre",lawText:"Texte",version:"Version",eventTitle:"Nom d’événement",eventText:"Consignes",startTime:"Début (heure locale)",endTime:"Fin (heure locale)",requirements:"Conditions",template:"Modèle Kingshot",reminders:"Rappels (minutes ; futur bot)",utcNote:"Conversion automatique en UTC.",saveSuccess:"Enregistré.",profileLink:"Optimiseur Ours",noPower:"Indisponible",freeSeats:"Places libres",unprotected:"Privé",r4Access:"R4 autorisé",r5Access:"R5",invalidEmail:"Saisissez une adresse e-mail valide."},
es:{workplace:"CENTRO DE LIDERAZGO",overview:"Resumen",roster:"Gestión de jugadores",transfers:"Plan de transferencias",languages:"Idiomas",laws:"Gestión de leyes",events:"Planificación de eventos",settings:"Alianza y permisos",private:"Acceso protegido",scopeNotice:"Solo datos de tu alianza.",backHome:"← Volver al inicio",logout:"Cerrar sesión",securePilot:"ALLIANCEOS · PILOTO SEGURO",leadership:"Tu alianza.",underControl:"Todo controlado.",heroText:"Gestiona jugadores, transferencias, normas y eventos en un solo lugar.",activePlayers:"Jugadores activos",fromRoster:"Del registro de alianza",incoming:"Transferencias entrantes",plannedAndConfirmed:"Planeadas / confirmadas",seatsAvailable:"Plazas libres",afterReservations:"Tras reservas confirmadas",publishedEvents:"Eventos publicados",fromPlanner:"Del calendario",transferHub:"Gestor de transferencias",transferHubDesc:"Acompaña a los candidatos",open:"Abrir →",nextEvents:"Próximos eventos",nextEventsDesc:"Planifica una vez, actualiza en todas partes",pilotLabel:"Estado piloto",pilotInfo:"Los jugadores se leen del registro existente. El bot, traducciones IA, suscripciones e invitaciones Discord aún no están conectados.",rosterEyebrow:"MIEMBROS",rosterDesc:"Solo tu alianza. Últimos datos disponibles.",searchPlayers:"Buscar por nombre o ID …",allStatuses:"Todos los estados",active:"Activo",planned:"Planeado",left:"Salió",sortName:"Nombre A–Z",sortRank:"Rango descendente",sortId:"ID jugador",player:"Jugador",rank:"Rango",strength:"Poder",language:"Idioma",memberStatus:"Miembro",addTransfer:"+ Planear transferencia",transfersDesc:"Solicitudes, reservas, espera y transferencias finalizadas.",interested:"Interesados",shortlisted:"Preseleccionados",confirmed:"Confirmados",waiting:"Lista de espera",allTransfers:"Todas",outgoing:"Transferencias salientes",direction:"Dirección",origin:"Origen",destination:"Destino",window:"Periodo",status:"Estado",supportedLanguages:"Idiomas admitidos",languageAccess:"R5 y R4 autorizados pueden editar idiomas.",defaultLang:"Idioma predeterminado",save:"Guardar",translationFlow:"Flujo de traducción",translationStep1:"Escribir el original",translationStep2:"Añadir y revisar traducciones",translationStep3:"Publicar juntas",translationWarning:"La traducción IA aún no está conectada. Introduce los textos manualmente.",languagesDesc:"Idiomas para la bienvenida, liderazgo y futuros bots.",lawsDesc:"Borradores y versiones publicadas para reino y alianza.",addLaw:"+ Nueva norma",publicRuleNoticeTitle:"Publicación",publicRuleNotice:"Las leyes aquí no sustituyen a las leyes NAP vigentes. Las leyes del reino requieren aprobación conjunta.",eventsDesc:"Las horas se almacenan en UTC y se muestran en horario local.",addEvent:"+ Planear evento",eventSyncStatus:"Distribución",eventSyncNotice:"Las fechas públicas pueden consultarse desde la web. Los recordatorios Discord requieren el futuro bot.",settingsDesc:"Datos, capacidad, permisos y módulos.",allianceConfig:"Configuración de alianza",allianceName:"Nombre de alianza",capacity:"Máximo de miembros",logoUrl:"URL del logo",discordGuild:"ID del servidor Discord",adsEnable:"Preparar anuncios (inactivos)",permissions:"Permisos",rolesFuture:"Los permisos R4 se podrán asignar. Las invitaciones seguras serán el siguiente paso. Las cuentas NAP no se convierten automáticamente en R4.",subscription:"Suscripción",notConfigured:"No configurado",loginTitle:"Acceso al liderazgo",loginText:"Los datos internos son privados. Accede con una cuenta autorizada.",password:"Contraseña",login:"Acceder",loginNote:"No se crean cuentas automáticamente.",cancel:"Cancelar",edit:"Editar",editPlayer:"Gestionar miembro",editTransfer:"Editar transferencia",newTransfer:"Redactar transferencia",newLaw:"Crear norma",editLaw:"Editar norma",newEvent:"Crear evento",editEvent:"Editar evento",noPlayers:"No se encontraron jugadores.",noTransfers:"No hay transferencias planeadas.",noEvents:"Aún no hay eventos.",noLaws:"No hay normas AllianceOS.",noUpcoming:"No hay próximos eventos publicados.",loading:"Cargando…",saved:"Cambios guardados.",permissionDenied:"No tienes permiso para esta función.",sessionExpired:"Sesión caducada. Inicia sesión de nuevo.",genericError:"No se pudo completar la acción.",locked:"No tienes acceso a NRW AllianceOS.",loginFailed:"Error de acceso. Comprueba tus datos.",playerId:"ID de jugador",playerName:"Nombre en el juego",originKingdom:"Reino de origen",previousAlliance:"Alianza anterior",targetAlliance:"Alianza destino",power:"Poder (opcional)",from:"Inicio",to:"Final",notes:"Notas internas",directionIncoming:"Entrante",directionOutgoing:"Saliente",waitlist:"En espera",completed:"Completado",cancelled:"Cancelado",allowShare:"Autorizar compartir expresamente (próxima función)",scope:"Tipo de regla",kingdom:"Ley del reino",allianceLaw:"Regla de alianza",lawNumber:"Número",draft:"Borrador",published:"Publicado",lawTitle:"Título",lawText:"Texto",version:"Versión",eventTitle:"Nombre del evento",eventText:"Instrucciones",startTime:"Inicio (hora local)",endTime:"Fin (hora local)",requirements:"Condiciones",template:"Plantilla Kingshot",reminders:"Avisos (minutos; futuro bot)",utcNote:"Se convierte automáticamente a UTC.",saveSuccess:"Guardado.",profileLink:"Optimizador de oso",noPower:"No disponible",freeSeats:"Plazas libres",unprotected:"Privado",r4Access:"R4 autorizado",r5Access:"R5",invalidEmail:"Introduce un correo válido."}
};
const staffExtra={
de:{sortPower:"Spielerstärke ↓",r4Email:"E-Mail eines bestehenden Benutzerkontos",r4Enabled:"R4-Zugang aktiviert",saveR4:"R4-Freigabe speichern",r4Saved:"R4-Berechtigung gespeichert.",r4NotFound:"Dieses Konto existiert noch nicht. Aktuell können nur bestehende Benutzer freigeschaltet werden.",staffList:"Freigeschaltete Konten",r4Disabled:"deaktiviert"},
en:{sortPower:"Power (high to low)",r4Email:"Email of an existing user account",r4Enabled:"Enable R4 access",saveR4:"Save R4 permissions",r4Saved:"R4 permissions saved.",r4NotFound:"Account not found. Only existing users can be authorized at this stage.",staffList:"Authorized accounts",r4Disabled:"disabled"},
fr:{sortPower:"Puissance décroissante",r4Email:"Adresse e-mail d’un compte existant",r4Enabled:"Activer l’accès R4",saveR4:"Enregistrer les droits R4",r4Saved:"Autorisations R4 enregistrées.",r4NotFound:"Compte introuvable. Seuls les comptes existants peuvent être autorisés pour l’instant.",staffList:"Comptes autorisés",r4Disabled:"désactivé"},
es:{sortPower:"Poder descendente",r4Email:"Correo de una cuenta existente",r4Enabled:"Activar acceso R4",saveR4:"Guardar permisos R4",r4Saved:"Permisos R4 guardados.",r4NotFound:"Cuenta no encontrada. Solo se pueden autorizar cuentas existentes.",staffList:"Cuentas autorizadas",r4Disabled:"desactivado"}
};
const phase1Labels={
 de:{spokenSeparateTitle:"Spielersprachen separat verwalten",spokenSeparateText:"Gesprochene Sprachen gehören in die einzelne Spielerakte. Hier legst du nur die verfügbaren Seitensprachen und die Standardsprache fest.",toDossiers:"→ Zu den Spielerakten",pageLanguageNote:"Die Einstellungen werden gespeichert. Die öffentlichen Seiten nutzen vorerst weiterhin ihre vorhandene Sprachwahl.",invited:"Eingeladen",pilotFree:"NRW bleibt kostenlos und werbefrei.",dossier:"Spielerakte",joined:"Beitrittsdatum",responsibilities:"Aufgaben / Zuständigkeiten",spoken:"Gesprochene Sprachen",otherSpoken:"Weitere Sprachen (Komma-getrennt, z. B. fa)",serverTransfer:"Königreichtransfer planen",serverMoves:"Allianzwechsel in 1044 (bestehendes Protokoll)",internalHistoryNote:"Unveränderte Historie des vorhandenen Trackers, nur Wechsel mit NRW-Beteiligung.",noMoves:"Keine Wechsel erfasst",worldTransfers:"Königreichtransfers",noHistory:"Keine Transferhistorie",targetKingdom:"Zielkönigreich",priority:"Priorität",invitation:"Einladungsart",high:"Hoch",normal:"Normal",low:"Niedrig",inviteOpen:"Nicht vergeben",inviteNormal:"Normale Einladung",inviteSpecial:"Spezialeinladung",externalNote:"Server-zu-Server-Transfers: Eingehend immer nach #1044, ausgehend immer aus #1044. Interne 1044-Allianzwechsel werden separat angezeigt.",sourceNote:"Stammdaten bleiben im vorhandenen Register. Hier werden nur ergänzende Verwaltungsdaten gespeichert.",arrived:"Ankunft in NRW erkannt",notArrived:"Ankunft nicht im Register bestätigt"},
 en:{spokenSeparateTitle:"Player languages are separate",spokenSeparateText:"Spoken languages are managed in each player dossier. Here you only configure site languages and the default.",toDossiers:"→ Open player dossiers",pageLanguageNote:"Settings are saved; public pages still use their existing language switching until integrated.",invited:"Invited",pilotFree:"NRW stays free and ad-free.",dossier:"Player dossier",joined:"Joined on",responsibilities:"Responsibilities",spoken:"Spoken languages",otherSpoken:"Other languages (comma-separated)",serverTransfer:"Plan kingdom transfer",serverMoves:"Alliance moves in 1044 (existing log)",internalHistoryNote:"Read-only historical changes involving NRW.",noMoves:"No moves recorded",worldTransfers:"Kingdom transfers",noHistory:"No transfer history",targetKingdom:"Destination kingdom",priority:"Priority",invitation:"Invitation type",high:"High",normal:"Normal",low:"Low",inviteOpen:"Not assigned",inviteNormal:"Ordinary invitation",inviteSpecial:"Special invitation",externalNote:"Kingdom transfers only: incoming goes to #1044, outgoing starts in #1044. Internal alliance moves are listed separately.",sourceNote:"Core data stays in the existing roster. Only management additions are saved here.",arrived:"Arrival in NRW detected",notArrived:"Arrival not observed in roster"},
 fr:{spokenSeparateTitle:"Les langues des joueurs sont distinctes",spokenSeparateText:"Les langues parlées se renseignent dans la fiche joueur. Ici, seules les langues du site et la langue par défaut sont configurées.",toDossiers:"→ Ouvrir les fiches",pageLanguageNote:"Paramètres enregistrés ; les pages publiques utilisent encore leur sélecteur actuel.",invited:"Invité",pilotFree:"NRW reste gratuit et sans publicité.",dossier:"Fiche joueur",joined:"Date d’arrivée",responsibilities:"Responsabilités",spoken:"Langues parlées",otherSpoken:"Autres langues (séparées par virgules)",serverTransfer:"Planifier transfert de royaume",serverMoves:"Mouvements d’alliance en 1044 (registre)",internalHistoryNote:"Historique en lecture seule impliquant NRW.",noMoves:"Aucun mouvement",worldTransfers:"Transferts de royaume",noHistory:"Aucun historique",targetKingdom:"Royaume de destination",priority:"Priorité",invitation:"Type d’invitation",high:"Haute",normal:"Normale",low:"Basse",inviteOpen:"À définir",inviteNormal:"Invitation normale",inviteSpecial:"Invitation spéciale",externalNote:"Entre royaumes uniquement : entrée vers #1044, sortie depuis #1044. Mouvements internes séparés.",sourceNote:"Données de base conservées dans le registre existant.",arrived:"Arrivée détectée",notArrived:"Arrivée non confirmée"},
 es:{spokenSeparateTitle:"Los idiomas del jugador van por separado",spokenSeparateText:"Los idiomas hablados se editan en cada ficha. Aquí solo se configuran los idiomas y el idioma predeterminado del sitio.",toDossiers:"→ Abrir fichas",pageLanguageNote:"Los ajustes se guardan; las páginas públicas siguen usando su selector actual.",invited:"Invitado",pilotFree:"NRW seguirá siendo gratuito y sin anuncios.",dossier:"Ficha del jugador",joined:"Fecha de ingreso",responsibilities:"Responsabilidades",spoken:"Idiomas hablados",otherSpoken:"Otros idiomas (separados por comas)",serverTransfer:"Planear transferencia",serverMoves:"Cambios internos en 1044 (registro)",internalHistoryNote:"Historial de solo lectura con NRW.",noMoves:"Sin cambios",worldTransfers:"Transferencias de reino",noHistory:"Sin historial",targetKingdom:"Reino de destino",priority:"Prioridad",invitation:"Tipo de invitación",high:"Alta",normal:"Normal",low:"Baja",inviteOpen:"Sin asignar",inviteNormal:"Invitación normal",inviteSpecial:"Invitación especial",externalNote:"Entre reinos: entradas a #1044, salidas desde #1044. Cambios internos separados.",sourceNote:"Datos principales conservados en el registro existente.",arrived:"Llegada detectada",notArrived:"Llegada no confirmada"}
};
let lang=LANGS.includes(localStorage.getItem("nrw_page_lang"))?localStorage.getItem("nrw_page_lang"):"de";
let state=null, tab="overview", editing=null;
const eventLabels={
 de:{leadershipGuidance:"NRW-Anweisungen im Player Dashboard",guidanceInfo:"Veröffentlicht ergänzt dieser Hinweis die vorhandenen Eventinformationen am ausgewählten Tag. Die Original-Guides bleiben unverändert.",saveGuidance:"Hinweis speichern / veröffentlichen",guidancePublished:"Veröffentlicht: Im Player Dashboard sichtbar.",guidanceDraft:"Entwurf: Nur für die Leitung sichtbar.",guidanceNotSupported:"Nur bestehende Kalenderevents können im Dashboard überschrieben werden.",canonicalEvents:"Bestehende Events & Guides",canonicalNote:"Direkt aus dem Player Dashboard – keine doppelte Pflege.",eventSearch:"Event / Guide suchen …",eventUpcoming:"Aktuell / nächste 8 Wochen",eventPast:"Vergangene Termine",eventGuideCatalog:"Alle Event-Guides",eventAll:"Alle Termine",customEvents:"Weitere Allianztermine",customEventsNote:"Zusätzliche, separat bearbeitbare Sondertermine.",libraryDay:"Eventtag",ingameChat:"Allianzchat · maximal 512 Zeichen",ingameNotice:"Allianznotiz · maximal 300 Zeichen",copyChat:"📋 Chat kopieren",copyNote:"📋 Notiz kopieren",saveMessages:"Nachrichten für diesen Tag speichern",libraryLoadError:"Eventquellen nicht verfügbar.",manualSource:"Eingetragener Termin",rhythmSource:"28-Tage-Rotation",customSource:"Allianztermin",guideSource:"Event-Guide",catalogSource:"Event-Katalog",guideOnly:"Nachschlagewerk",notConfirmed:"Voraussichtlich",showEvent:"Öffnen / Kopieren",dailyPoints:"Punkte / Ziele",dailySteps:"Tagesaufgaben",eventNote:"Hinweis",eventPrepare:"Vorbereitung",dailyDetails:"Weitere Details",eventTips:"NRW-Tipps",guideObjective:"Eventziel",guideNrwRule:"NRW-Regeln",eventLimits:"Grenzwert der Quelle",sourceLink:"Originalquelle",guideConnected:"Verknüpfter Guide",rawSource:"Vollständige Quelldaten",rawDaily:"Vollständige Tagesinformationen",customTextSaved:"Eigene Nachricht gespeichert – pro Tag und Sprache.",generatedFromGuide:"Automatisch aus den vorhandenen Hinweisen erstellt. Vor dem Versenden überprüfen.",invalidMessage:"Text leer oder Zeichenlimit überschritten.",copiedText:"Text kopiert.",copySelect:"Text markiert. Bitte Strg+C drücken."},
 en:{leadershipGuidance:"NRW instructions in Player Dashboard",guidanceInfo:"Published notices supplement the existing event details for this day. The original guides remain unchanged.",saveGuidance:"Save / Publish instruction",guidancePublished:"Published: Visible in Player Dashboard.",guidanceDraft:"Draft: Visible only to leadership.",guidanceNotSupported:"Only original scheduled events support Dashboard guidance.",canonicalEvents:"Existing events & guides",canonicalNote:"Directly from Player Dashboard, no duplicated source data.",eventSearch:"Search event / guide …",eventUpcoming:"Current / next 8 weeks",eventPast:"Past events",eventGuideCatalog:"All event guides",eventAll:"All dates",customEvents:"Additional alliance dates",customEventsNote:"Separate, editable special dates.",libraryDay:"Event day",ingameChat:"Alliance chat · 512 characters max",ingameNotice:"Alliance note · 300 characters max",copyChat:"📋 Copy chat",copyNote:"📋 Copy note",saveMessages:"Save messages for this day",libraryLoadError:"Event sources unavailable.",manualSource:"Scheduled entry",rhythmSource:"28-day cycle",customSource:"Alliance date",guideSource:"Event guide",catalogSource:"Event catalog",guideOnly:"Reference",notConfirmed:"Predicted",showEvent:"Open / Copy",dailyPoints:"Points / Targets",dailySteps:"Daily tasks",eventNote:"Note",eventPrepare:"Preparation",dailyDetails:"More details",eventTips:"NRW tips",guideObjective:"Event objective",guideNrwRule:"NRW rules",eventLimits:"Source limit",sourceLink:"Original source",guideConnected:"Linked guide",rawSource:"Full source data",rawDaily:"Full day data",customTextSaved:"Custom message saved for day and language.",generatedFromGuide:"Auto-generated from existing guidance. Review before sending.",invalidMessage:"Empty text or character limit exceeded.",copiedText:"Text copied.",copySelect:"Text selected. Please press Ctrl+C."},
 fr:{leadershipGuidance:"Consignes NRW dans le Player Dashboard",guidanceInfo:"Les notes publiées complètent le guide du jour, sans modifier la source.",saveGuidance:"Enregistrer / Publier",guidancePublished:"Publié : visible dans le tableau de bord.",guidanceDraft:"Brouillon : réservé à la direction.",guidanceNotSupported:"Uniquement pour les événements du calendrier existant.",canonicalEvents:"Événements et guides existants",canonicalNote:"Sources existantes du Player Dashboard.",eventSearch:"Rechercher un événement …",eventUpcoming:"Actuels / 8 semaines",eventPast:"Événements passés",eventGuideCatalog:"Tous les guides",eventAll:"Toutes les dates",customEvents:"Dates supplémentaires",customEventsNote:"Dates spéciales modifiables.",libraryDay:"Jour",ingameChat:"Chat alliance · 512 caractères",ingameNotice:"Note alliance · 300 caractères",copyChat:"📋 Copier chat",copyNote:"📋 Copier note",saveMessages:"Enregistrer pour ce jour",manualSource:"Date enregistrée",rhythmSource:"Cycle de 28 jours",customSource:"Date de l’alliance",guideSource:"Guide événement",catalogSource:"Catalogue",guideOnly:"Référence",notConfirmed:"Prévision",showEvent:"Ouvrir / Copier",dailySteps:"Tâches du jour",dailyPoints:"Points / Objectifs",rawSource:"Toutes les données",rawDaily:"Données du jour",copiedText:"Texte copié."},
 es:{leadershipGuidance:"Instrucciones NRW en Player Dashboard",guidanceInfo:"Las notas publicadas complementan la guía del día sin cambiarla.",saveGuidance:"Guardar / Publicar",guidancePublished:"Publicado: visible en el panel.",guidanceDraft:"Borrador: solo dirección.",guidanceNotSupported:"Solo eventos originales del calendario.",canonicalEvents:"Eventos y guías existentes",canonicalNote:"Fuentes existentes del Player Dashboard.",eventSearch:"Buscar evento …",eventUpcoming:"Actual / 8 semanas",eventPast:"Eventos pasados",eventGuideCatalog:"Todas las guías",eventAll:"Todas las fechas",customEvents:"Fechas adicionales",customEventsNote:"Fechas especiales editables.",libraryDay:"Día",ingameChat:"Chat · 512 caracteres",ingameNotice:"Nota · 300 caracteres",copyChat:"📋 Copiar chat",copyNote:"📋 Copiar nota",saveMessages:"Guardar mensajes",manualSource:"Fecha registrada",rhythmSource:"Ciclo de 28 días",customSource:"Fecha de alianza",guideSource:"Guía de evento",catalogSource:"Catálogo",guideOnly:"Referencia",notConfirmed:"Previsto",showEvent:"Abrir / Copiar",dailySteps:"Tareas del día",dailyPoints:"Puntos / Objetivos",rawSource:"Todos los datos",rawDaily:"Datos del día",copiedText:"Texto copiado."}
};
const groupUI={
 de:{nextInDays:"Nächstes Mal in {n} Tagen",nextTomorrow:"Nächstes Mal morgen",nextToday:"Findet heute statt",nextUnknown:"Nächster Termin noch nicht bekannt",publishedEvents:"Eventtypen",fromPlanner:"NRW-Eventkalender",canonicalEvents:"Events – einmalig verwalten",canonicalNote:"Jedes Event nur einmal. Turnus und Einträge pro Tag darunter.",eventAll:"Alle Events",eventUpcoming:"Demnächst",eventGuideCatalog:"Mit Guide",cycleHeading:"Turnus & Eventtage",cycleHint:"Beispiel Allianzgemenge: 6 Tage mit Einträgen, 7 Kalendertage, alle 4 Wochen.",cycleAnchor:"Beginn eines Eventdurchlaufs (UTC)",cycleEvery:"Wiederholen alle (Tage)",cycleLength:"Kalendertage insgesamt",cyclePhases:"Tage mit einzelnen Einträgen",cycleSave:"Turnus speichern",phaseSelect:"Eventtag auswählen",phaseInstructions:"Anweisungen für diesen Tag (bei jeder Wiederholung)",phaseSave:"Tageseinträge speichern",oneoffTitle:"Einzeltermin / Original-Guide und Datumshinweise",phaseN:"Tag {n}",daysCount:"{n} Tage",phaseEmpty:"Noch keine Tagesnotizen",cycleInfo:"Alle Tage an einer Stelle",cycleSettings:"Turnus / Tage bearbeiten",noCycle:"Turnus noch nicht gespeichert",cycleUnconfigured:"Erst Turnus speichern",everyWeek:"Jede Woche",everyTwoWeeks:"Alle 2 Wochen",everyFourWeeks:"Alle 4 Wochen",everyDay:"Täglich",everyN:"Alle {n} Tage",nextOccurrence:"Nächster Beginn",existingSources:"alte Termine",oneEvent:"WIEDERKEHRENDES EVENT",saveCycleFirst:"Zuerst den Turnus speichern, dann die einzelnen Tage bearbeiten.",templateDraft:"Tagesvorlage als Entwurf / unveränderte Quelle.",templatePublished:"Tagesvorlage veröffentlicht – gilt bei jeder Wiederholung.",cycleInvalid:"Ungültiger Turnus: Tage mit Einträgen ≤ Kalendertage ≤ Wiederholung."},
 en:{nextInDays:"Next time in {n} days",nextTomorrow:"Next time tomorrow",nextToday:"Happening today",nextUnknown:"Next date not yet known",publishedEvents:"Event types",fromPlanner:"NRW calendar",canonicalEvents:"Manage each event once",canonicalNote:"One event with its repeat cycle and daily entries.",eventAll:"All events",eventUpcoming:"Upcoming",eventGuideCatalog:"With guide",cycleHeading:"Repeat cycle & event days",cycleHint:"Alliance Brawl: six scoring days, seven calendar days, every four weeks.",cycleAnchor:"Start of one occurrence (UTC)",cycleEvery:"Repeat every (days)",cycleLength:"Total calendar days",cyclePhases:"Days with editable entries",cycleSave:"Save repeat cycle",phaseSelect:"Choose event day",phaseInstructions:"Instructions for this day (every occurrence)",phaseSave:"Save daily entries",oneoffTitle:"Single occurrence / Original guide and date-specific notes",phaseN:"Day {n}",daysCount:"{n} days",phaseEmpty:"No daily notes yet",cycleInfo:"All days in one place",cycleSettings:"Edit cycle / days",noCycle:"Repeat cycle not configured",cycleUnconfigured:"Save cycle first",everyWeek:"Weekly",everyTwoWeeks:"Every two weeks",everyFourWeeks:"Every four weeks",everyDay:"Daily",everyN:"Every {n} days",nextOccurrence:"Next start",existingSources:"previous dates",oneEvent:"RECURRING EVENT",saveCycleFirst:"Save the repeat cycle before editing daily entries.",templateDraft:"Draft daily template / original source.",templatePublished:"Published template applies every occurrence.",cycleInvalid:"Invalid cycle: editable days ≤ calendar days ≤ repeat interval."},
 fr:{nextInDays:"Prochaine fois dans {n} jours",nextTomorrow:"Prochaine fois demain",nextToday:"Aujourd’hui",nextUnknown:"Prochaine date inconnue",publishedEvents:"Types d’événements",fromPlanner:"Calendrier NRW",canonicalEvents:"Un événement, tous les jours",canonicalNote:"Répétition et consignes par jour au même endroit.",eventAll:"Tous les événements",eventUpcoming:"À venir",eventGuideCatalog:"Avec guide",cycleHeading:"Répétition et jours",cycleHint:"Alliance Brawl : 6 jours de points, 7 jours calendaires, toutes les 4 semaines.",cycleAnchor:"Début d’un cycle (UTC)",cycleEvery:"Répéter tous les (jours)",cycleLength:"Jours calendaires",cyclePhases:"Jours modifiables",cycleSave:"Enregistrer le cycle",phaseSelect:"Choisir le jour",phaseInstructions:"Consignes de ce jour, chaque cycle",phaseSave:"Enregistrer les consignes",oneoffTitle:"Date unique / Guide d’origine",phaseN:"Jour {n}",daysCount:"{n} jours",phaseEmpty:"Pas encore de note",cycleInfo:"Tous les jours regroupés",cycleSettings:"Modifier le cycle / les jours",noCycle:"Cycle non défini",cycleUnconfigured:"Enregistrer le cycle d’abord",everyWeek:"Chaque semaine",everyTwoWeeks:"Toutes les 2 semaines",everyFourWeeks:"Toutes les 4 semaines",everyDay:"Chaque jour",everyN:"Tous les {n} jours",nextOccurrence:"Prochain début",existingSources:"anciens termes",oneEvent:"ÉVÉNEMENT RÉCURRENT",saveCycleFirst:"Enregistrer le cycle avant les consignes.",templateDraft:"Consignes en brouillon.",templatePublished:"Consignes publiées, réutilisées à chaque cycle.",cycleInvalid:"Jours modifiables ≤ durée ≤ fréquence."},
 es:{nextInDays:"Próxima vez en {n} días",nextTomorrow:"Próxima vez mañana",nextToday:"Se celebra hoy",nextUnknown:"Próxima fecha desconocida",publishedEvents:"Tipos de evento",fromPlanner:"Calendario NRW",canonicalEvents:"Cada evento una sola vez",canonicalNote:"Repetición e instrucciones por día en un solo lugar.",eventAll:"Todos los eventos",eventUpcoming:"Próximos",eventGuideCatalog:"Con guía",cycleHeading:"Repetición y días",cycleHint:"Alliance Brawl: 6 días de puntos, 7 días de calendario, cada 4 semanas.",cycleAnchor:"Inicio del ciclo (UTC)",cycleEvery:"Repetir cada (días)",cycleLength:"Días de calendario",cyclePhases:"Días editables",cycleSave:"Guardar repetición",phaseSelect:"Elegir día",phaseInstructions:"Instrucciones para este día en cada ciclo",phaseSave:"Guardar entradas del día",oneoffTitle:"Fecha única / Guía original",phaseN:"Día {n}",daysCount:"{n} días",phaseEmpty:"Sin notas",cycleInfo:"Todos los días juntos",cycleSettings:"Editar repetición / días",noCycle:"Repetición no configurada",cycleUnconfigured:"Guardar repetición primero",everyWeek:"Cada semana",everyTwoWeeks:"Cada 2 semanas",everyFourWeeks:"Cada 4 semanas",everyDay:"Diario",everyN:"Cada {n} días",nextOccurrence:"Próximo inicio",existingSources:"fechas anteriores",oneEvent:"EVENTO RECURRENTE",saveCycleFirst:"Guarda la repetición antes de editar cada día.",templateDraft:"Plantilla en borrador.",templatePublished:"Plantilla publicada en cada repetición.",cycleInvalid:"Días editables ≤ duración ≤ intervalo."}
};
const opsUI={
 de:{changePassword:"Passwort ändern",passwordSetupHint:"Eingeladene R4 legen hier nach dem Anmeldelink ein persönliches Passwort fest.",newPassword:"Neues Passwort (mindestens 10 Zeichen)",repeatPassword:"Passwort wiederholen",savePassword:"Passwort speichern",passwordMismatch:"Passwörter stimmen nicht überein oder sind zu kurz.",passwordSaved:"Passwort wurde geändert.",transferWindowsTitle:"Königreich-Transferphasen",transferWindowsInfo:"Zeitfenster, Einladungen und freie Plätze verwalten.",newTransferWindow:"+ Transferphase",editTransferWindow:"Transferphase bearbeiten",windowLabel:"Bezeichnung",startDate:"Beginn",endDate:"Ende",ordinarySlots:"Normale Einladungsplätze",specialSlots:"Spezial-Einladungsplätze",phaseStatusLabel:"Phase",phase_planning:"In Planung",phase_open:"Offen",phase_closed:"Geschlossen",openPhase:"Offen",closedPhase:"Geschlossen",planning:"In Planung",unknownSlotsInfo:"Leeres Kapazitätsfeld bedeutet unbekannt, nicht unbegrenzt.",noTransferWindows:"Noch keine Transferphasen angelegt.",transferWindow:"Transferphase",unassignedWindow:"Ohne Transferphase",allWindows:"Alle Transferphasen",invitationStatus:"Einladungsstatus",inviteNotSent:"Noch nicht gesendet",inviteSent:"Gesendet",inviteAccepted:"Angenommen",inviteDeclined:"Abgelehnt",confirmObservedArrival:"Ankunft bestätigen (nur wenn Spieler aktiv im NRW-Register)",lawsLiveInfo:"Veröffentlichte Allianzregeln werden automatisch auf der Laws-Seite angezeigt. Königreichsgesetze bleiben geschützt.",viewPublicLaws:"↗ Öffentliche Laws-Seite",lawHistory:"Versionsverlauf",restoreAsDraft:"Als Entwurf wiederherstellen",restoreConfirm:"Diese Fassung als neuen, unveröffentlichten Entwurf übernehmen?",noVersions:"Noch keine Revision vorhanden",loading:"Wird geladen …",r4AccessInfo:"R4 sieht und bearbeitet ausschließlich freigeschaltete Module. Gesperrte Zugänge bleiben gesperrt.",accessAudit:"Letzte Änderungen / Protokoll",noAudit:"Noch keine Änderungen.",inviteR4:"✉ Neuen R4 per E-Mail einladen",inviteConfirm:"Eine R4-Einladung an {email} senden? Die ausgewählten Rechte werden vergeben.",invitedUser:"R4-Einladung ausgelöst. Zustellung hängt von Supabase-E-Mail-Konfiguration ab.",missingStaffData:"Bitte E-Mail und mindestens eine Berechtigung auswählen."},
 en:{changePassword:"Change password",passwordSetupHint:"After using an invitation link, new R4 users can set their password here.",newPassword:"New password (at least 10 characters)",repeatPassword:"Repeat password",savePassword:"Save password",passwordMismatch:"Passwords don't match or are too short.",passwordSaved:"Password updated.",transferWindowsTitle:"Kingdom transfer windows",transferWindowsInfo:"Plan dates, invitations and available seats.",newTransferWindow:"+ Transfer window",editTransferWindow:"Edit transfer window",windowLabel:"Label",startDate:"Start",endDate:"End",ordinarySlots:"Ordinary invitations",specialSlots:"Special invitations",phaseStatusLabel:"Phase",phase_planning:"Planning",phase_open:"Open",phase_closed:"Closed",openPhase:"Open",closedPhase:"Closed",planning:"Planning",unknownSlotsInfo:"Blank capacity means unknown, not unlimited.",noTransferWindows:"No transfer windows yet.",transferWindow:"Transfer window",unassignedWindow:"Unassigned",allWindows:"All transfer windows",invitationStatus:"Invitation status",inviteNotSent:"Not sent",inviteSent:"Sent",inviteAccepted:"Accepted",inviteDeclined:"Declined",confirmObservedArrival:"Confirm arrival (requires active NRW membership)",lawsLiveInfo:"Published alliance laws appear on the Laws page. Kingdom laws stay protected.",viewPublicLaws:"↗ Public Laws page",lawHistory:"Version history",restoreAsDraft:"Restore as draft",restoreConfirm:"Restore this version as a new unpublished draft?",noVersions:"No revisions yet",loading:"Loading …",r4AccessInfo:"R4 sees and edits only allowed modules; disabled accounts remain blocked.",accessAudit:"Recent changes / access audit",noAudit:"No changes.",inviteR4:"✉ Invite new R4 by email",inviteConfirm:"Send R4 invite to {email} with the selected permissions?",invitedUser:"R4 invitation requested. Delivery depends on Supabase email configuration.",missingStaffData:"Enter an email and select at least one permission."},
 fr:{changePassword:"Changer le mot de passe",passwordSetupHint:"Après invitation, les nouveaux R4 définissent ici leur mot de passe.",newPassword:"Nouveau mot de passe (10 caractères min.)",repeatPassword:"Répéter",savePassword:"Enregistrer",passwordMismatch:"Mots de passe différents ou trop courts.",passwordSaved:"Mot de passe modifié.",transferWindowsTitle:"Phases de transfert inter-royaumes",transferWindowsInfo:"Gérer les dates, invitations et places disponibles.",newTransferWindow:"+ Phase",editTransferWindow:"Modifier la phase",windowLabel:"Libellé",startDate:"Début",endDate:"Fin",ordinarySlots:"Invitations normales",specialSlots:"Invitations spéciales",phaseStatusLabel:"Phase",phase_planning:"Préparation",phase_open:"Ouvert",phase_closed:"Fermé",openPhase:"Ouvert",closedPhase:"Fermé",planning:"Préparation",unknownSlotsInfo:"Champ vide = capacité inconnue.",noTransferWindows:"Aucune phase créée.",transferWindow:"Phase de transfert",unassignedWindow:"Non attribué",allWindows:"Toutes les phases",invitationStatus:"Statut invitation",inviteNotSent:"Non envoyée",inviteSent:"Envoyée",inviteAccepted:"Acceptée",inviteDeclined:"Refusée",confirmObservedArrival:"Confirmer l'arrivée (joueur actif dans NRW)",lawsLiveInfo:"Les règles d'alliance publiées apparaissent sur la page Laws. Les lois du royaume sont protégées.",viewPublicLaws:"↗ Règles publiques",lawHistory:"Historique des versions",restoreAsDraft:"Restaurer en brouillon",restoreConfirm:"Restaurer cette version comme nouveau brouillon ?",noVersions:"Aucune version",loading:"Chargement …",r4AccessInfo:"R4 accède uniquement aux modules autorisés.",accessAudit:"Historique des modifications",noAudit:"Aucune modification.",inviteR4:"✉ Inviter un R4",inviteConfirm:"Envoyer une invitation R4 à {email} ?",invitedUser:"Invitation R4 demandée.",missingStaffData:"Saisir une adresse et un droit."},
 es:{changePassword:"Cambiar contraseña",passwordSetupHint:"Los nuevos R4 pueden definir su contraseña tras aceptar la invitación.",newPassword:"Nueva contraseña (mínimo 10 caracteres)",repeatPassword:"Repetir",savePassword:"Guardar",passwordMismatch:"Contraseñas distintas o muy cortas.",passwordSaved:"Contraseña actualizada.",transferWindowsTitle:"Fases de transferencia entre reinos",transferWindowsInfo:"Gestionar fechas, invitaciones y plazas.",newTransferWindow:"+ Fase",editTransferWindow:"Editar fase",windowLabel:"Nombre",startDate:"Inicio",endDate:"Fin",ordinarySlots:"Invitaciones normales",specialSlots:"Invitaciones especiales",phaseStatusLabel:"Fase",phase_planning:"Planificación",phase_open:"Abierto",phase_closed:"Cerrado",openPhase:"Abierto",closedPhase:"Cerrado",planning:"Planificación",unknownSlotsInfo:"Campo vacío = capacidad desconocida.",noTransferWindows:"No hay fases aún.",transferWindow:"Fase",unassignedWindow:"Sin asignar",allWindows:"Todas las fases",invitationStatus:"Estado de invitación",inviteNotSent:"No enviada",inviteSent:"Enviada",inviteAccepted:"Aceptada",inviteDeclined:"Rechazada",confirmObservedArrival:"Confirmar llegada (miembro activo NRW)",lawsLiveInfo:"Normas publicadas aparecen en Laws. Leyes del reino protegidas.",viewPublicLaws:"↗ Normas públicas",lawHistory:"Historial de versiones",restoreAsDraft:"Restaurar como borrador",restoreConfirm:"¿Restaurar esta versión como nuevo borrador?",noVersions:"Sin versiones",loading:"Cargando …",r4AccessInfo:"R4 solo accede a los módulos permitidos.",accessAudit:"Últimos cambios",noAudit:"Sin cambios.",inviteR4:"✉ Invitar nuevo R4",inviteConfirm:"¿Enviar invitación R4 a {email}?",invitedUser:"Se solicitó invitación R4.",missingStaffData:"Introduce correo y al menos un permiso."}
};
const latestModuleCopy={"de":{"serverLawsIntro":"Nur hier veröffentlichte Server-Laws werden auf der Laws-Seite gezeigt.","serverLawNotice":"Nur ausdrücklich veröffentlichte Servergesetze sind öffentlich. Entwürfe bleiben intern; der NAP-Tracker wird nicht verändert.","serverLawsOnly":"Die öffentliche Laws-Seite zeigt ausschließlich hier veröffentlichte Server-Laws.","pageLanguageSettings":"Seitensprachen","availableSiteLanguages":"Verfügbare Seitensprachen","contactOwner":"Kontaktperson aus NRW (R4/R5)","noneAssigned":"Noch keine Kontaktperson","lookupPlayer":"🔎 Spieler-ID über API abrufen","lookupPending":"Spielerdaten werden abgerufen …","lookupFailed":"Spielerabruf fehlgeschlagen","lookupFilled":"Spielerdaten übernommen · Quelle MightPulse","providerNoPlayer":"Spielerprofil nicht gefunden","providerSource":"Live-API · geprüft","photoUnavailable":"Spielerbild nicht verfügbar"},"en":{"serverLawsIntro":"Only the server laws published here appear on the Laws page.","serverLawNotice":"Only published server laws are public. Drafts stay private; the NAP tracker is unchanged.","serverLawsOnly":"The public Laws page shows only server laws published here.","pageLanguageSettings":"Site languages","availableSiteLanguages":"Available site languages","contactOwner":"NRW contact (R4/R5)","noneAssigned":"No assigned contact","lookupPlayer":"🔎 Look up player ID via API","lookupPending":"Loading player profile …","lookupFailed":"Player lookup failed","lookupFilled":"Profile retrieved · MightPulse","providerNoPlayer":"Player not found","providerSource":"Live API","photoUnavailable":"Player picture unavailable"},"fr":{"serverLawsIntro":"Seules les lois du serveur publiées ici apparaissent sur la page Laws.","serverLawNotice":"Seules les lois publiées sont publiques. Les brouillons restent privés et le NAP Tracker reste inchangé.","serverLawsOnly":"La page affiche uniquement les lois du serveur publiées ici.","pageLanguageSettings":"Langues du site","availableSiteLanguages":"Langues disponibles","contactOwner":"Responsable NRW (R4/R5)","noneAssigned":"Aucun responsable","lookupPlayer":"🔎 Rechercher l'ID via API","lookupPending":"Chargement du profil …","lookupFailed":"Échec de la recherche","lookupFilled":"Profil trouvé · MightPulse","providerNoPlayer":"Profil introuvable","providerSource":"API en direct","photoUnavailable":"Photo indisponible"},"es":{"serverLawsIntro":"Solo las leyes del servidor publicadas aquí aparecen en Laws.","serverLawNotice":"Solo las leyes publicadas son públicas. Los borradores son privados y el NAP Tracker no cambia.","serverLawsOnly":"Solo se muestran las leyes del servidor publicadas aquí.","pageLanguageSettings":"Idiomas del sitio","availableSiteLanguages":"Idiomas disponibles","contactOwner":"Responsable NRW (R4/R5)","noneAssigned":"Sin responsable","lookupPlayer":"🔎 Buscar ID por API","lookupPending":"Consultando perfil …","lookupFailed":"Error de búsqueda","lookupFilled":"Perfil consultado · MightPulse","providerNoPlayer":"Perfil no encontrado","providerSource":"API en directo","photoUnavailable":"Imagen no disponible"}};
const leaderUiCopy={"de":{"chooseLeader":"Spielernamen auswählen","loadingLeaders":"R4/R5 werden geladen …","legacyEmail":"Bestehender Admin-Zugang (E-Mail)","legacySignIn":"Bestehenden Admin-Zugang verwenden","normalSignIn":"Mit Spielernamen anmelden","staffUser":"R4/R5-Spieler","provisionLeaders":"Alle R4/R5-Konten erstellen","resetLeaderPassword":"Passwort für ausgewählten Spieler neu erstellen","credentialsNote":"Die Passwörter werden nur einmal angezeigt. Bei Verlust ein neues Passwort ausstellen.","credentialTitle":"Einmalige Zugangsdaten","credentialsWarning":"Nur jetzt sichtbar. Bitte vertraulich behandeln und nicht öffentlich teilen.","copyCredentials":"Zugangsdaten kopieren","closeCredentials":"Schließen & Anzeige löschen","leaderUnprovisioned":"Dieser Spieler hat noch keinen Zugang. Bitte von der Leitung einrichten lassen.","leaderAccountsCreated":"Neue Zugänge erstellt","noNewLeaders":"Alle vorhandenen Konten wurden beibehalten.","credentialReset":"Passwort neu ausgestellt","credentialSkipped":"Bereits vorhanden","credentialFailed":"Nicht angelegt","noLeaderSelected":"Bitte einen Spieler auswählen.","resetConfirm":"Soll das Passwort dieses Spielers neu erstellt werden? Sein bisheriges Passwort funktioniert anschließend nicht mehr.","setupConfirm":"Für alle aktuell aktiven R4/R5 neue Zugänge anlegen? Bestehende Konten und Passwörter bleiben erhalten. Neue Passwörter werden einmal angezeigt.","individualRights":"Berechtigungen je Spieler (R4 und R5) separat einstellbar. Nur die Leitung vergibt Zugriffe.","legacyAdmin":"Systemadministrator (bestehender Zugang)","staffNoAccounts":"Bitte zuerst die R4/R5-Zugänge anlegen."},"en":{"chooseLeader":"Choose in-game player name","loadingLeaders":"Loading R4/R5 …","legacyEmail":"Existing admin account (email)","legacySignIn":"Use existing admin account","normalSignIn":"Log in with player name","staffUser":"R4/R5 player","provisionLeaders":"Create all R4/R5 accounts","resetLeaderPassword":"Issue new password for selected player","credentialsNote":"Passwords are shown once only. You can issue a replacement if lost.","credentialTitle":"One-time credentials","credentialsWarning":"Shown only now. Keep these passwords private.","copyCredentials":"Copy credentials","closeCredentials":"Close & clear credentials","leaderUnprovisioned":"This player doesn't have an account yet. Ask leadership to create it.","leaderAccountsCreated":"Accounts created","noNewLeaders":"No new accounts; existing credentials left unchanged.","credentialReset":"Replacement password issued","credentialSkipped":"Already exists","credentialFailed":"Not created","noLeaderSelected":"Choose a player.","resetConfirm":"Replace this player's password? The previous password will stop working.","setupConfirm":"Create accounts for all active R4/R5? Existing accounts and passwords are kept unchanged. New passwords appear once.","individualRights":"Assign module permissions separately for each R4/R5. Only the administrator manages access.","legacyAdmin":"Administrator (existing account)","staffNoAccounts":"Create player accounts first."},"fr":{"chooseLeader":"Choisir le nom du joueur","loadingLeaders":"Chargement des R4/R5 …","legacyEmail":"Compte administrateur existant (e-mail)","legacySignIn":"Compte administrateur existant","normalSignIn":"Connexion par nom de joueur","staffUser":"Joueur R4/R5","provisionLeaders":"Créer tous les comptes R4/R5","resetLeaderPassword":"Changer le mot de passe du joueur","credentialsNote":"Les mots de passe ne sont affichés qu'une fois.","credentialTitle":"Identifiants uniques","credentialsWarning":"Copiez-les maintenant et gardez-les privés.","copyCredentials":"Copier les identifiants","closeCredentials":"Fermer et effacer","leaderUnprovisioned":"Compte non créé.","leaderAccountsCreated":"Comptes créés","noNewLeaders":"Aucun nouveau compte.","credentialReset":"Nouveau mot de passe créé","credentialSkipped":"Déjà existant","credentialFailed":"Non créé","noLeaderSelected":"Choisir un joueur.","resetConfirm":"Remplacer le mot de passe du joueur ?","setupConfirm":"Créer les comptes pour tous les R4/R5 actifs ?","individualRights":"Droits distincts pour chaque joueur R4/R5.","legacyAdmin":"Administrateur (compte existant)","staffNoAccounts":"Créer les comptes d'abord."},"es":{"chooseLeader":"Elegir nombre del jugador","loadingLeaders":"Cargando R4/R5 …","legacyEmail":"Cuenta de administrador (correo)","legacySignIn":"Usar administrador existente","normalSignIn":"Entrar con nombre del jugador","staffUser":"Jugador R4/R5","provisionLeaders":"Crear todas las cuentas R4/R5","resetLeaderPassword":"Crear nueva contraseña para el jugador","credentialsNote":"Las contraseñas se muestran una sola vez.","credentialTitle":"Credenciales únicas","credentialsWarning":"Solo se muestran ahora. Mantenlas privadas.","copyCredentials":"Copiar credenciales","closeCredentials":"Cerrar y borrar","leaderUnprovisioned":"Este jugador aún no tiene una cuenta.","leaderAccountsCreated":"Cuentas creadas","noNewLeaders":"No se crearon cuentas nuevas.","credentialReset":"Contraseña renovada","credentialSkipped":"Ya existe","credentialFailed":"No creada","noLeaderSelected":"Elige un jugador.","resetConfirm":"¿Crear nueva contraseña? La anterior dejará de funcionar.","setupConfirm":"¿Crear cuentas para todos los R4/R5 activos?","individualRights":"Permisos separados para cada R4/R5.","legacyAdmin":"Administrador (cuenta existente)","staffNoAccounts":"Crea primero las cuentas."}};
const t=k=>leaderUiCopy[lang]?.[k]||latestModuleCopy[lang]?.[k]||opsUI[lang]?.[k]||groupUI[lang]?.[k]||eventLabels[lang]?.[k]||phase1Labels[lang]?.[k]||staffExtra[lang]?.[k]||copy[lang]?.[k]||leaderUiCopy.de[k]||latestModuleCopy.de[k]||opsUI.de[k]||groupUI.de[k]||eventLabels.de[k]||phase1Labels.de[k]||staffExtra.de[k]||copy.de[k]||k;
const locale={de:"de-DE",en:"en-GB",fr:"fr-FR",es:"es-ES"}[lang];
function txt(obj){return typeof obj==="string"?obj:(obj?.[lang]||obj?.[state?.alliance?.default_language]||obj?.de||obj?.en||"");}
function patchTranslations(){
 document.documentElement.lang=lang;
 q("[data-i18n]").forEach(el=>{const value=t(el.dataset.i18n);if(value)el.textContent=value;});
 q("[data-placeholder]").forEach(el=>el.placeholder=t(el.dataset.placeholder));
 $("language").value=lang;
 $("pageLabel").textContent=t(tab);
}
function setTab(name){
 if(!["overview","roster","transfers","laws","events","settings"].includes(name))return;
 const required=name==="roster"?"members":["transfers","laws","events","settings"].includes(name)?name:null;
 if(required&&state&&!can(required))name="overview";
 tab=name;q(".tab-page").forEach(p=>p.hidden=p.dataset.page!==name);
 q(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));
 $("pageLabel").textContent=t(name);
 history.replaceState(null,"",LEITUNG_PATH+(name==="overview"?"":"?tab="+encodeURIComponent(name)));
}
function flash(message,error=false){
 const el=$("flash");el.textContent=message;el.classList.toggle("error",error);el.hidden=false;
 clearTimeout(flash.timer);flash.timer=setTimeout(()=>el.hidden=true,5000);
}
async function request(mode="bootstrap",payload=null){
 const {data:{session}}=await supabase.auth.getSession();
 if(!session?.access_token)throw new Error("authentication_required");
 const options={headers:{Authorization:"Bearer "+session.access_token,"Content-Type":"application/json",apikey:"sb_publishable_8i1ismeQtj9WM-xVN_Vm0w_Tj7AvVtL"},cache:"no-store"};
 if(payload){options.method="POST";options.body=JSON.stringify(payload);}
 const response=await fetch(FUNCTION+"?alliance=NRW&mode="+encodeURIComponent(mode),options);
 const value=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(value.error||"http_"+response.status);
 return value;
}
function can(feature){return state?.staff?.is_owner===true||state?.staff?.permissions?.[feature]===true;}
function grantButtons(){
 q("[data-permission]").forEach(el=>{el.disabled=!can(el.dataset.permission);el.title=el.disabled?t("permissionDenied"):"";});
 for(const el of q(".nav-item[data-tab]")){
  const required=el.dataset.tab==="roster"?"members":["transfers","laws","events","settings"].includes(el.dataset.tab)?el.dataset.tab:null;
  el.hidden=Boolean(required&&!can(required));
 }
}
const eventHub=createEventHub({request,flash,esc,t});
const operations=createOperations({getState:()=>state,request,flash,esc,t,can,refresh});
function showLogin(message=""){
 $("liveArea").hidden=true;$("loginArea").hidden=false;$("logoutBtn").hidden=true;
 $("roleChip").textContent="R4 / R5";$("loginError").textContent=message;$("changePasswordBtn").hidden=true;
}
function showLive(){
 $("loginArea").hidden=true;$("liveArea").hidden=false;$("logoutBtn").hidden=false;
 $("roleChip").textContent=state.staff.rank;$("changePasswordBtn").hidden=false;grantButtons();render();
}
async function refresh(){
 const data=await request();
 if(!data?.alliance||!data?.staff)throw new Error("not_authorized");
 state=data;showLive();
  eventHub.load().then(()=>{if(state){eventHub.render(state,lang,can("events"));counts();}}).catch(e=>flash(t("genericError")+" (events: "+e.message+")",true));
}
const fmtInt=n=>Number(n||0).toLocaleString({de:"de-DE",en:"en-GB",fr:"fr-FR",es:"es-ES"}[lang]);
const dateText=d=>!d?"—":new Intl.DateTimeFormat({de:"de-DE",en:"en-GB",fr:"fr-FR",es:"es-ES"}[lang],{day:"2-digit",month:"short",year:"numeric"}).format(new Date(d));
const localTime=d=>!d?"—":new Intl.DateTimeFormat({de:"de-DE",en:"en-GB",fr:"fr-FR",es:"es-ES"}[lang],{dateStyle:"medium",timeStyle:"short"}).format(new Date(d));
const badge=(value,text)=>'<span class="chip '+esc(value)+'">'+esc(text||t(value))+'</span>';
const empty=text=>'<tr><td colspan="8" class="empty">'+esc(text)+'</td></tr>';
const activePlayers=()=>state.players.filter(p=>p.active&&p.member_status!=="left");
const confirmedIn=()=>state.transfers.filter(x=>x.direction==="incoming"&&x.status==="confirmed").length;
const confirmedOut=()=>state.transfers.filter(x=>x.direction==="outgoing"&&x.status==="confirmed").length;
function counts(){
 $("heroAlliance").textContent=state.alliance.name;$("heroKingdom").textContent="KINGDOM "+state.alliance.kingdom_id;
 $("statPlayers").textContent=fmtInt(activePlayers().length);
 $("statIncoming").textContent=fmtInt(state.transfers.filter(x=>x.direction==="incoming"&&!["cancelled","completed"].includes(x.status)).length);
 $("statFree").textContent=fmtInt(Math.max(0,(state.alliance.capacity||100)-activePlayers().length-confirmedIn()+confirmedOut()));
 const librarySummary=eventHub.stats();
 $("statEvents").textContent=fmtInt(librarySummary?.count??state.events.filter(x=>x.status==="published").length);
 for(const [id,status] of [["tInterested","interested"],["tShortlisted","shortlisted"],["tConfirmed","confirmed"],["tWaitlist","waitlist"]]){
   $(id).textContent=fmtInt(state.transfers.filter(x=>x.status===status).length);
 }
 $("transferMini").innerHTML=[["interested",state.transfers.filter(x=>x.status==="interested").length],["shortlisted",state.transfers.filter(x=>x.status==="shortlisted").length],["confirmed",state.transfers.filter(x=>x.status==="confirmed").length]].map(([name,count])=>'<div><b>'+esc(fmtInt(count))+'</b><span>'+esc(t(name))+'</span></div>').join("");
 const next=librarySummary?.upcoming||state.events.filter(x=>x.status==="published"&&Date.parse(x.start_at)>Date.now()).slice().sort((a,b)=>Date.parse(a.start_at)-Date.parse(b.start_at)).slice(0,3).map(x=>({title:txt(x.title),date:x.start_at}));
 $("nextEventList").innerHTML=next.length?next.map(x=>'<div class="row"><strong>'+esc(x.title)+'</strong><small>'+esc(dateText(x.date))+'</small></div>').join(""):'<p class="muted">'+esc(t("noUpcoming"))+'</p>';
}
function renderRoster(){
 const search=$("rosterSearch").value.toLowerCase().trim(),status=$("rosterStatus").value,sort=$("rosterSort").value;
 const list=state.players.filter(p=>(!search||String(p.name||"").toLowerCase().includes(search)||String(p.game_id||"").includes(search))&&(status==="all"||p.member_status===status)).slice();
 list.sort((a,b)=>sort==="power"?(Number(b.power??-1)-Number(a.power??-1)):sort==="rank"?(Number(b.rank||0)-Number(a.rank||0)):sort==="id"?String(a.game_id).localeCompare(String(b.game_id)):String(a.name||"").localeCompare(String(b.name||""),lang));
 $("rosterCount").textContent=fmtInt(list.length);
 $("rosterRows").innerHTML=list.length?list.map(p=>{
  const id=esc(p.game_id||""),name=esc(p.name),avatar=/^https:\/\//i.test(p.avatar_url||"")?'<img class="avatar" src="'+esc(p.avatar_url)+'" alt="">':'<span class="avatar">'+esc((p.name||"?").slice(0,1))+'</span>';
  return '<tr><td><div class="person">'+avatar+'<div><strong>'+name+'</strong><small>'+id+'</small></div></div></td><td>'+esc(p.rank?"R"+p.rank:"—")+'</td><td>'+(p.power==null?'<span class="muted">'+esc(t("noPower"))+'</span>':'<strong>'+esc(fmtInt(p.power))+'</strong><small>'+esc(dateText(p.power_observed_at))+'</small>')+'</td><td>'+esc((p.languages||[]).join(", ")||"—")+'</td><td>'+esc(p.discord_user_id||"—")+'</td><td>'+badge(p.member_status)+'</td><td><button class="action-link" data-edit-member="'+id+'" '+(!can("members")?"disabled":"")+'>'+esc(t("dossier"))+'</button></td></tr>';
 }).join(""):empty(t("noPlayers"));
}
function renderTransfers(){
 const filterEl=$("transferWindowFilter");
 const phase=filterEl.value||"all";
 filterEl.innerHTML='<option value="all">'+esc(t("allWindows"))+'</option>'+
   (state.transferWindows||[]).map(w=>'<option value="'+esc(w.id)+'">'+esc(w.label)+'</option>').join("");
 filterEl.value=phase==="all"||(state.transferWindows||[]).some(w=>w.id===phase)?phase:"all";
 const kind=$("transferFilter").value,list=state.transfers.filter(x=>(kind==="all"||x.direction===kind)&&(filterEl.value==="all"||x.transfer_window_id===filterEl.value));
 $("transferCount").textContent=fmtInt(list.length);
 $("transferRows").innerHTML=list.length?list.map(x=>{
  const destination=["#"+(x.target_kingdom||state.alliance.kingdom_id),x.target_alliance||""].filter(Boolean).join(" · ");
  const verified=x.direction==="incoming"&&x.status==="completed"?'<small>'+esc(state.players.some(p=>p.game_id===x.game_id&&p.active)?t("arrived"):t("notArrived"))+'</small>':"";
  return '<tr><td><strong>'+esc(x.player_name||"—")+'</strong><small>'+esc(x.game_id)+' · '+esc(t("priority"))+': '+esc(x.priority===1?t("high"):x.priority===3?t("low"):t("normal"))+(x.invitation_type==="special"?" · "+esc(t("inviteSpecial")):"")+
   (x.contact_staff_user_id?" · "+esc(t("contactOwner"))+": "+esc((state.transferContacts||[]).find(p=>p.user_id===x.contact_staff_user_id)?.label||"—"):"")+'</small></td><td>'+badge(x.direction,x.direction==="incoming"?t("directionIncoming"):t("directionOutgoing"))+'</td><td>'+esc([x.origin_kingdom?"#"+x.origin_kingdom:"",x.previous_alliance||""].filter(Boolean).join(" · ")||"—")+'</td><td>'+esc(destination)+'</td><td>'+esc([x.window_start,x.window_end].filter(Boolean).map(dateText).join(" → ")||"—")+'</td><td>'+badge(x.status)+verified+'</td><td><button class="action-link" data-edit="transfer" data-id="'+esc(x.id)+'" '+(!can("transfers")?"disabled":"")+'>'+esc(t("edit"))+'</button></td></tr>';
 }).join(""):empty(t("noTransfers"));
 const moves=state.internalMoves||[];
 $("internalMoveCount").textContent=fmtInt(moves.length);
 $("internalMoveRows").innerHTML=moves.length?moves.map(m=>'<tr><td>'+esc(dateText(m.moved_at))+'</td><td><b>'+esc(m.player_name||"—")+'</b><small>'+esc(m.game_id||"—")+'</small></td><td>'+esc(m.from_alliance||"—")+'</td><td>→</td><td>'+esc(m.to_alliance||"—")+'</td></tr>').join(""):'<tr><td colspan="5" class="empty">'+esc(t("noMoves"))+'</td></tr>';
}
function renderLaws(){
 const list=state.laws.filter(x=>x.scope==="kingdom").slice().sort((a,b)=>a.scope.localeCompare(b.scope)||a.number.localeCompare(b.number,lang));
 $("lawList").innerHTML=list.length?list.map(x=>'<article class="list-card"><div><span class="eyebrow">'+esc(x.scope==="kingdom"?t("kingdom"):t("allianceLaw"))+' · '+esc(x.number)+'</span><h3>'+esc(txt(x.title)||t("lawTitle"))+'</h3><p>'+esc(t("version"))+' '+esc(x.version)+' · '+esc(dateText(x.updated_at))+'</p></div><div class="card-actions">'+badge(x.status)+'<button data-edit="law" data-id="'+esc(x.id)+'" class="ghost" '+(!can("laws")||x.scope==="kingdom"?"disabled":"")+'>'+esc(t("edit"))+'</button><button type="button" class="ghost" data-law-history="'+esc(x.id)+'" '+(!can("laws")?"disabled":"")+'>'+esc(t("lawHistory"))+'</button></div></article>').join(""):'<div class="card empty">'+esc(t("noLaws"))+'</div>';
}
function renderEvents(){
 const list=state.events.slice().sort((a,b)=>Date.parse(a.start_at)-Date.parse(b.start_at));
 $("eventList").innerHTML=list.length?list.map(x=>'<article class="list-card"><div><span class="eyebrow">'+esc(localTime(x.start_at))+' <span class="muted">· '+esc(new Date(x.start_at).toISOString().slice(11,16))+' UTC</span></span><h3>'+esc(txt(x.title))+'</h3><p>'+esc(txt(x.description)||x.requirements||"")+'</p></div><div class="card-actions">'+badge(x.status)+'<button data-edit="event" data-id="'+esc(x.id)+'" class="ghost" '+(!can("events")?"disabled":"")+'>'+esc(t("edit"))+'</button></div></article>').join(""):'<div class="card empty">'+esc(t("noEvents"))+'</div>';
}
function renderSettings(){
 const config=state.alliance, form=$("settingsForm");
 for(const name of ["name","capacity","logo_url","discord_guild_id"]){form.elements[name].value=config[name]??"";}
 form.elements.advertising_enabled.checked=Boolean(config.advertising_enabled);
 q("#activeLanguages input").forEach(x=>x.checked=(config.languages||[]).includes(x.value));
 $("defaultLanguage").value=config.default_language;
 const options=[["members",t("roster")],["transfers",t("transfers")],["laws",t("laws")],["events",t("events")],["settings",t("settings")]];
 const grants=(state.staffMembers||[]).filter(x=>/^leader-[0-9]+@accounts\\.allianceos\\.invalid$/i.test(x.email||""));
 $("permissionTable").innerHTML='<div><strong>'+esc(t("permissions"))+'</strong><b>R4/R5</b></div>'+
   options.map(([feature,label])=>'<div><span>'+esc(label)+'</span><b>'+
     esc(state.staff.is_owner?(grants.filter(x=>x.enabled&&x.permissions?.[feature]).length+" / "+grants.length):(can(feature)?"✓":"—"))+
     '</b></div>').join("")+'<p class="small-note">'+esc(t("individualRights"))+'</p>';
 $("staffControls").hidden=!state.staff.is_owner;
 const members=(state.staffMembers||[]).filter(x=>x.email);
 const lookupName=email=>{
    const m=/^leader-([0-9]+)@accounts\\.allianceos\\.invalid$/i.exec(email||"");
    const p=m&&state.players.find(x=>String(x.game_id)===m[1]);
    return p?String(p.name)+(p.rank?" · R"+p.rank:""):t("legacyAdmin");
 };
 $("staffList").innerHTML=members.length?'<p class="eyebrow">'+esc(t("staffList"))+'</p>'+
 members.map(m=>'<button type="button" class="staff-row" data-staff-email="'+esc(m.email)+'" '+
   (!/^leader-/.test(m.email)?"disabled":"")+'><span><b>'+esc(lookupName(m.email))+'</b><small>'+esc(m.rank)+
   (m.enabled?"":" · "+esc(t("r4Disabled")))+" · "+esc(Object.keys(m.permissions||{}).filter(k=>m.permissions[k]===true).join(", ")||"—")+
   '</small></span><span>→</span></button>').join(""):"";
 const sel=$("staffAccountSelect"),original=sel.value;
 sel.innerHTML='<option value="">'+esc(t("chooseLeader"))+'</option>'+
 members.filter(x=>/^leader-/.test(x.email||"")).map(x=>
   '<option value="'+esc(x.email)+'">'+esc(lookupName(x.email))+'</option>').join("");
 if([...sel.options].some(x=>x.value===original))sel.value=original;
}
function render(){patchTranslations();counts();renderRoster();renderTransfers();renderLaws();renderEvents();renderSettings();eventHub.render(state,lang,can("events"));operations.render();}
function control(label,name,value="",type="text",opts={}){
 const attr=Object.entries(opts).map(([k,v])=>' '+k+'="'+esc(v)+'"').join("");
 return '<label class="field"><span>'+esc(label)+'</span><input class="control" name="'+esc(name)+'" type="'+esc(type)+'" value="'+esc(value??"")+'"'+attr+'></label>';
}
function select(label,name,value,items){
 return '<label class="field"><span>'+esc(label)+'</span><select class="control" name="'+esc(name)+'">'+items.map(([id,title])=>'<option value="'+esc(id)+'" '+(id===value?"selected":"")+'>'+esc(title)+'</option>').join("")+'</select></label>';
}
function textarea(label,name,value=""){
 return '<label class="field"><span>'+esc(label)+'</span><textarea class="control" name="'+esc(name)+'">'+esc(value)+'</textarea></label>';
}
function dateForInput(raw){
 if(!raw)return"";
 const d=new Date(raw);if(Number.isNaN(d.getTime()))return"";
 const local=new Date(d.getTime()-d.getTimezoneOffset()*60000);
 return local.toISOString().slice(0,16);
}
function openEdit(entity,id=null,sourcePlayer=null){
 const models={transfer:"transfers",law:"laws",event:"events"};
 const record=entity==="member"?state.players.find(p=>String(p.game_id)===String(id)):id?state[models[entity]]?.find(x=>String(x.id)===String(id)):null;
 const feature=entity==="member"?"members":models[entity];
 if(!can(feature)){flash(t("permissionDenied"),true);return;}
 editing={entity,id:entity==="member"?(record?.note_id||null):id,record};
 $("modalTitle").textContent=t((id?"edit":"new")+(entity==="member"?"Player":entity.charAt(0).toUpperCase()+entity.slice(1)));
 let h="";
 if(entity==="transfer"){
   const s=record||{direction:sourcePlayer?"outgoing":"incoming",status:"interested",target_alliance:"NRW",game_id:sourcePlayer?.game_id||"",player_name:sourcePlayer?.name||"",origin_kingdom:sourcePlayer?state.alliance.kingdom_id:"",power:sourcePlayer?.power||""};
   h='<div class="form-grid">'+control(t("playerId"),"game_id",s.game_id||"","text",{required:"required",pattern:"[0-9]+",maxlength:20})+control(t("playerName"),"player_name",s.player_name||"","text",{maxlength:100})+
     select(t("direction"),"direction",s.direction,[["incoming",t("directionIncoming")],["outgoing",t("directionOutgoing")]])+
     select(t("status"),"status",s.status,[["interested",t("interested")],["shortlisted",t("shortlisted")],["invited",t("invited")],["confirmed",t("confirmed")],["waitlist",t("waitlist")],["completed",t("completed")],["cancelled",t("cancelled")]])+
     control(t("originKingdom"),"origin_kingdom",s.origin_kingdom||"","number",{min:1,max:99999})+
      control(t("targetKingdom"),"target_kingdom",s.target_kingdom||(s.direction==="incoming"?state.alliance.kingdom_id:""),"number",{min:1,max:99999})+
     select(t("transferWindow"),"transfer_window_id",s.transfer_window_id||"",[["",t("unassignedWindow")],...(state.transferWindows||[]).map(w=>[w.id,w.label+" · "+w.start_date+" – "+w.end_date])])+
     select(t("invitationStatus"),"invitation_status",s.invitation_status||"not_sent",[["not_sent",t("inviteNotSent")],["sent",t("inviteSent")],["accepted",t("inviteAccepted")],["declined",t("inviteDeclined")]])+
     select(t("contactOwner"),"contact_staff_user_id",s.contact_staff_user_id||"",[["",t("noneAssigned")],...(state.transferContacts||[]).map(x=>[x.user_id,x.rank+" · "+(x.label||x.user_id.slice(0,8))])])+
     control(t("previousAlliance"),"previous_alliance",s.previous_alliance||"")+
     control(t("targetAlliance"),"target_alliance",s.target_alliance||"NRW")+
     control(t("power"),"power",s.power||"","number",{min:0})+
      select(t("priority"),"priority",String(s.priority||2),[["1",t("high")],["2",t("normal")],["3",t("low")]])+
      select(t("invitation"),"invitation_type",s.invitation_type||"not_assigned",[["not_assigned",t("inviteOpen")],["ordinary",t("inviteNormal")],["special",t("inviteSpecial")]])+
     control(t("from"),"window_start",s.window_start||"","date")+
     control(t("to"),"window_end",s.window_end||"","date")+'</div><div class="transfer-search-toolbar"><button type="button" class="ghost" id="lookupTransferPlayer">'+esc(t("lookupPlayer"))+'</button><span id="transferLookupStatus" class="small-note" aria-live="polite"></span></div><div class="transfer-profile-preview" id="transferProfilePreview" hidden></div>'+
     '<p class="small-note">'+esc(t("externalNote"))+'</p>'+textarea(t("notes"),"notes",s.notes||"")+
     (s.direction==="incoming"&&s.status==="completed"?'<label class="field check"><input type="checkbox" name="confirm_arrival" '+(s.arrival_confirmed_at?"checked disabled":"")+' > '+esc(t("confirmObservedArrival"))+'</label>':"")+
     '<label class="field check"><input type="checkbox" name="share_approved" '+(s.share_approved?"checked":"")+'> '+esc(t("allowShare"))+'</label>';
 }else if(entity==="law"){
   const s=record||{scope:"kingdom",status:"draft",title:{},body:{}};
   h='<div class="form-grid">'+select(t("scope"),"scope","kingdom",[["kingdom",t("kingdom")]])+
      control(t("lawNumber"),"number",s.number||"","text",{required:"required",maxlength:30})+
      select(t("status"),"status",s.status,[["draft",t("draft")],["published",t("published")]])+'</div>';
   h+=LANGS.map(l=>'<hr class="form-break"><span class="eyebrow">'+esc(NAMES[l])+'</span>'+control(t("lawTitle"),"title_"+l,s.title?.[l]||"")+textarea(t("lawText"),"body_"+l,s.body?.[l]||"")).join("");
 }else if(entity==="event"){
   const s=record||{status:"draft",reminder_minutes:[60],title:{},description:{}};
   h='<div class="form-grid">'+control(t("startTime"),"start_at",dateForInput(s.start_at),"datetime-local",{required:"required"})+
    control(t("endTime"),"end_at",dateForInput(s.end_at),"datetime-local")+
    select(t("status"),"status",s.status,[["draft",t("draft")],["published",t("published")],["cancelled",t("cancelled")]])+
    select(t("template"),"template_code",s.template_code||"",[["","—"],["bear-trap","Bear Trap"],["swordland","Swordland Showdown"],["tri-alliance","Tri-Alliance"],["kvk","KvK"],["championship","Alliance Championship"],["other","Other"]])+'</div><p class="small-note">'+esc(t("utcNote"))+'</p>'+
    control(t("requirements"),"requirements",s.requirements||"")+
    control(t("reminders"),"reminder_minutes",(s.reminder_minutes||[]).join(","),"text",{placeholder:"60, 15"});
   h+=LANGS.map(l=>'<hr class="form-break"><span class="eyebrow">'+esc(NAMES[l])+'</span>'+control(t("eventTitle"),"title_"+l,s.title?.[l]||"")+textarea(t("eventText"),"description_"+l,s.description?.[l]||"")).join("");
 }else if(entity==="member"&&record){
    const external=state.transfers.filter(x=>x.game_id===record.game_id);
    const internal=(state.internalMoves||[]).filter(x=>x.game_id===record.game_id);
    h='<div class="dossier-info"><div>'+(record.avatar_url&&/^https:\/\//i.test(record.avatar_url)?'<img class="dossier-avatar" src="'+esc(record.avatar_url)+'" alt="'+esc(t("photoUnavailable"))+'" loading="lazy" referrerpolicy="no-referrer">':'<span class="dossier-avatar dossier-avatar-initial" aria-label="'+esc(t("photoUnavailable"))+'">'+esc((record.name||"?").slice(0,1))+'</span>')+'<b>'+esc(record.name)+'</b><small>Game-ID '+esc(record.game_id)+' · '+esc(record.rank?"R"+record.rank:"—")+'</small></div>'+
      '<div><small>TC</small><b>'+esc(record.tc_level??"—")+'</b></div>'+
      '<div><small>'+esc(t("strength"))+'</small><b>'+esc(record.power==null?t("noPower"):fmtInt(record.power))+'</b></div></div>'+
      '<p class="small-note">'+esc(t("sourceNote"))+'</p>'+
      select(t("memberStatus"),"member_status",record.member_status,[["active",t("active")],["planned",t("planned")],["left",t("left")]])+
      '<div class="form-grid">'+control("Discord ID","discord_user_id",record.discord_user_id||"")+
      control(t("joined"),"joined_on",record.joined_on||"","date")+'</div>'+
      '<div class="field"><span>'+esc(t("spoken"))+'</span><div class="language-options">'+[...LANGS,"tr"].map(l=>'<label class="check"><input type="checkbox" name="spoken_languages" value="'+l+'" '+((record.languages||[]).includes(l)?"checked":"")+'> '+esc(NAMES[l]||"Türkçe")+'</label>').join("")+'</div></div>'+
      control(t("otherSpoken"),"other_spoken",(record.languages||[]).filter(l=>![...LANGS,"tr"].includes(l)).join(", "),"text",{maxlength:400})+
      textarea(t("responsibilities"),"responsibilities",record.responsibilities||"")+
      textarea(t("notes"),"notes",record.notes||"")+
      '<hr class="form-break"><h3>'+esc(t("worldTransfers"))+'</h3>'+
      (external.length?external.map(x=>'<div class="history-item"><b>#'+esc(x.origin_kingdom)+' → #'+esc(x.target_kingdom||state.alliance.kingdom_id)+'</b> · '+esc(t(x.status))+' · '+esc(x.window_start||"—")+'</div>').join(""):'<p class="muted">'+esc(t("noHistory"))+'</p>')+
      '<h3>'+esc(t("serverMoves"))+'</h3>'+
      (internal.length?internal.map(x=>'<div class="history-item">'+esc(dateText(x.moved_at))+' · '+esc(x.from_alliance||"—")+' → '+esc(x.to_alliance||"—")+'</div>').join(""):'<p class="muted">'+esc(t("noHistory"))+'</p>')+
      '<p><a class="ghost" href="'+esc(SITE_PATH+"bear/preview-v3.html")+'" target="_blank" rel="noopener">'+esc(t("profileLink"))+' ↗</a></p>'+
      (can("transfers")?'<button type="button" class="ghost" data-plan-player="'+esc(record.game_id)+'">'+esc(t("serverTransfer"))+' →</button>':"");
 }else return;
 $("modalFields").innerHTML=h;
 if(entity==="transfer"){
   const form=$("editForm"),from=form.elements.origin_kingdom,to=form.elements.target_kingdom;
   form.elements.direction.addEventListener("change",event=>{
     if(event.target.value==="incoming"){to.value=state.alliance.kingdom_id;if(Number(from.value)===Number(state.alliance.kingdom_id))from.value="";}
     else{from.value=state.alliance.kingdom_id;if(Number(to.value)===Number(state.alliance.kingdom_id))to.value="";}
   });
   form.elements.game_id.addEventListener("change",event=>{
     const player=state.players.find(p=>p.game_id===event.target.value.trim());
     if(player){
       if(!form.elements.player_name.value.trim())form.elements.player_name.value=player.name||"";
       if(!form.elements.power.value&&player.power!=null)form.elements.power.value=player.power;
     }
   });
   const lookupBtn=$("lookupTransferPlayer"),lookupStatus=$("transferLookupStatus"),preview=$("transferProfilePreview");
   lookupBtn.addEventListener("click",async()=>{
     const gameId=String(form.elements.game_id.value||"").trim();
     if(!/^[0-9]{5,20}$/.test(gameId)){lookupStatus.textContent=t("providerNoPlayer");return;}
     lookupBtn.disabled=true;lookupStatus.textContent=t("lookupPending");preview.hidden=true;
     try{
       const reply=await request("bootstrap",{action:"player_lookup",game_id:gameId}),p=reply?.player;
       if(!p||form.elements.game_id.value.trim()!==gameId)return;
       if(p.name)form.elements.player_name.value=p.name;
       if(p.alliance)form.elements.previous_alliance.value=p.alliance;
       if(p.power!=null)form.elements.power.value=p.power;
       if(p.kingdom_id&&form.elements.direction.value==="incoming")form.elements.origin_kingdom.value=p.kingdom_id;
       const image=p.avatar_url&&/^https:\/\//i.test(p.avatar_url)?'<img src="'+esc(p.avatar_url)+'" referrerpolicy="no-referrer" alt="">':"";
       preview.innerHTML=image+'<div><strong>'+esc(p.name||gameId)+'</strong><small>Game-ID '+esc(gameId)+(p.kingdom_id?' · #'+esc(p.kingdom_id):'')+'</small><small>'+esc(p.alliance||"—")+' · TC '+esc(p.tc_level??"—")+'</small><small>'+esc(t("providerSource"))+'</small></div>';
       preview.hidden=false;lookupStatus.textContent=t("lookupFilled");
     }catch(e){lookupStatus.textContent=t("lookupFailed")+" ("+String(e.message||"")+")";}
     finally{lookupBtn.disabled=false;}
   });

 }
 $("editDialog").showModal();
}
async function saveDialog(event){
 event.preventDefault();
 if(!editing)return;
 const {entity,id,record}=editing, fd=new FormData($("editForm"));
 const data=Object.fromEntries(fd.entries());
 if(entity==="law"||entity==="event"){
   data.title=Object.fromEntries(LANGS.map(l=>[l,String(fd.get("title_"+l)||"").trim()]).filter(([,v])=>v));
   const type=entity==="law"?"body":"description";
   data[type]=Object.fromEntries(LANGS.map(l=>[l,String(fd.get(type+"_"+l)||"").trim()]).filter(([,v])=>v));
   if(entity==="law")data.expected_version=record?.version||null;
   else{
     for(const key of ["start_at","end_at"]){const value=fd.get(key);data[key]=value?new Date(String(value)).toISOString():null;}
     data.reminder_minutes=String(fd.get("reminder_minutes")||"").split(",").map(s=>Number(s.trim())).filter(Number.isInteger);
   }
 }
 if(entity==="transfer"){
    data.share_approved=fd.has("share_approved");
    data.confirm_arrival=fd.has("confirm_arrival");
  }
 if(entity==="member"){
    data.game_id=record.game_id;
    const other=String(fd.get("other_spoken")||"").split(/[,;]/).map(v=>v.trim()).filter(Boolean);
    data.spoken_languages=[...new Set([...fd.getAll("spoken_languages"),...other])];
  }
 $("submitDialog").disabled=true;
 try{
   await request("bootstrap",{action:"save",entity,id,data});
   $("editDialog").close();await refresh();setTab(entity==="member"?"roster":entity==="law"?"laws":entity==="event"?"events":"transfers");flash(t("saved"));
 }catch(e){flash(t("genericError")+" ("+e.message+")",true);}
 finally{$("submitDialog").disabled=false;}
}
q(".nav-item").forEach(el=>el.addEventListener("click",()=>setTab(el.dataset.tab)));
q("[data-jump]").forEach(el=>el.addEventListener("click",()=>setTab(el.dataset.jump)));
$("language").addEventListener("change",e=>{lang=e.target.value;localStorage.setItem("nrw_page_lang",lang);if(state)render();else{patchTranslations();loadLeaderList();$("toggleLegacyLogin").textContent=t(legacyLogin?"normalSignIn":"legacySignIn");}});
$("themeToggle").addEventListener("click",()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;localStorage.setItem("nrw_theme",next);});
$("rosterSearch").addEventListener("input",()=>state&&renderRoster());
$("rosterStatus").addEventListener("change",()=>state&&renderRoster());
$("rosterSort").addEventListener("change",()=>state&&renderRoster());
$("transferFilter").addEventListener("change",()=>state&&renderTransfers());
$("transferWindowFilter").addEventListener("change",()=>state&&renderTransfers());
q("[data-create]").forEach(el=>el.addEventListener("click",()=>openEdit(el.dataset.create)));
document.addEventListener("click",e=>{
  const plan=e.target.closest("[data-plan-player]");if(plan){const p=state.players.find(x=>x.game_id===plan.dataset.planPlayer);if(p){$("editDialog").close();openEdit("transfer",null,p);}return;}
 const member=e.target.closest("[data-edit-member]");if(member)openEdit("member",member.dataset.editMember);
 const edit=e.target.closest("[data-edit]");if(edit)openEdit(edit.dataset.edit,edit.dataset.id);
});
$("closeDialog").addEventListener("click",()=>$("editDialog").close());
$("cancelDialog").addEventListener("click",()=>$("editDialog").close());
$("editForm").addEventListener("submit",saveDialog);
$("staffList").addEventListener("click",e=>{
 const item=e.target.closest("[data-staff-email]");
 if(!item)return;
 const member=(state.staffMembers||[]).find(x=>x.email===item.dataset.staffEmail);
 if(!member||!/^leader-/.test(member.email||""))return;
 const form=$("r4Form");
 form.elements.email.value=member.email;
 for(const feature of ["members","transfers","laws","events","settings"])form.elements[feature].checked=member.permissions?.[feature]===true;
 form.elements.enabled.checked=member.enabled;
 form.scrollIntoView({behavior:"smooth",block:"center"});
});
$("r4Form").addEventListener("submit",async e=>{
 e.preventDefault();
 if(!state?.staff?.is_owner)return;
 const form=e.currentTarget,fd=new FormData(form);
 const email=String(fd.get("email")||"").trim(),permissions={};
 for(const feature of ["members","transfers","laws","events","settings"])permissions[feature]=fd.has(feature);
 const button=form.querySelector("button[type=submit]");button.disabled=true;
 try{
  await request("bootstrap",{action:"staff",email,permissions,enabled:fd.has("enabled")});
  await refresh();setTab("settings");flash(t("r4Saved"));form.reset();
 }catch(error){
  const message=error.message==="account_not_found"?t("r4NotFound"):t("genericError")+" ("+error.message+")";
  flash(message,true);
 }finally{button.disabled=false;}
});
$("settingsForm").addEventListener("submit",async(e)=>{
 e.preventDefault();if(!can("settings"))return;
 const fd=new FormData(e.currentTarget),values=Object.fromEntries(fd.entries());
 const languages=q("#activeLanguages input:checked").map(x=>x.value),default_language=$("defaultLanguage").value;
  if(!languages.includes(default_language)){flash(t("genericError"),true);return;}
  const payload={...state.alliance,...values,languages,default_language,advertising_enabled:fd.has("advertising_enabled")};
 try{await request("bootstrap",{action:"save",entity:"settings",data:payload});await refresh();flash(t("saved"));}
 catch(e){flash(t("genericError")+" ("+e.message+")",true);}
});
let legacyLogin=false;
async function loadLeaderList(){
 const sel=$("leaderSelect");
 try{
  const r=await fetch(FUNCTION+"?alliance=NRW&mode=public-leaders",{cache:"no-store",headers:{Accept:"application/json"}});
  if(!r.ok)throw new Error("leader_lookup_failed");
  const data=await r.json();
  const leaders=Array.isArray(data.leaders)?data.leaders:[];
  const previous=sel.value;
  sel.innerHTML='<option value="">'+esc(t("chooseLeader"))+'</option>'+leaders.map(x=>
    '<option value="'+esc(x.game_id)+'">'+esc(x.name)+' · '+esc(x.rank)+'</option>').join("");
  if([...sel.options].some(x=>x.value===previous))sel.value=previous;
 }catch{
  sel.innerHTML='<option value="">'+esc(t("loadingLeaders"))+'</option>';
  $("loginError").textContent=t("genericError")+" (leader list)";
 }
}
$("toggleLegacyLogin").addEventListener("click",()=>{
 legacyLogin=!legacyLogin;
 $("legacyEmailField").hidden=!legacyLogin;
 $("leaderPickerField").hidden=legacyLogin;
 $("leaderSelect").required=!legacyLogin;
 $("email").required=legacyLogin;
 $("toggleLegacyLogin").textContent=t(legacyLogin?"normalSignIn":"legacySignIn");
 $("loginError").textContent="";
});
function showCredentials(lines,report){
 const dialog=$("leaderCredentialsDialog");
 $("leaderCredentialsOutput").value=lines.join("\n");
 $("leaderCredentialReport").textContent=report||"";
 dialog.showModal();
}
function closeCredentials(){
 $("leaderCredentialsOutput").value="";
 $("leaderCredentialReport").textContent="";
 $("leaderCredentialsDialog").close();
}
$("leaderCredentialsClose").addEventListener("click",closeCredentials);
$("leaderCredentialsCloseTop").addEventListener("click",closeCredentials);
$("leaderCredentialsDialog").addEventListener("close",()=>{
 $("leaderCredentialsOutput").value="";
 $("leaderCredentialReport").textContent="";
});
$("copyLeaderCredentials").addEventListener("click",async()=>{
 try{await navigator.clipboard.writeText($("leaderCredentialsOutput").value);flash(t("copied"));}
 catch{ $("leaderCredentialsOutput").focus();$("leaderCredentialsOutput").select(); }
});
$("provisionLeaders").addEventListener("click",async()=>{
 if(!state?.staff?.is_owner||!window.confirm(t("setupConfirm")))return;
 const btn=$("provisionLeaders");btn.disabled=true;
 try{
   const result=await request("bootstrap",{action:"provision_leaders"});
   const lines=(result.created||[]).map(x=>x.name+" ("+x.rank+") | "+x.password);
   const report=t("leaderAccountsCreated")+": "+(result.created?.length||0)+" · "+t("credentialSkipped")+
      ": "+(result.skipped?.length||0)+" · "+t("credentialFailed")+": "+(result.errors?.length||0);
   if(lines.length)showCredentials(lines,report);
   else flash(t("noNewLeaders")+" "+report);
   await refresh();setTab("settings");
 }catch(e){flash(t("genericError")+" ("+e.message+")",true)}
 finally{btn.disabled=false;}
});
$("resetLeaderPassword").addEventListener("click",async()=>{
 if(!state?.staff?.is_owner)return;
 const value=$("staffAccountSelect").value,match=/^leader-([0-9]+)@accounts\\.allianceos\\.invalid$/i.exec(value);
 if(!match){flash(t("noLeaderSelected"),true);return;}
 if(!window.confirm(t("resetConfirm")))return;
 const b=$("resetLeaderPassword");b.disabled=true;
 try{
  const result=await request("bootstrap",{action:"reset_leader_password",game_id:match[1]});
  const label=$("staffAccountSelect").selectedOptions[0]?.textContent||match[1];
  showCredentials([label+" | "+result.password],t("credentialReset"));
 }catch(e){flash(t("genericError")+" ("+e.message+")",true)}
 finally{b.disabled=false;}
});

$("loginForm").addEventListener("submit",async(e)=>{
 e.preventDefault();
 const button=e.currentTarget.querySelector("button");button.disabled=true;$("loginError").textContent="";
 const email=$("legacyEmailField").hidden?
   ($("leaderSelect").value?"leader-"+$("leaderSelect").value+"@accounts.allianceos.invalid":""):
   $("email").value.trim();
 const password=$("password").value;
 if(!email){$("loginError").textContent=t("noLeaderSelected");button.disabled=false;return;}
 try{
   const {error}=await supabase.auth.signInWithPassword({email,password});
   if(error)throw error;
   await refresh();setTab(new URLSearchParams(location.search).get("tab")||"overview");
   $("password").value="";
 }catch(error){
   if(error.message==="not_authorized")showLogin(t("locked"));
   else showLogin(t("loginFailed"));
   if(error.message==="not_authorized")await supabase.auth.signOut();
 }finally{button.disabled=false;}
});
$("changePasswordBtn").addEventListener("click",()=>$("changePasswordDialog").showModal());
for(const id of ["pwCancel","pwCancelTop"])$(id).addEventListener("click",()=>$("changePasswordDialog").close());
$("changePasswordForm").addEventListener("submit",async e=>{
 e.preventDefault();
 const form=e.currentTarget,pw=String(form.elements.password.value),again=String(form.elements.password_repeat.value);
 if(pw.length<10||pw!==again){flash(t("passwordMismatch"),true);return;}
 const button=form.querySelector('button[type="submit"]');button.disabled=true;
 try{
   const {error}=await supabase.auth.updateUser({password:pw});
   if(error)throw error;
   form.reset();$("changePasswordDialog").close();flash(t("passwordSaved"));
 }catch(e){flash(t("genericError")+" ("+e.message+")",true);}
 finally{button.disabled=false;}
});
$("logoutBtn").addEventListener("click",async()=>{await supabase.auth.signOut();state=null;showLogin();});
document.documentElement.dataset.theme=localStorage.getItem("nrw_theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
patchTranslations();
loadLeaderList();
try{
 const {data:{session}}=await supabase.auth.getSession();
 if(session){try{await refresh();setTab(new URLSearchParams(location.search).get("tab")||"overview");}
 catch(e){showLogin(e.message==="not_authorized"?t("locked"):e.message==="authentication_required"?t("sessionExpired"):t("genericError")+" ("+e.message+")");}}
 else showLogin();
}catch{showLogin();}
