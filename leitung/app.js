import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.58.0/+esm";
import {createEventHub} from "./event-library.js?v=step6-iteratorfix-1";
import {createOperations} from "./operations.js?v=pages-4";
import {createDiscordEventPlanner} from "./discord-events.js?v=eventbot-4lang-20261019";
import {createEventBotStatusPanel} from "./event-bot-status.js?v=eventbot-4lang-20261019";
import {createMemberRelationships} from "./member-relationships.js?v=external-alts-dayloans-20261020-1";
import {createPerformance} from "./performance.js?v=permissions-split-20261020-3";
import {createBearManagement} from "./bear-management.js?v=permissions-split-20261020-3";
import {createFightClub} from "./fightclub.js?v=permissions-split-20261020-3";
import {createEventParticipation} from "./event-participation.js?v=permissions-split-20261020-3";
import {createEventLoans} from "./event-loans.js?v=external-alts-dayloans-20261020-1";

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
de:{workplace:"LEITUNGSZENTRALE",overview:"Übersicht",roster:"Spielerverwaltung",transfers:"Transferplanung",languages:"Sprachen",laws:"Laws-Verwaltung",events:"Eventplanung",settings:"Allianz & Rechte",private:"Geschützter Bereich",scopeNotice:"Nur Daten deiner eigenen Allianz. Keine öffentlichen Spielerlisten.",backHome:"← Zurück zur Willkommensseite",logout:"Abmelden",securePilot:"ALLIANCEOS · GESCHÜTZTER PILOT",leadership:"Deine Allianz.",underControl:"Alles im Blick.",heroText:"Spieler, Transfers, Regeln und Termine zentral verwalten. Änderungen bleiben auf NRW beschränkt.",activePlayers:"Aktive Spieler",fromRoster:"Aus dem Allianzregister",incoming:"Eingehende Transfers",plannedAndConfirmed:"In Planung / bestätigt",seatsAvailable:"Freie Plätze (geplant)",afterReservations:"Nach bestätigten Wechseln",publishedEvents:"Veröffentlichte Events",fromPlanner:"Aus der Eventplanung",transferHub:"Transfermanager",transferHubDesc:"Interessenten bis zur Aufnahme begleiten",open:"Öffnen →",nextEvents:"Anstehende Termine",nextEventsDesc:"Einmal planen, überall aktuell halten",pilotLabel:"Pilotstatus",pilotInfo:"Spieler werden aus vorhandenen Daten gelesen. Event-Bot, automatische KI-Übersetzungen, bezahlte Abonnements und automatische Discord-Einladungen sind noch nicht angeschlossen. Es werden dafür keine fiktiven Ergebnisse angezeigt.",rosterEyebrow:"MITGLIEDER",rosterDesc:"Nur deine Allianz. Spielerdaten sind auf den letzten bekannten Stand begrenzt.",searchPlayers:"Name oder Spieler-ID suchen …",allStatuses:"Alle Status",active:"Aktiv",planned:"Geplant",left:"Ausgetreten",sortName:"Name A–Z",sortRank:"Rang absteigend",sortId:"Spieler-ID",player:"Spieler",rank:"Rang",strength:"Stärke",language:"Sprache",memberStatus:"Mitgliedschaft",addTransfer:"+ Transfer planen",transfersDesc:"Bewerbungen, Reservierungen, Wartelisten und abgeschlossene Wechsel.",interested:"Interessenten",shortlisted:"Vorgemerkt",confirmed:"Bestätigt",waiting:"Warteliste",allTransfers:"Alle Transfers",outgoing:"Ausgehende Transfers",direction:"Richtung",origin:"Herkunft",destination:"Ziel",window:"Zeitraum",status:"Status",supportedLanguages:"Unterstützte Sprachen",languageAccess:"Änderungen an Spracheinstellungen sind für R5 und berechtigte R4 möglich.",defaultLang:"Standardsprache",save:"Speichern",translationFlow:"Übersetzungsworkflow",translationStep1:"Originaltext schreiben",translationStep2:"Aktive Übersetzungen ergänzen und prüfen",translationStep3:"Gemeinsam veröffentlichen",translationWarning:"Eine automatische KI-Übersetzung ist noch nicht angeschlossen. Veröffentlichungen nutzen derzeit die manuell eingegebenen Texte.",languagesDesc:"Gemeinsame Spracheinstellungen für Willkommen, Leitungsseite und zukünftige Bots.",lawsDesc:"Entwürfe und veröffentlichte Fassungen mit Versionen; getrennt nach Königreich und Allianz.",addLaw:"+ Neue Regel",publicRuleNoticeTitle:"Veröffentlichungshinweis",publicRuleNotice:"Hier erstellte Laws gelten als AllianceOS-Fassung. Bestehende NAP-Gesetze werden nicht überschrieben. Königreichsgesetze erfordern eine gesonderte gemeinsame Freigabe.",eventsDesc:"Alle Zeiten werden in UTC gespeichert und für Spieler lokal angezeigt.",addEvent:"+ Event planen",eventSyncStatus:"Ausspielung",eventSyncNotice:"Öffentlich veröffentlichte Termine können von den Webseiten geladen werden. Discord-Ankündigungen und Erinnerungen benötigen noch den künftigen Event-Bot.",settingsDesc:"Stammdaten, Kapazitäten, Freigaben und Plattformmodule.",allianceConfig:"Allianzkonfiguration",allianceName:"Allianzname",capacity:"Maximale Mitglieder",logoUrl:"Logo-URL (optional)",discordGuild:"Discord Server-ID",adsEnable:"Werbung vormerken (noch nicht aktiv)",permissions:"Berechtigungen",rolesFuture:"R4-Rechte sind einzeln vorgesehen. Die sichere Einladungs- und Rollenvergabe wird als nächster Schritt freigeschaltet; vorhandene NAP-Zugänge werden nicht automatisch zu AllianceOS-R4.",subscription:"Abonnement",notConfigured:"Noch nicht eingerichtet",loginTitle:"Zugang zur Leitungszentrale",loginText:"Die Spielerlisten und internen Planungen sind geschützt. Melde dich mit einem bereits freigeschalteten Konto an.",password:"Passwort",login:"Anmelden",loginNote:"Es werden keine Konten automatisch angelegt. Zugriff erst nach Freigabe durch den AllianceOS-R5.",cancel:"Abbrechen",edit:"Bearbeiten",editPlayer:"Mitglied verwalten",editTransfer:"Transfer bearbeiten",newTransfer:"Transfer planen",newLaw:"Regel schreiben",editLaw:"Regel bearbeiten",newEvent:"Event erstellen",editEvent:"Event bearbeiten",noPlayers:"Keine Spieler gefunden.",noTransfers:"Noch keine Transfers geplant.",noEvents:"Noch keine Termine erfasst.",noLaws:"Noch keine Regeln in AllianceOS.",noUpcoming:"Keine anstehenden veröffentlichten Termine.",loading:"Lade Daten …",saved:"Änderungen gespeichert.",permissionDenied:"Keine Berechtigung für diesen Bereich.",sessionExpired:"Sitzung abgelaufen. Bitte erneut anmelden.",genericError:"Aktion konnte nicht ausgeführt werden.",locked:"Du hast keine AllianceOS-Freigabe für NRW.",loginFailed:"Anmeldung fehlgeschlagen. Bitte Zugangsdaten prüfen.",playerId:"Spieler-ID",playerName:"Ingame-Name",originKingdom:"Herkunftskönigreich",previousAlliance:"Bisherige Allianz",targetAlliance:"Zielallianz",power:"Spielerstärke (optional)",from:"Beginn",to:"Ende",notes:"Interne Notizen",directionIncoming:"Eingehend",directionOutgoing:"Ausgehend",waitlist:"Warteliste",completed:"Abgeschlossen",cancelled:"Abgebrochen",allowShare:"Für Transferabsprachen ausdrücklich freigeben (künftige Funktion)",scope:"Art der Regel",kingdom:"Königreichsgesetz",allianceLaw:"Allianzregel",lawNumber:"Nummer / Kennung",draft:"Entwurf",published:"Veröffentlicht",lawTitle:"Titel",lawText:"Regeltext",version:"Version",eventTitle:"Eventname",eventText:"Hinweise",startTime:"Start (lokale Uhrzeit)",endTime:"Ende (lokale Uhrzeit, optional)",requirements:"Teilnahmebedingungen",template:"Kingshot-Vorlage",reminders:"Erinnerungen (Minuten vor Start, durch künftigen Bot)",utcNote:"Beim Speichern wird automatisch in UTC umgerechnet.",saveSuccess:"Erfolgreich gespeichert.",profileLink:"Zum Bären-Optimierer",noPower:"Nicht verfügbar",freeSeats:"Plätze frei",unprotected:"Nicht öffentlich",r4Access:"R4 nur mit Freigabe",r5Access:"R5",invalidEmail:"Bitte eine gültige E-Mail-Adresse eingeben."},
en:{workplace:"LEADERSHIP CONSOLE",overview:"Overview",roster:"Player management",transfers:"Transfer planning",languages:"Languages",laws:"Laws management",events:"Event planning",settings:"Alliance & permissions",private:"Restricted access",scopeNotice:"Only your alliance's data. No public player lists.",backHome:"← Back to Welcome",logout:"Sign out",securePilot:"ALLIANCEOS · SECURE PILOT",leadership:"Your alliance.",underControl:"All in one place.",heroText:"Manage players, transfers, rules and events. Changes stay within NRW.",activePlayers:"Active players",fromRoster:"From the alliance roster",incoming:"Incoming transfers",plannedAndConfirmed:"Planned / confirmed",seatsAvailable:"Available seats (planned)",afterReservations:"After confirmed transfers",publishedEvents:"Published events",fromPlanner:"From the event planner",transferHub:"Transfer manager",transferHubDesc:"Guide candidates through onboarding",open:"Open →",nextEvents:"Upcoming events",nextEventsDesc:"Plan once, update everywhere",pilotLabel:"Pilot status",pilotInfo:"Players are read from existing records. Event bot, automatic AI translation, paid subscriptions and automatic Discord invitations are not yet connected. No fictitious results are shown.",rosterEyebrow:"MEMBERS",rosterDesc:"Your alliance only. Player data reflects the last known state.",searchPlayers:"Search by name or player ID …",allStatuses:"All statuses",active:"Active",planned:"Planned",left:"Departed",sortName:"Name A–Z",sortRank:"Highest rank",sortId:"Player ID",player:"Player",rank:"Rank",strength:"Power",language:"Language",memberStatus:"Membership",addTransfer:"+ Plan transfer",transfersDesc:"Applications, reserved seats, waitlists and completed moves.",interested:"Interested",shortlisted:"Shortlisted",confirmed:"Confirmed",waiting:"Waitlist",allTransfers:"All transfers",outgoing:"Outgoing transfers",direction:"Direction",origin:"Origin",destination:"Destination",window:"Window",status:"Status",supportedLanguages:"Supported languages",languageAccess:"R5 and authorized R4 can change language settings.",defaultLang:"Default language",save:"Save",translationFlow:"Translation workflow",translationStep1:"Write original text",translationStep2:"Add and review active translations",translationStep3:"Publish together",translationWarning:"AI translation is not connected yet. Published versions use manually entered texts.",languagesDesc:"Shared language settings for Welcome, leadership and future bots.",lawsDesc:"Draft and published versions, separate for kingdom and alliance rules.",addLaw:"+ New rule",publicRuleNoticeTitle:"Publication notice",publicRuleNotice:"Laws created here are AllianceOS versions. Existing NAP laws are not replaced. Kingdom laws require separate joint approval.",eventsDesc:"Times are stored in UTC and displayed in each player's local timezone.",addEvent:"+ Plan event",eventSyncStatus:"Distribution",eventSyncNotice:"Publicly published dates can be loaded by the websites. Discord announcements and reminders still require the future event bot.",settingsDesc:"Core settings, capacity, permissions and platform modules.",allianceConfig:"Alliance settings",allianceName:"Alliance name",capacity:"Maximum members",logoUrl:"Logo URL (optional)",discordGuild:"Discord server ID",adsEnable:"Prepare ads (not active)",permissions:"Permissions",rolesFuture:"Individual R4 permissions are planned. Secure invitations and role assignment are the next step; existing NAP accounts are not automatically AllianceOS R4.",subscription:"Subscription",notConfigured:"Not configured",loginTitle:"Access the leadership console",loginText:"Player lists and internal plans are private. Sign in with an account that has already been authorized.",password:"Password",login:"Sign in",loginNote:"No accounts are created automatically. AllianceOS R5 approval is required.",cancel:"Cancel",edit:"Edit",editPlayer:"Manage member",editTransfer:"Edit transfer",newTransfer:"Plan transfer",newLaw:"Write rule",editLaw:"Edit rule",newEvent:"Create event",editEvent:"Edit event",noPlayers:"No matching players.",noTransfers:"No transfers planned yet.",noEvents:"No events recorded yet.",noLaws:"No AllianceOS rules yet.",noUpcoming:"No upcoming published events.",loading:"Loading data …",saved:"Changes saved.",permissionDenied:"You lack permission for this area.",sessionExpired:"Session expired. Please sign in again.",genericError:"The action could not be completed.",locked:"Your account is not authorized for NRW AllianceOS.",loginFailed:"Sign-in failed. Check your credentials.",playerId:"Player ID",playerName:"In-game name",originKingdom:"Origin kingdom",previousAlliance:"Previous alliance",targetAlliance:"Target alliance",power:"Player power (optional)",from:"Start",to:"End",notes:"Internal notes",directionIncoming:"Incoming",directionOutgoing:"Outgoing",waitlist:"Waitlist",completed:"Completed",cancelled:"Cancelled",allowShare:"Explicitly approve sharing for transfer talks (future feature)",scope:"Rule type",kingdom:"Kingdom law",allianceLaw:"Alliance rule",lawNumber:"Number / identifier",draft:"Draft",published:"Published",lawTitle:"Title",lawText:"Rule text",version:"Version",eventTitle:"Event name",eventText:"Instructions",startTime:"Start (local time)",endTime:"End (local time, optional)",requirements:"Participation requirements",template:"Kingshot template",reminders:"Reminders (minutes before event; future bot)",utcNote:"Automatically converted to UTC on saving.",saveSuccess:"Successfully saved.",profileLink:"Bear optimizer",noPower:"Unavailable",freeSeats:"Free seats",unprotected:"Not public",r4Access:"R4 with approval",r5Access:"R5",invalidEmail:"Enter a valid email address."},
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
 de:{spokenSeparateTitle:"Spielersprachen separat verwalten",spokenSeparateText:"Gesprochene Sprachen gehören in die einzelne Spielerakte. Hier legst du nur die verfügbaren Seitensprachen und die Standardsprache fest.",toDossiers:"→ Zu den Spielerakten",pageLanguageNote:"Die aktivierten DE/EN/FR-Sprachen und die Standardsprache steuern jetzt auch die öffentlichen Seiten.",invited:"Eingeladen",pilotFree:"NRW bleibt kostenlos und werbefrei.",dossier:"Spielerakte",joined:"Beitrittsdatum",responsibilities:"Aufgaben / Zuständigkeiten",spoken:"Gesprochene Sprachen",otherSpoken:"Weitere Sprachen (Komma-getrennt, z. B. fa)",serverTransfer:"Königreichtransfer planen",serverMoves:"Allianzwechsel in 1044 (bestehendes Protokoll)",internalHistoryNote:"Unveränderte Historie des vorhandenen Trackers, nur Wechsel mit NRW-Beteiligung.",noMoves:"Keine Wechsel erfasst",worldTransfers:"Königreichtransfers",noHistory:"Keine Transferhistorie",targetKingdom:"Zielkönigreich",priority:"Priorität",invitation:"Einladungsart",high:"Hoch",normal:"Normal",low:"Niedrig",inviteOpen:"Nicht vergeben",inviteNormal:"Normale Einladung",inviteSpecial:"Spezialeinladung",externalNote:"Server-zu-Server-Transfers: Eingehend immer nach #1044, ausgehend immer aus #1044. Interne 1044-Allianzwechsel werden separat angezeigt.",sourceNote:"Stammdaten bleiben im vorhandenen Register. Hier werden nur ergänzende Verwaltungsdaten gespeichert.",arrived:"Ankunft in NRW erkannt",notArrived:"Ankunft nicht im Register bestätigt"},
 en:{spokenSeparateTitle:"Player languages are separate",spokenSeparateText:"Spoken languages are managed in each player dossier. Here you only configure site languages and the default.",toDossiers:"→ Open player dossiers",pageLanguageNote:"The enabled DE/EN/FR languages and default now also control the public pages.",invited:"Invited",pilotFree:"NRW stays free and ad-free.",dossier:"Player dossier",joined:"Joined on",responsibilities:"Responsibilities",spoken:"Spoken languages",otherSpoken:"Other languages (comma-separated)",serverTransfer:"Plan kingdom transfer",serverMoves:"Alliance moves in 1044 (existing log)",internalHistoryNote:"Read-only historical changes involving NRW.",noMoves:"No moves recorded",worldTransfers:"Kingdom transfers",noHistory:"No transfer history",targetKingdom:"Destination kingdom",priority:"Priority",invitation:"Invitation type",high:"High",normal:"Normal",low:"Low",inviteOpen:"Not assigned",inviteNormal:"Ordinary invitation",inviteSpecial:"Special invitation",externalNote:"Kingdom transfers only: incoming goes to #1044, outgoing starts in #1044. Internal alliance moves are listed separately.",sourceNote:"Core data stays in the existing roster. Only management additions are saved here.",arrived:"Arrival in NRW detected",notArrived:"Arrival not observed in roster"},
 fr:{spokenSeparateTitle:"Les langues des joueurs sont distinctes",spokenSeparateText:"Les langues parlées se renseignent dans la fiche joueur. Ici, seules les langues du site et la langue par défaut sont configurées.",toDossiers:"→ Ouvrir les fiches",pageLanguageNote:"Les langues DE/EN/FR activées et la langue par défaut contrôlent aussi les pages publiques.",invited:"Invité",pilotFree:"NRW reste gratuit et sans publicité.",dossier:"Fiche joueur",joined:"Date d’arrivée",responsibilities:"Responsabilités",spoken:"Langues parlées",otherSpoken:"Autres langues (séparées par virgules)",serverTransfer:"Planifier transfert de royaume",serverMoves:"Mouvements d’alliance en 1044 (registre)",internalHistoryNote:"Historique en lecture seule impliquant NRW.",noMoves:"Aucun mouvement",worldTransfers:"Transferts de royaume",noHistory:"Aucun historique",targetKingdom:"Royaume de destination",priority:"Priorité",invitation:"Type d’invitation",high:"Haute",normal:"Normale",low:"Basse",inviteOpen:"À définir",inviteNormal:"Invitation normale",inviteSpecial:"Invitation spéciale",externalNote:"Entre royaumes uniquement : entrée vers #1044, sortie depuis #1044. Mouvements internes séparés.",sourceNote:"Données de base conservées dans le registre existant.",arrived:"Arrivée détectée",notArrived:"Arrivée non confirmée"},
 es:{spokenSeparateTitle:"Los idiomas del jugador van por separado",spokenSeparateText:"Los idiomas hablados se editan en cada ficha. Aquí solo se configuran los idiomas y el idioma predeterminado del sitio.",toDossiers:"→ Abrir fichas",pageLanguageNote:"Los idiomas DE/EN/FR activos y el predeterminado controlan también las páginas públicas.",invited:"Invitado",pilotFree:"NRW seguirá siendo gratuito y sin anuncios.",dossier:"Ficha del jugador",joined:"Fecha de ingreso",responsibilities:"Responsabilidades",spoken:"Idiomas hablados",otherSpoken:"Otros idiomas (separados por comas)",serverTransfer:"Planear transferencia",serverMoves:"Cambios internos en 1044 (registro)",internalHistoryNote:"Historial de solo lectura con NRW.",noMoves:"Sin cambios",worldTransfers:"Transferencias de reino",noHistory:"Sin historial",targetKingdom:"Reino de destino",priority:"Prioridad",invitation:"Tipo de invitación",high:"Alta",normal:"Normal",low:"Baja",inviteOpen:"Sin asignar",inviteNormal:"Invitación normal",inviteSpecial:"Invitación especial",externalNote:"Entre reinos: entradas a #1044, salidas desde #1044. Cambios internos separados.",sourceNote:"Datos principales conservados en el registro existente.",arrived:"Llegada detectada",notArrived:"Llegada no confirmada"}
};
let lang=LANGS.includes(localStorage.getItem("nrw_page_lang"))?localStorage.getItem("nrw_page_lang"):"de";
let state=null, tab="overview", editing=null, selectedStaffEmail="";
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
const rosterLabels={"de":{"discordPresence":"Discord","discordLinked":"Mit NRW-Discord verknüpft (Onboarding/Bestandszuordnung)","discordUnlinked":"Keine bestätigte Discord-Zuordnung erfasst","cityLevel":"Stadtzentrum","powerInput":"Stärke (manuell, wenn kein API-Wert vorliegt)","powerHelp":"Ganze Stärke eintragen, z. B. 250000000. Anzeige wird automatisch formatiert; Eingabedatum wird gespeichert.","yes":"Ja","no":"Nein"},"en":{"discordPresence":"Discord","discordLinked":"Linked to NRW Discord (onboarding/existing record)","discordUnlinked":"No verified Discord match recorded","cityLevel":"Town Center","powerInput":"Power (manual when API value is missing)","powerHelp":"Enter the full value, e.g. 250000000. Display is formatted automatically.","yes":"Yes","no":"No"},"fr":{"discordPresence":"Discord","discordLinked":"Lié à NRW Discord (onboarding)","discordUnlinked":"Aucun lien Discord confirmé","cityLevel":"Centre-ville","powerInput":"Puissance (manuelle si API absente)","powerHelp":"Saisir la valeur entière. La présentation est formatée automatiquement.","yes":"Oui","no":"Non"},"es":{"discordPresence":"Discord","discordLinked":"Vinculado al Discord NRW (onboarding)","discordUnlinked":"Sin vínculo Discord confirmado","cityLevel":"Centro urbano","powerInput":"Poder (manual si no hay datos API)","powerHelp":"Introduce el número entero. La presentación se formatea automáticamente.","yes":"Sí","no":"No"}};
const powerLabels={"de":{"powerFetching":"Stärke wird aus der Kingshot-API geladen …","powerUpdated":"Stärke von {n} NRW-Spielern aus API abgeglichen","powerCached":"aktueller Zwischenspeicher","powerUpdateError":"API-Abruf nicht möglich","syncPower":"↻ Stärke aus API abrufen"},"en":{"powerFetching":"Loading strength from the Kingshot API …","powerUpdated":"Power synced for {n} NRW players","powerCached":"recent cache","powerUpdateError":"API lookup failed","syncPower":"↻ Refresh power from API"},"fr":{"powerFetching":"Chargement de la puissance depuis l'API …","powerUpdated":"Puissance actualisée pour {n} membres NRW","powerCached":"cache récent","powerUpdateError":"Échec de l'API","syncPower":"↻ Actualiser la puissance"},"es":{"powerFetching":"Consultando el poder desde la API …","powerUpdated":"Poder actualizado para {n} jugadores NRW","powerCached":"caché reciente","powerUpdateError":"Error de API","syncPower":"↻ Actualizar poder"}};
const transferUiCopy={"de":{"transferInternalOnly":"Interne Transferplanung. Es werden keine Daten automatisch extern geteilt.","transferApiDescription":"Die drei nächsten bestätigten Transferphasen aus der Königreichs-API.","phaseRefresh":"↻ API aktualisieren","manualTransferPlanning":"Eigene Reservierungen und Einladungsplätze (optional)","manualTransferPlanningHint":"Manuelle Pläne sind nicht automatisch bestätigte Eventtermine.","moveSearch":"Spieler oder Game-ID …","allMoves":"Alle Richtungen","movesInto":"Zu NRW","movesOut":"Von NRW","allTime":"Gesamter Zeitraum"},"en":{"transferInternalOnly":"Internal recruitment planning. Nothing is automatically shared externally.","transferApiDescription":"Next three confirmed transfer phases from the kingdom API.","phaseRefresh":"↻ Refresh API","manualTransferPlanning":"Manual reservations and invitation slots (optional)","manualTransferPlanningHint":"Manual plans are not confirmed in-game event dates.","moveSearch":"Player or game ID …","allMoves":"All directions","movesInto":"To NRW","movesOut":"From NRW","allTime":"All history"},"fr":{"transferInternalOnly":"Planification interne, sans partage automatique.","transferApiDescription":"Trois prochaines phases annoncées via l’API.","phaseRefresh":"↻ Actualiser","manualTransferPlanning":"Réservations manuelles (facultatif)","manualTransferPlanningHint":"Les plans ne constituent pas des dates officielles.","moveSearch":"Joueur ou ID …","allMoves":"Toutes directions","movesInto":"Vers NRW","movesOut":"Depuis NRW","allTime":"Tout l’historique"},"es":{"transferInternalOnly":"Planificación interna, sin compartir datos automáticamente.","transferApiDescription":"Próximas tres fases anunciadas por la API.","phaseRefresh":"↻ Actualizar","manualTransferPlanning":"Reservas manuales (opcional)","manualTransferPlanningHint":"Los planes manuales no son fechas oficiales.","moveSearch":"Jugador o ID …","allMoves":"Todas direcciones","movesInto":"Hacia NRW","movesOut":"Desde NRW","allTime":"Todo el historial"}};
const manualPhasesCopy={"de":{"transferManualInfo":"Die Kalender-API erfordert ein kostenpflichtiges Mighty-Abo. Hier erscheinen höchstens drei von uns selbst erfasste kommende Transferphasen. Ohne Eingabe werden keine Termine geschätzt.","transferWindowsTitle":"Nächste Transferphasen (manuell)"},"en":{"transferManualInfo":"The kingdom calendar API requires a paid Mighty subscription. Displaying up to three upcoming manually entered transfer windows, with no guessed dates.","transferWindowsTitle":"Upcoming transfer phases (manual)"},"fr":{"transferManualInfo":"L'API du calendrier nécessite un abonnement Mighty payant. Jusqu'à trois phases futures saisies manuellement, sans dates estimées.","transferWindowsTitle":"Prochaines phases (manuelles)"},"es":{"transferManualInfo":"La API del calendario requiere una suscripción Mighty de pago. Hasta tres fases próximas introducidas manualmente, sin fechas estimadas.","transferWindowsTitle":"Próximas fases (manual)"}};
const lawUiCopy={"de":{"lawPublicVersion":"Öffentlich: Version {n}","lawUnpublishedChanges":"Neuer Entwurf: Version {n}","lawOnlyDraft":"Nur intern · Entwurf v{n}","lawWithdraw":"Zurückziehen","noServerLaws":"Noch keine Server-Laws eingetragen. Über „+ Neue Regel“ kannst du die erste erstellen.","editedAt":"Bearbeitet:","lawSaveDraft":"Als Entwurf speichern (nicht öffentlich)","lawPublishNow":"Auf der Laws-Seite veröffentlichen","lawEditorTip":"Die deutsche Fassung ist für die Veröffentlichung erforderlich. Englisch, Französisch und Spanisch sind optional. Ein Entwurf verändert nicht die zuletzt veröffentlichte Version.","lawPublishConfirm":"Server-Law {n} jetzt öffentlich auf der Laws-Seite veröffentlichen? Diese Änderung ist für alle Besucher sichtbar.","lawNeedGerman":"Zum Veröffentlichen sind deutscher Titel und Gesetzestext erforderlich.","lawNumberConflict":"Diese Law-Nummer ist bereits vergeben. Bitte bearbeite die bestehende Law.","lawEditConflict":"Die Law wurde zwischenzeitlich geändert. Bitte neu laden und erneut bearbeiten.","lawUnpublishConfirm":"Server-Law {n} wirklich von der öffentlichen Laws-Seite zurückziehen? Die Texte und alle Versionen bleiben im Archiv.","lawWithdrawn":"Die Server-Law wurde zurückgezogen. Ihr Entwurf bleibt erhalten."},"en":{"lawPublicVersion":"Public: version {n}","lawUnpublishedChanges":"New draft: version {n}","lawOnlyDraft":"Private draft · v{n}","lawWithdraw":"Withdraw","noServerLaws":"No server laws yet. Select '+ New law' to add your first.","editedAt":"Edited:","lawSaveDraft":"Save draft (not public)","lawPublishNow":"Publish on Laws page","lawEditorTip":"German title and text are required before publishing. English, French and Spanish are optional. Saving a draft does not replace the last published version.","lawPublishConfirm":"Publish server law {n} on the public Laws page now? Visitors will see it.","lawNeedGerman":"German title and law text are required to publish.","lawNumberConflict":"This law number already exists. Edit the existing law instead.","lawEditConflict":"This law changed since you loaded it. Reload and try again.","lawUnpublishConfirm":"Withdraw server law {n} from the public page? The draft and revision history will remain.","lawWithdrawn":"Law withdrawn; draft preserved."},"fr":{"lawPublicVersion":"Publique : version {n}","lawUnpublishedChanges":"Nouveau brouillon : version {n}","lawOnlyDraft":"Brouillon privé · v{n}","lawWithdraw":"Retirer","noServerLaws":"Aucune loi du serveur. Utilisez '+ Nouvelle loi'.","editedAt":"Modifié :","lawSaveDraft":"Enregistrer comme brouillon","lawPublishNow":"Publier sur la page Laws","lawEditorTip":"Un titre et un texte allemand sont nécessaires pour publier. Les autres langues sont facultatives. Un brouillon ne remplace pas la publication existante.","lawPublishConfirm":"Publier la loi {n} sur la page publique ?","lawNeedGerman":"Le titre et le texte en allemand sont requis pour publier.","lawNumberConflict":"Ce numéro de loi existe déjà.","lawEditConflict":"Cette loi a changé. Rechargez la page.","lawUnpublishConfirm":"Retirer la loi {n} de la page publique ? Les anciennes versions restent conservées.","lawWithdrawn":"Loi retirée ; brouillon conservé."},"es":{"lawPublicVersion":"Pública: versión {n}","lawUnpublishedChanges":"Nuevo borrador: versión {n}","lawOnlyDraft":"Borrador privado · v{n}","lawWithdraw":"Retirar","noServerLaws":"Todavía no hay leyes. Pulsa '+ Nueva ley'.","editedAt":"Editado:","lawSaveDraft":"Guardar borrador","lawPublishNow":"Publicar en la página Laws","lawEditorTip":"Se requieren título y texto en alemán para publicar. Los demás idiomas son opcionales. El borrador no reemplaza la versión publicada.","lawPublishConfirm":"¿Publicar la ley {n} en la página pública?","lawNeedGerman":"Se requiere título y texto en alemán para publicar.","lawNumberConflict":"Ese número de ley ya existe.","lawEditConflict":"Esta ley ha cambiado. Recarga la página.","lawUnpublishConfirm":"¿Retirar la ley {n} de la página pública? Se conservarán las versiones anteriores.","lawWithdrawn":"Ley retirada; borrador conservado."}};
const lawCategoryLabels={"de":{"lawCategory":"Kategorie","protection":"Schutz","conduct":"Verhalten","combat":"Kampf","alliance":"Allianz","buildings":"Gebäude","governance":"NAP intern","spending":"3×-Regel","other":"Sonstiges"},"en":{"lawCategory":"Category","protection":"Protection","conduct":"Conduct","combat":"Combat","alliance":"Alliance","buildings":"Buildings","governance":"Governance","spending":"3× rule","other":"Other"},"fr":{"lawCategory":"Catégorie","protection":"Protection","conduct":"Comportement","combat":"Combat","alliance":"Alliance","buildings":"Bâtiments","governance":"Gouvernance","spending":"Règle 3×","other":"Autre"},"es":{"lawCategory":"Categoría","protection":"Protección","conduct":"Conducta","combat":"Combate","alliance":"Alianza","buildings":"Edificios","governance":"Gobierno","spending":"Regla 3×","other":"Otros"}};
const step5Copy={"de":{"logoUpload":"Allianzlogo hochladen","logoHint":"PNG, JPG oder WebP · max. 512 px / 1 MB nach Optimierung.","uploadLogo":"Logo hochladen","removeLogo":"Logo zurücksetzen","discordInvite":"Discord-Einladungslink","discordHint":"Gilt für die Discord-Buttons auf Welcome und im Player Dashboard.","siteLanguagesNote":"Die öffentlichen Seiten unterstützen vollständig DE, EN und FR. ES ist in der Leitung verfügbar; öffentliche ES-Texte fehlen noch.","logoChoose":"Bitte ein Bild auswählen.","logoInvalid":"PNG, JPG oder WebP, maximal 8 MB.","logoUploading":"Logo wird hochgeladen …","logoUploaded":"Logo gespeichert und öffentlich verknüpft.","logoRemoved":"Logo zurückgesetzt.","logoUploadFailed":"Logo konnte nicht gespeichert werden.","logoTooLarge":"Optimiertes Logo zu groß.","inviteInvalid":"Ungültiger Discord-Einladungslink (discord.gg oder discord.com/invite)."},"en":{"logoUpload":"Upload alliance logo","logoHint":"PNG, JPG or WebP · optimized to 512 px / 1 MB.","uploadLogo":"Upload logo","removeLogo":"Reset logo","discordInvite":"Discord invitation link","discordHint":"Updates Discord buttons on Welcome and the Player Dashboard.","siteLanguagesNote":"The public pages fully support DE, EN and FR. ES is supported in Leadership; full public Spanish copy is pending.","logoChoose":"Choose an image.","logoInvalid":"PNG, JPG or WebP, up to 8 MB.","logoUploading":"Uploading logo …","logoUploaded":"Logo saved and linked to public pages.","logoRemoved":"Logo reset.","logoUploadFailed":"Could not save logo.","logoTooLarge":"Optimized logo too large.","inviteInvalid":"Invalid Discord invitation link (discord.gg or discord.com/invite)."},"fr":{"logoUpload":"Importer le logo","logoHint":"PNG, JPG ou WebP · optimisé à 512 px / 1 Mo.","uploadLogo":"Importer","removeLogo":"Réinitialiser","discordInvite":"Lien d’invitation Discord","discordHint":"Modifie les boutons Discord du site et du tableau de bord.","siteLanguagesNote":"Les pages publiques sont disponibles intégralement en DE, EN et FR. ES existe dans la direction, mais les textes publics espagnols ne sont pas encore complets.","logoChoose":"Sélectionne une image.","logoInvalid":"PNG, JPG ou WebP, 8 Mo maximum.","logoUploading":"Import du logo …","logoUploaded":"Logo enregistré et connecté.","logoRemoved":"Logo réinitialisé.","logoUploadFailed":"Enregistrement impossible.","logoTooLarge":"Logo optimisé trop volumineux.","inviteInvalid":"Lien Discord non valide (discord.gg ou discord.com/invite)."},"es":{"logoUpload":"Subir logotipo","logoHint":"PNG, JPG o WebP · 512 px / 1 MB máximo optimizado.","uploadLogo":"Subir","removeLogo":"Restablecer","discordInvite":"Enlace de invitación a Discord","discordHint":"Actualiza los botones de Discord de Welcome y del panel.","siteLanguagesNote":"Las páginas públicas están completas en DE, EN y FR. ES funciona en Dirección, pero falta el contenido público traducido.","logoChoose":"Elige una imagen.","logoInvalid":"PNG, JPG o WebP, máximo 8 MB.","logoUploading":"Subiendo logotipo …","logoUploaded":"Logotipo guardado y vinculado.","logoRemoved":"Logotipo restablecido.","logoUploadFailed":"No se pudo guardar.","logoTooLarge":"Logotipo optimizado demasiado grande.","inviteInvalid":"Enlace de invitación inválido (discord.gg o discord.com/invite)."}};
const step6Copy={"de":{"discordBot":"Discord Event-Bot","discordBotSubtitle":"Nachrichten pro Kingshot-Event einzeln planen · DE / EN / FR / ES auf eigenen Sprachkanälen.","discordBotOffline":"Konfigurationsmodus · Noch kein Bot verbunden","discordBotOfflineDesc":"Alle Einstellungen und Vorlagen werden gespeichert. Es werden noch keine Discord-Nachrichten versendet. Die Bot-Anbindung erfolgt erst nach Abschluss dieser Seite.","botDestinations":"Discord-Zielkanäle","botDestinationHint":"Jede Sprache erhält ihre eigene Nachricht im zugewiesenen Textkanal. IDs kopieren: Discord Entwicklermodus → Rechtsklick → ID kopieren.","saveChannels":"Kanäle speichern","discordGuildId":"Discord-Server-ID","discordEventCatalog":"Alle Kingshot-Events","discordEventSearch":"Events durchsuchen …","botLoading":"Eventkatalog wird geladen …","selectedEvent":"Gewähltes Event","botEventStart":"Eventstart (UTC)","botEventEnd":"Eventende (UTC, optional)","saveEventTimes":"Eventzeiten speichern","botAnchorHint":"Für Nachrichten „X Minuten vor/nach Start“ muss eine genaue UTC-Startzeit vorliegen. Datum/Turnus stammen aus der Eventplanung. Keine Termine werden geschätzt.","botMessages":"Geplante Nachrichten","botUnlimited":"Pro Event beliebig viele unabhängige Nachrichten mit eigenem Auslöser und drei Sprachfassungen.","botAddMessage":"+ Nachricht","botUsePresets":"Vorkonfigurierte Vorlagen hinzufügen","botEditMessage":"Discord-Nachricht planen","botRuleTitle":"Name / Zweck dieser Nachricht","botEventDay":"Eventtag","botTrigger":"Zeitplan","botRelative":"Relativ zum Event","botClock":"Feste Uhrzeit (UTC)","botReference":"Bezugspunkt","botStart":"Eventstart","botEnd":"Eventende","botMinutes":"Minuten Abstand","botBeforeAfter":"Versandzeitpunkt","botBefore":"vorher","botAfter":"nachher","botClockUtc":"Uhrzeit (UTC)","botTimingNote":"Alle Zeiten UTC. Tag 1 ist der erste Eventtag; jede Nachricht wird unabhängig geplant.","botRuleEnabled":"Regel aktivieren (Bot wird später verbunden)","botRuleEnableHint":"Zum Aktivieren müssen DE, EN und FR ausgefüllt sein. Bis zur Bot-Anbindung wird nichts gesendet.","botDelete":"Löschen"},"en":{"discordBot":"Discord Event Bot","discordBotSubtitle":"Schedule each Kingshot event message independently · DE / EN / FR / ES in separate channels.","discordBotOffline":"Configuration mode · Bot not connected","discordBotOfflineDesc":"Settings and templates are saved, but no messages are sent. Bot integration comes after this page is finished.","botDestinations":"Discord destination channels","botDestinationHint":"Each language is delivered to its own text channel. Copy IDs via Discord Developer Mode → right-click → Copy ID.","saveChannels":"Save channels","discordGuildId":"Discord server ID","discordEventCatalog":"All Kingshot events","discordEventSearch":"Search events …","botLoading":"Loading event catalog …","selectedEvent":"Selected event","botEventStart":"Event start (UTC)","botEventEnd":"Event end (UTC, optional)","saveEventTimes":"Save event times","botAnchorHint":"Relative reminders need an exact UTC start time. Dates/recurrence come from the event planner. No dates are guessed.","botMessages":"Scheduled messages","botUnlimited":"Unlimited independent messages per event, with separate timing and all three translations.","botAddMessage":"+ Message","botUsePresets":"Add preset messages","botEditMessage":"Schedule Discord message","botRuleTitle":"Name / purpose","botEventDay":"Event day","botTrigger":"Trigger","botRelative":"Relative to event","botClock":"Fixed UTC time","botReference":"Reference","botStart":"Event start","botEnd":"Event end","botMinutes":"Offset in minutes","botBeforeAfter":"Send timing","botBefore":"before","botAfter":"after","botClockUtc":"Time (UTC)","botTimingNote":"Times are in UTC. Day 1 is the first event day; every message has its own schedule.","botRuleEnabled":"Enable rule (bot connected later)","botRuleEnableHint":"Fill all DE, EN and FR versions to enable. Nothing is sent until bot integration.","botDelete":"Delete"},"fr":{"discordBot":"Bot Discord d'événements","discordBotSubtitle":"Planifier chaque message séparément · DE / EN / FR / ES dans quatre salons.","discordBotOffline":"Configuration · Bot non connecté","discordBotOfflineDesc":"Les paramètres et modèles sont enregistrés, sans envoyer de messages. Le bot sera ajouté après.","botDestinations":"Salons Discord","botDestinationHint":"Chaque langue a son salon. Discord mode développeur → clic droit → Copier l'identifiant.","saveChannels":"Enregistrer les salons","discordGuildId":"ID du serveur Discord","discordEventCatalog":"Tous les événements Kingshot","discordEventSearch":"Rechercher un événement …","botLoading":"Chargement des événements …","selectedEvent":"Événement choisi","botEventStart":"Début (UTC)","botEventEnd":"Fin (UTC, facultatif)","saveEventTimes":"Enregistrer les heures","botAnchorHint":"Un rappel relatif exige l'heure exacte UTC. Les dates proviennent du calendrier; aucune estimation.","botMessages":"Messages programmés","botUnlimited":"Messages illimités par événement, chacun avec son horaire et ses trois textes.","botAddMessage":"+ Message","botUsePresets":"Ajouter des modèles","botEditMessage":"Programmer un message","botRuleTitle":"Titre / objet","botEventDay":"Jour de l'événement","botTrigger":"Déclencheur","botRelative":"Relatif à l'événement","botClock":"Heure fixe (UTC)","botReference":"Référence","botStart":"Début","botEnd":"Fin","botMinutes":"Décalage (minutes)","botBeforeAfter":"Moment d'envoi","botBefore":"avant","botAfter":"après","botClockUtc":"Heure (UTC)","botTimingNote":"Toutes les heures sont UTC. Jour 1 = premier jour. Chaque message est indépendant.","botRuleEnabled":"Activer (bot connecté plus tard)","botRuleEnableHint":"Remplir DE, EN et FR. Aucun envoi avant l'intégration du bot.","botDelete":"Supprimer"},"es":{"discordBot":"Bot de eventos de Discord","discordBotSubtitle":"Planifica cada mensaje por separado · DE / EN / FR / ES en cuatro canales.","discordBotOffline":"Configuración · Bot desconectado","discordBotOfflineDesc":"Configuración y plantillas guardadas. Todavía no se envían mensajes. El bot se añade después.","botDestinations":"Canales de Discord","botDestinationHint":"Cada idioma tiene su canal. Activa modo desarrollador y copia el ID del canal.","saveChannels":"Guardar canales","discordGuildId":"ID de servidor Discord","discordEventCatalog":"Todos los eventos de Kingshot","discordEventSearch":"Buscar eventos …","botLoading":"Cargando eventos …","selectedEvent":"Evento elegido","botEventStart":"Inicio (UTC)","botEventEnd":"Fin (UTC, opcional)","saveEventTimes":"Guardar horas","botAnchorHint":"Las notificaciones relativas requieren una hora UTC exacta. No se estiman fechas.","botMessages":"Mensajes programados","botUnlimited":"Mensajes ilimitados por evento, cada uno con horarios y tres idiomas.","botAddMessage":"+ Mensaje","botUsePresets":"Añadir plantillas","botEditMessage":"Planificar mensaje","botRuleTitle":"Título / propósito","botEventDay":"Día del evento","botTrigger":"Tipo de horario","botRelative":"Relativo al evento","botClock":"Hora fija (UTC)","botReference":"Referencia","botStart":"Inicio","botEnd":"Fin","botMinutes":"Minutos","botBeforeAfter":"Momento","botBefore":"antes","botAfter":"después","botClockUtc":"Hora (UTC)","botTimingNote":"Todas las horas son UTC. Día 1 es el inicio, cada mensaje es independiente.","botRuleEnabled":"Activar regla (bot más adelante)","botRuleEnableHint":"Completa DE, EN y FR. No se envía nada sin el bot.","botDelete":"Eliminar"}};
// Event-Bot is live for NRW. Delivery is still controlled by alliance/global pause gates.
Object.assign(step6Copy.de,{discordBotOffline:"Scheduler integriert · Liveversand freigegeben",
 discordBotOfflineDesc:"Der Bot prüft jede Minute bestätigte Eventtermine und sendet aktive Nachrichten in die Sprachkanäle. Der Versand kann im Bot-Status pausiert werden.",
 botRuleEnabled:"Regel aktivieren",
 botRuleEnableHint:"DE, EN, FR und ES sind Pflicht. Aktivierte Regeln mit bestätigtem Termin werden bei freigegebenem Versand gesendet."});
Object.assign(step6Copy.en,{discordBotOffline:"Scheduler integrated · Live delivery enabled",
 discordBotOfflineDesc:"The bot checks confirmed events every minute and sends active announcements to the configured language channels. Sending can be paused in bot status.",
 botRuleEnabled:"Enable rule",
 botRuleEnableHint:"DE, EN, FR and ES required. Enabled rules with confirmed dates are sent while delivery is approved."});
Object.assign(step6Copy.fr,{discordBotOffline:"Planificateur intégré · Envoi autorisé",
 discordBotOfflineDesc:"Le bot vérifie les événements confirmés chaque minute et envoie les annonces actives dans les salons linguistiques. L’envoi peut être suspendu.",
 botRuleEnabled:"Activer la règle",
 botRuleEnableHint:"DE, EN, FR et ES obligatoires. Les règles actives avec une date confirmée sont envoyées quand l’envoi est autorisé."});
Object.assign(step6Copy.es,{discordBotOffline:"Planificador integrado · Envío autorizado",
 discordBotOfflineDesc:"El bot revisa los eventos confirmados cada minuto y envía los anuncios activos a los canales de idioma. Puedes pausar los envíos en el estado del bot.",
 botRuleEnabled:"Activar regla",
 botRuleEnableHint:"DE, EN, FR y ES obligatorioss. No habrá envíos automáticos sin autorización expresa."});
const step6DaysCopy={"de":{"botEventDays":"Eventtage","saveAllEventTimes":"Zeiten für alle Tage übernehmen","botPresetAllDays":"Tagesvorlagen für alle Eventtage anlegen","botEventStart":"Tagesbeginn (UTC)","botEventEnd":"Tagesende (UTC, optional)","saveEventTimes":"Tageszeiten speichern","botAnchorHint":"Jeder Eventtag kann andere Zeiten und Texte besitzen. Relative Erinnerungen richten sich nach Beginn oder Ende des jeweiligen Tages. Alle Zeiten UTC; keine geschätzten Termine.","botUsePresets":"Vorlage für diesen Tag hinzufügen","botEventDay":"Nachricht am Eventtag","botRelative":"Relativ zum gewählten Eventtag","botStart":"Tagesbeginn","botEnd":"Tagesende","botTimingNote":"Alle Zeiten in UTC. Jeder Eventtag hat eigene Vorlagen und eigene Start-/Endzeiten. Ein Vorlauf vor 00:00 UTC kann am Vortag liegen."},"en":{"botEventDays":"Event days","saveAllEventTimes":"Apply times to all days","botPresetAllDays":"Create templates for every event day","botEventStart":"Day start (UTC)","botEventEnd":"Day end (UTC, optional)","saveEventTimes":"Save daily times","botAnchorHint":"Each event day can have its own texts and times. Relative reminders refer to the start/end of that particular day. UTC only; no estimated dates.","botUsePresets":"Add a template for this day","botEventDay":"Message on event day","botRelative":"Relative to selected event day","botStart":"Start of day","botEnd":"End of day","botTimingNote":"UTC only. Each event day has its own messages and start/end anchors. A reminder before 00:00 UTC may fall on the previous calendar day."},"fr":{"botEventDays":"Jours de l'événement","saveAllEventTimes":"Appliquer les heures à tous les jours","botPresetAllDays":"Créer les modèles de chaque journée","botEventStart":"Début du jour (UTC)","botEventEnd":"Fin du jour (UTC, facultatif)","saveEventTimes":"Enregistrer les horaires du jour","botAnchorHint":"Chaque journée peut avoir ses propres textes et horaires. Les rappels relatifs se réfèrent au début/à la fin de ce jour. Heures UTC, aucune estimation.","botUsePresets":"Ajouter un modèle pour ce jour","botEventDay":"Message le jour","botRelative":"Relatif à la journée choisie","botStart":"Début du jour","botEnd":"Fin du jour","botTimingNote":"Heures UTC. Chaque jour dispose de ses messages et horaires. Un rappel avant minuit UTC peut être envoyé la veille."},"es":{"botEventDays":"Días del evento","saveAllEventTimes":"Aplicar horarios a todos los días","botPresetAllDays":"Crear plantillas para todos los días","botEventStart":"Inicio del día (UTC)","botEventEnd":"Fin del día (UTC, opcional)","saveEventTimes":"Guardar horas del día","botAnchorHint":"Cada día puede tener horas y textos diferentes. Los recordatorios relativos usan el inicio/fin de ese día. Solo UTC, sin fechas estimadas.","botUsePresets":"Añadir plantilla para este día","botEventDay":"Mensaje del día","botRelative":"Relativo al día elegido","botStart":"Inicio del día","botEnd":"Fin del día","botTimingNote":"Solo UTC. Cada día tiene mensajes y horas propias. Un recordatorio anterior a las 00:00 puede enviarse el día anterior."}};
const rosterDossierError={de:{playerUnavailable:"Diese Spielerakte ist nicht verfügbar: Eine gültige Kingshot-Spieler-ID fehlt. Bitte Spielerzuordnung prüfen."},en:{playerUnavailable:"Player dossier unavailable: a valid Kingshot player ID is missing. Check the player record."},fr:{playerUnavailable:"Fiche indisponible : identifiant Kingshot valide manquant. Vérifiez le joueur."},es:{playerUnavailable:"Ficha no disponible: falta un ID Kingshot válido. Revisa el registro."}};
const rightsCopy={
de:{moduleRights:"Modulberechtigungen",rightsHelp:"Schalter aus = Recht entzogen. Zum Übernehmen speichern. Zugriffe sind sofort nach dem Speichern serverseitig wirksam.",undoRights:"Änderungen verwerfen",clearRights:"Alle Modulrechte entziehen",disableStaffAccount:"Zugang vollständig sperren",rightsSelected:"Konto auswählen, um Rechte zu bearbeiten.",rightsCount:"aktive Modulrechte",rightsDisabled:"Zugang gesperrt",rightsProtected:"Administratorkonto · nicht bearbeitbar",rightsEnabled:"Zugang aktiv",rightsNone:"Keine Rechte",rightsClearConfirm:"Wirklich alle Modulrechte für {name} entziehen? Der Zugang bleibt aktiv, aber ohne Modulberechtigungen.",rightsDisableConfirm:"Zugang für {name} vollständig sperren und alle Modulrechte entziehen? Der Spieler kann sich dann nicht mehr anmelden.",rightsCleared:"Alle Modulrechte entzogen.",rightsAccountDisabled:"Zugang vollständig gesperrt.",rightsSaved:"Berechtigungen gespeichert.",rightsAdminNote:"Administratorkonten sind geschützt und haben immer alle Rechte.",rolesFuture:"Wähle einen R4/R5 und verwalte seine Zugriffsrechte. Das Entziehen wirkt sofort nach dem Speichern.",saveR4:"Änderungen speichern",noStaffSelection:"Bitte zuerst einen R4/R5 auswählen."},
en:{moduleRights:"Module permissions",rightsHelp:"Switch off to revoke a permission. Save to apply. Server-side enforcement takes effect immediately.",undoRights:"Discard changes",clearRights:"Revoke all module permissions",disableStaffAccount:"Block account access",rightsSelected:"Select an account to edit rights.",rightsCount:"active module permissions",rightsDisabled:"Account disabled",rightsProtected:"Administrator · cannot edit",rightsEnabled:"Account enabled",rightsNone:"No permissions",rightsClearConfirm:"Revoke all module permissions for {name}? The account remains enabled but without module access.",rightsDisableConfirm:"Disable access for {name} and revoke all permissions? This account will no longer be able to sign in.",rightsCleared:"All module permissions revoked.",rightsAccountDisabled:"Account disabled.",rightsSaved:"Permissions saved.",rightsAdminNote:"Administrator accounts are protected and always have full access.",rolesFuture:"Select an R4/R5 account and manage access. Revoked rights are enforced immediately after saving.",saveR4:"Save changes",noStaffSelection:"Select an R4/R5 first."},
fr:{moduleRights:"Autorisations par module",rightsHelp:"Désactivez le bouton pour retirer un droit, puis enregistrez. Application immédiate côté serveur.",undoRights:"Annuler les modifications",clearRights:"Retirer tous les droits",disableStaffAccount:"Bloquer cet accès",rightsSelected:"Choisissez un compte pour gérer ses droits.",rightsCount:"droits actifs",rightsDisabled:"Compte désactivé",rightsProtected:"Administrateur · modification interdite",rightsEnabled:"Compte actif",rightsNone:"Aucun droit",rightsClearConfirm:"Retirer tous les droits de {name} ? Le compte reste actif mais sans accès aux modules.",rightsDisableConfirm:"Bloquer complètement {name} et retirer tous les droits ? Ce compte ne pourra plus se connecter.",rightsCleared:"Tous les droits retirés.",rightsAccountDisabled:"Accès bloqué.",rightsSaved:"Droits enregistrés.",rightsAdminNote:"Les comptes administrateurs sont protégés et disposent de tous les droits.",rolesFuture:"Choisissez un R4/R5 pour gérer ses droits. Les retraits sont appliqués immédiatement après l'enregistrement.",saveR4:"Enregistrer",noStaffSelection:"Choisissez d'abord un R4/R5."},
es:{moduleRights:"Permisos por módulo",rightsHelp:"Desactiva una opción para quitar su permiso y guarda. Se aplica inmediatamente en el servidor.",undoRights:"Descartar cambios",clearRights:"Quitar todos los permisos",disableStaffAccount:"Bloquear acceso",rightsSelected:"Selecciona una cuenta para editar permisos.",rightsCount:"permisos activos",rightsDisabled:"Cuenta desactivada",rightsProtected:"Administrador · no editable",rightsEnabled:"Cuenta activa",rightsNone:"Sin permisos",rightsClearConfirm:"¿Quitar todos los permisos de {name}? La cuenta seguirá activa, pero sin acceso a módulos.",rightsDisableConfirm:"¿Bloquear por completo la cuenta de {name} y quitar todos los permisos? Ya no podrá iniciar sesión.",rightsCleared:"Permisos retirados.",rightsAccountDisabled:"Cuenta bloqueada.",rightsSaved:"Permisos guardados.",rightsAdminNote:"Las cuentas administradoras están protegidas y tienen acceso completo.",rolesFuture:"Selecciona un R4/R5 para gestionar derechos. Los cambios se aplican inmediatamente al guardar.",saveR4:"Guardar cambios",noStaffSelection:"Primero selecciona un R4/R5."}
};
const STAFF_FEATURES=[["members","roster"],["performance","performance"],["bear","bearManagement"],["fightclub","fightclub"],["participation","participation"],["transfers","transfers"],["laws","laws"],["events","events"],["event_bot","discordBot"],["settings","settings"]];
const STAFF_KEYS=STAFF_FEATURES.map(([key])=>key);
const modulePermission={roster:"members",performance:"performance",bear:"bear",fightclub:"fightclub",participation:"participation"};
const phase2Labels={de:{performance:"Performance",bearManagement:"Bärenfalle",fightclub:"FightClub",participation:"Event-Teilnahme"},
en:{performance:"Performance",bearManagement:"Bear Trap",fightclub:"FightClub",participation:"Event participation"},
fr:{performance:"Performance",bearManagement:"Piège à ours",fightclub:"FightClub",participation:"Participation aux événements"},
es:{performance:"Rendimiento",bearManagement:"Trampa de oso",fightclub:"FightClub",participation:"Participación en eventos"}};
const t=k=>rightsCopy[lang]?.[k]||phase2Labels[lang]?.[k]||rosterDossierError[lang]?.[k]||step6DaysCopy[lang]?.[k]||step6DaysCopy.de[k]||step6Copy[lang]?.[k]||step6Copy.de[k]||step5Copy[lang]?.[k]||lawCategoryLabels[lang]?.[k]||lawUiCopy[lang]?.[k]||manualPhasesCopy[lang]?.[k]||transferUiCopy[lang]?.[k]||powerLabels[lang]?.[k]||rosterLabels[lang]?.[k]||leaderUiCopy[lang]?.[k]||latestModuleCopy[lang]?.[k]||opsUI[lang]?.[k]||groupUI[lang]?.[k]||eventLabels[lang]?.[k]||phase1Labels[lang]?.[k]||staffExtra[lang]?.[k]||copy[lang]?.[k]||lawCategoryLabels.de[k]||lawUiCopy.de[k]||manualPhasesCopy.de[k]||transferUiCopy.de[k]||powerLabels.de[k]||rosterLabels.de[k]||leaderUiCopy.de[k]||latestModuleCopy.de[k]||opsUI.de[k]||groupUI.de[k]||eventLabels.de[k]||phase1Labels.de[k]||staffExtra.de[k]||copy.de[k]||k;
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
 if(!["overview","roster","performance","bear","fightclub","participation","transfers","laws","events","discord","settings"].includes(name))return;
 if(name==="bear"&&!bearManagement.enabled)return;
 if(name==="fightclub"&&!fightclub.enabled)return;
 if(name==="participation"&&!participation.enabled)return;
 if(name==="performance"&&!performance.enabled)return;
 const required=modulePermission[name]||(["transfers","laws","events","settings"].includes(name)?name:null);
 if(required&&state&&!can(required))name="overview";
  if(name==="discord"&&state&&!can("events")&&!can("settings"))name="overview";
 tab=name;q(".tab-page").forEach(p=>p.hidden=p.dataset.page!==name);
 q(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));
 $("pageLabel").textContent=t(name);
 history.replaceState(null,"",LEITUNG_PATH+(name==="overview"?"":"?tab="+encodeURIComponent(name)));
  if(name==="discord"&&state)Promise.all([discordPlanner.open(lang),eventBotStatusPanel.refresh()]).catch(e=>flash(String(e.message),true));
  if(name==="performance"&&state)performance.open();
  if(name==="bear"&&state)bearManagement.open();
  if(name==="fightclub"&&state)fightclub.open();
  if(name==="participation"&&state)participation.open();
  if(name==="transfers"&&state)eventLoans.open();
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
 const pageMatch=/^discord-bot:(\d+)$/.exec(mode);
  const queryMode=pageMatch?"discord-bot":mode;
  const suffix=pageMatch?"&page="+pageMatch[1]:"";
  const response=await fetch(FUNCTION+"?alliance=NRW&mode="+encodeURIComponent(queryMode)+suffix,options);
 const value=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(value.error||"http_"+response.status);
 return value;
}
function can(feature){return state?.staff?.is_owner===true||state?.staff?.permissions?.[feature]===true;}
function grantButtons(){
 q("[data-permission]").forEach(el=>{el.disabled=!can(el.dataset.permission);el.title=el.disabled?t("permissionDenied"):"";});
 for(const el of q(".nav-item[data-tab]")){
  const required=modulePermission[el.dataset.tab]||(["transfers","laws","events","settings"].includes(el.dataset.tab)?el.dataset.tab:null);
  el.hidden=el.dataset.tab==="discord"?!can("event_bot"):
   ["performance","bear","fightclub","participation"].includes(el.dataset.tab)?
     !(el.dataset.tab==="performance"?performance.enabled:el.dataset.tab==="bear"?bearManagement.enabled:el.dataset.tab==="fightclub"?fightclub.enabled:participation.enabled)||!can(required):Boolean(required&&!can(required));
 }
}
let powerSyncStarted=false;
async function syncPlayerPower(){
 if(!state||!can("members"))return;
 const button=$("syncPlayerPower"),status=$("powerSyncStatus");
 button.disabled=true;status.textContent=t("powerFetching");
 try{
   const result=await request("bootstrap",{action:"power_sync"});
   status.textContent=t("powerUpdated").replace("{n}",result.matched||0)+(result.source==="cache"?" · "+t("powerCached"):"");
   await refresh();
 }catch(e){
   status.textContent=t("powerUpdateError")+": "+String(e.message||"unknown");
 }finally{button.disabled=!can("members");}
}
const eventHub=createEventHub({request,flash,esc,t});
 const discordPlanner=createDiscordEventPlanner({request,flash,esc,can,eventHub});
const eventBotStatusPanel=createEventBotStatusPanel({supabase,flash,can,esc});
const operations=createOperations({getState:()=>state,request,flash,esc,t,can,refresh});
const relationships=createMemberRelationships({getState:()=>state,getLanguage:()=>lang,request,esc,flash,
  reloadDossier:async gameId=>{$("editDialog").close();await refresh();openEdit("member",gameId);}});
const performance=createPerformance({getState:()=>state,getLanguage:()=>lang,request,esc,
  openPlayer:gameId=>openEdit("member",gameId)});
const bearManagement=createBearManagement({getState:()=>state,getLanguage:()=>lang,request,esc,flash,
  openPlayer:gameId=>openEdit("member",gameId)});
const fightclub=createFightClub({getState:()=>state,getLanguage:()=>lang,request,esc,flash,
  openPlayer:gameId=>openEdit("member",gameId)});
const participation=createEventParticipation({getState:()=>state,getLanguage:()=>lang,request,esc,flash,
  openPlayer:gameId=>openEdit("member",gameId),navigate:name=>setTab(name)});
const eventLoans=createEventLoans({getState:()=>state,getLanguage:()=>lang,request,esc,flash});
function showLogin(message=""){
 $("liveArea").hidden=true;$("loginArea").hidden=false;$("logoutBtn").hidden=true;
 $("roleChip").textContent="R4 / R5";$("loginError").textContent=message;$("changePasswordBtn").hidden=true;
}
function showLive(){
 $("loginArea").hidden=true;$("liveArea").hidden=false;$("logoutBtn").hidden=false;
 $("roleChip").textContent=state.staff.is_owner&&state.staff.rank!=="R5"?"Admin · "+state.staff.rank:state.staff.rank;$("changePasswordBtn").hidden=false;grantButtons();render();
}
async function refresh(){
 const data=await request();
 if(!data?.alliance||!data?.staff)throw new Error("not_authorized");
 state=data;
 if(!localStorage.getItem("nrw_page_lang")&&LANGS.includes(state.alliance.default_language))lang=state.alliance.default_language;
 showLive();
 if(!powerSyncStarted&&can("members")){
   powerSyncStarted=true;
   Promise.resolve().then(syncPlayerPower);
 }
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
// Roster display maps language codes and encoded Town Center stages without changing source records.
const flagCountry={de:"de",en:"gb",fr:"fr",es:"es",tr:"tr",it:"it",pt:"pt",pl:"pl",nl:"nl",ru:"ru",uk:"ua",ro:"ro",hu:"hu",cs:"cz",sv:"se",da:"dk",fi:"fi",no:"no",fa:"ir",ar:"sa",zh:"cn",ja:"jp",ko:"kr",hi:"in"};
const playerLangNames={...NAMES,tr:"Türkçe",it:"Italiano",pt:"Português",pl:"Polski",nl:"Nederlands",ru:"Русский",uk:"Українська",ro:"Română",hu:"Magyar",cs:"Čeština",sv:"Svenska",da:"Dansk",fi:"Suomi",no:"Norsk",fa:"فارسی",ar:"العربية",zh:"中文",ja:"日本語",ko:"한국어",hi:"हिन्दी"};
function languageChips(list,short=true){
 if(!Array.isArray(list)||!list.length)return '<span class="muted">—</span>';
 return [...new Set(list.filter(Boolean).map(x=>String(x).trim().toLowerCase()))].map(raw=>{
  const code=raw.slice(0,2),country=flagCountry[code],title=playerLangNames[code]||raw;
  const icon=country?'<img src="https://flagcdn.com/24x18/'+country+'.png" width="24" height="18" loading="lazy" decoding="async" alt="'+esc(title)+'" referrerpolicy="no-referrer">':
    '<abbr title="'+esc(title)+'">'+esc(raw.slice(0,4).toUpperCase())+'</abbr>';
  return '<span class="player-language" title="'+esc(title)+'" aria-label="'+esc(title)+'">'+icon+(short?"":' <small>'+esc(title)+'</small>')+'</span>';
 }).join(" ");
}
function cityLevel(raw){
 const n=Number(raw);if(!Number.isInteger(n)||n<1||n>200)return "—";
 if(n<=30)return "TC "+n;
 const stage=(n-30)%5,completed=Math.floor((n-30)/5);
 return stage===0?"TG "+completed:(completed===0?"TC 30":"TG "+completed)+" · "+stage+"/5";
}
function formattedPower(value){
 if(value==null||value===""||!Number.isFinite(Number(value)))return "—";
 return new Intl.NumberFormat({de:"de-DE",en:"en-GB",fr:"fr-FR",es:"es-ES"}[lang],{notation:"compact",maximumFractionDigits:1}).format(Number(value));
}
function renderRoster(){
 const search=$("rosterSearch").value.toLowerCase().trim(),status=$("rosterStatus").value,sort=$("rosterSort").value;
 const list=state.players.filter(p=>(!search||String(p.name||"").toLowerCase().includes(search)||String(p.game_id||"").includes(search))&&(status==="all"||p.member_status===status)).slice();
 list.sort((a,b)=>sort==="power"?(Number(b.power??-1)-Number(a.power??-1)):sort==="rank"?(Number(b.rank||0)-Number(a.rank||0)):sort==="id"?String(a.game_id).localeCompare(String(b.game_id)):String(a.name||"").localeCompare(String(b.name||""),lang));
 $("rosterCount").textContent=fmtInt(list.length);
 $("rosterRows").innerHTML=list.length?list.map(p=>{
  const id=esc(p.game_id||""),name=esc(p.name),avatar=/^https:\/\//i.test(p.avatar_url||"")?'<img class="avatar" src="'+esc(p.avatar_url)+'" alt="">':'<span class="avatar">'+esc((p.name||"?").slice(0,1))+'</span>';
  return '<tr><td><div class="person">'+avatar+'<div><strong>'+name+'</strong><small>'+id+relationships.rowBadge(p)+(p.is_event_loan?' · ⏱ '+esc(p.current_alliance||"")+" ("+esc(p.event_loan_type||"")+")":'')+'</small></div></div></td><td>'+'<span class="rank-and-tg"><strong>'+esc(p.rank?"R"+p.rank:"—")+'</strong><span class="level">· '+esc(cityLevel(p.tc_level))+'</span></span>'+'</td><td>'+(p.power==null?'<span class="muted">'+esc(t("noPower"))+'</span>':'<strong title="'+esc(fmtInt(p.power))+'">'+esc(formattedPower(p.power))+'</strong><small title="'+esc(p.power_source||"")+'">'+esc(dateText(p.power_observed_at))+'</small>')+'</td><td>'+languageChips(p.languages)+'</td><td>'+'<span class="discord-presence '+(p.discord_connected?"connected":"unlinked")+'" title="'+esc(p.discord_connected?t("discordLinked"):t("discordUnlinked"))+'">'+esc(p.discord_connected?t("yes"):t("no"))+'</span>'+'</td><td>'+badge(p.member_status)+'</td><td><button type="button" class="action-link" data-edit-member="'+id+'" aria-label="'+esc(t("dossier"))+' · '+name+'" '+(!can("members")?"disabled":"")+'>'+esc(t("dossier"))+'</button></td></tr>';
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
  const candidatePic=x.avatar_url||state.players.find(p=>String(p.game_id)===String(x.game_id))?.avatar_url||"";
  const photo=/^https:\/\//i.test(candidatePic)?'<img class="avatar" src="'+esc(candidatePic)+'" alt="" loading="lazy" referrerpolicy="no-referrer">':
    '<span class="avatar">'+esc((x.player_name||"?").slice(0,1))+'</span>';
  return '<tr><td><div class="person">'+photo+'<div><strong>'+esc(x.player_name||"—")+'</strong><small>'+esc(x.game_id)+' · '+esc(t("priority"))+': '+esc(x.priority===1?t("high"):x.priority===3?t("low"):t("normal"))+(x.invitation_type==="special"?" · "+esc(t("inviteSpecial")):"")+
   (x.contact_staff_user_id?" · "+esc(t("contactOwner"))+": "+esc((state.transferContacts||[]).find(p=>p.user_id===x.contact_staff_user_id)?.label||"—"):"")+'</small></div></div></td><td>'+badge(x.direction,x.direction==="incoming"?t("directionIncoming"):t("directionOutgoing"))+'</td><td>'+esc([x.origin_kingdom?"#"+x.origin_kingdom:"",x.previous_alliance||""].filter(Boolean).join(" · ")||"—")+'</td><td>'+esc(destination)+'</td><td>'+esc([x.window_start,x.window_end].filter(Boolean).map(dateText).join(" → ")||"—")+'</td><td>'+badge(x.status)+verified+'</td><td><button class="action-link" data-edit="transfer" data-id="'+esc(x.id)+'" '+(!can("transfers")?"disabled":"")+'>'+esc(t("edit"))+'</button></td></tr>';
 }).join(""):empty(t("noTransfers"));
 const moves=state.internalMoves||[],search=$("internalMoveSearch").value.toLowerCase().trim(),
    direction=$("internalMoveDirection").value,period=$("internalMovePeriod").value;
 const since=period==="all"?null:Date.now()-Number(period)*86400000;
 const filteredMoves=moves.filter(m=>(!search||String(m.player_name||"").toLowerCase().includes(search)||
      String(m.game_id||"").includes(search)||String(m.from_alliance||"").toLowerCase().includes(search)||
      String(m.to_alliance||"").toLowerCase().includes(search))&&
     (direction==="all"||direction==="in"&&m.to_alliance==="NRW"||direction==="out"&&m.from_alliance==="NRW")&&
     (since===null||Date.parse(m.moved_at)>=since));
 $("internalMoveCount").textContent=fmtInt(moves.length);
 $("internalMoveShown").textContent=fmtInt(filteredMoves.length)+" / "+fmtInt(moves.length);
 $("internalMoveRows").innerHTML=filteredMoves.length?filteredMoves.map(m=>'<tr><td>'+esc(dateText(m.moved_at))+'</td><td><b>'+esc(m.player_name||"—")+'</b><small>'+esc(m.game_id||"—")+'</small></td><td>'+esc(m.from_alliance||"—")+'</td><td>→</td><td>'+esc(m.to_alliance||"—")+'</td></tr>').join(""):'<tr><td colspan="5" class="empty">'+esc(t("noMoves"))+'</td></tr>';
}
function renderLaws(){
 const laws=(state.laws||[]).filter(x=>x.scope==="kingdom").slice().sort((a,b)=>
  String(a.number).localeCompare(String(b.number),lang,{numeric:true,sensitivity:"base"}));
 const publicVersions=new Map((state.lawPublications||[]).map(p=>[p.law_id,p]));
 $("lawList").innerHTML=laws.length?laws.map(x=>{
  const published=publicVersions.get(x.id),hasDraft=published&&Number(x.version)>Number(published.version);
  const description=published?
    t("lawPublicVersion").replace("{n}",String(published.version))+
      (hasDraft?" · "+t("lawUnpublishedChanges").replace("{n}",String(x.version)):""):
    t("lawOnlyDraft").replace("{n}",String(x.version));
  return '<article class="list-card server-law-item"><div><span class="eyebrow">'+esc(t("kingdom"))+' · '+esc(x.number)+'</span>'+
    '<h3>'+esc(txt(x.title)||t("lawTitle"))+'</h3><p class="muted">'+esc(t(x.category||"other"))+'</p><p>'+esc(description)+'</p>'+
    '<small class="muted">'+esc(t("editedAt"))+' '+esc(dateText(x.updated_at))+'</small></div>'+
    '<div class="card-actions">'+badge(published?"published":"draft")+
    '<button type="button" data-edit="law" data-id="'+esc(x.id)+'" class="ghost" '+(!can("laws")?"disabled":"")+'>'+esc(t("edit"))+'</button>'+
    '<button type="button" class="ghost" data-law-history="'+esc(x.id)+'" '+(!can("laws")?"disabled":"")+'>'+esc(t("lawHistory"))+'</button>'+
    (published?'<button type="button" class="ghost law-withdraw" data-law-unpublish="'+esc(x.id)+'" '+(!can("laws")?"disabled":"")+'>'+esc(t("lawWithdraw"))+'</button>':"")+
    '</div></article>';
 }).join(""):'<div class="card empty">'+esc(t("noServerLaws"))+'</div>';
}

function renderEvents(){
 const list=state.events.slice().sort((a,b)=>Date.parse(a.start_at)-Date.parse(b.start_at));
 $("eventList").innerHTML=list.length?list.map(x=>'<article class="list-card"><div><span class="eyebrow">'+esc(localTime(x.start_at))+' <span class="muted">· '+esc(new Date(x.start_at).toISOString().slice(11,16))+' UTC</span></span><h3>'+esc(txt(x.title))+'</h3><p>'+esc(txt(x.description)||x.requirements||"")+'</p></div><div class="card-actions">'+badge(x.status)+'<button data-edit="event" data-id="'+esc(x.id)+'" class="ghost" '+(!can("events")?"disabled":"")+'>'+esc(t("edit"))+'</button></div></article>').join(""):'<div class="card empty">'+esc(t("noEvents"))+'</div>';
}
function renderSettings(){
 const config=state.alliance, form=$("settingsForm");
 for(const name of ["name","capacity","discord_invite_url"]){form.elements[name].value=config[name]??"";}
 const preview=config.logo_url||"../assets/nrw-banner.svg";
 $("logoPreview").src=preview;
 q("[data-alliance-logo]").forEach(img=>img.src=preview);
 $("removeAllianceLogo").disabled=!can("settings")||!config.logo_url;
 form.elements.advertising_enabled.checked=Boolean(config.advertising_enabled);
 q("#activeLanguages input").forEach(x=>x.checked=(config.languages||[]).includes(x.value));
 $("defaultLanguage").value=config.default_language;
 const options=STAFF_FEATURES.map(([key,label])=>[key,t(label)]);
 const grants=(state.staffMembers||[]).filter(x=>/^leader-[0-9]+@accounts\.allianceos\.invalid$/i.test(x.email||""));
 $("permissionTable").innerHTML='<div><strong>'+esc(t("permissions"))+'</strong><b>R4/R5</b></div>'+
   options.map(([feature,label])=>'<div><span>'+esc(label)+'</span><b>'+
     esc(state.staff.is_owner?(grants.filter(x=>x.enabled&&(x.is_admin||x.permissions?.[feature]===true)).length+" / "+grants.length):(can(feature)?"✓":"—"))+
     '</b></div>').join("")+'<p class="small-note">'+esc(t("individualRights"))+'</p>';
 $("staffControls").hidden=!state.staff.is_owner;
 const members=(state.staffMembers||[]).filter(x=>x.email);
 const lookupName=email=>{
    const m=/^leader-([0-9]+)@accounts\.allianceos\.invalid$/i.exec(email||"");
    const p=m&&state.players.find(x=>String(x.game_id)===m[1]);
    return p?String(p.name):t("legacyAdmin");
 };
 $("staffList").innerHTML=members.length?'<p class="eyebrow">'+esc(t("staffList"))+'</p>'+
 members.map(m=>{
   const protectedAccount=m.is_admin||m.protected_account||!/^leader-[0-9]+@accounts\.allianceos\.invalid$/i.test(m.email||"");
   const activeCount=protectedAccount?STAFF_KEYS.length:STAFF_KEYS.filter(k=>m.permissions?.[k]===true).length;
   const status=protectedAccount?t("rightsProtected"):m.enabled?t("rightsEnabled"):t("rightsDisabled");
   return '<button type="button" class="staff-row staff-access-row'+(selectedStaffEmail===m.email?" selected":"")+'" data-staff-email="'+esc(m.email)+'" aria-pressed="'+(selectedStaffEmail===m.email)+'" '+
     (protectedAccount?"disabled":"")+'><span><b>'+esc(lookupName(m.email))+'</b><small>'+esc(m.rank)+' · '+esc(status)+'</small></span>'+
     '<span class="staff-rights-count">'+(protectedAccount?"★":activeCount+" / "+STAFF_KEYS.length)+
       '<small>'+esc(t("rightsCount"))+'</small></span></button>';
 }).join(""):"";
 const sel=$("staffAccountSelect");
 sel.innerHTML='<option value="">'+esc(t("chooseLeader"))+'</option>'+
 members.filter(x=>/^leader-/.test(x.email||"")).map(x=>
   '<option value="'+esc(x.email)+'" '+(x.is_admin||x.protected_account?"disabled":"")+'>'+esc(lookupName(x.email))+(x.is_admin?" · "+esc(t("rightsProtected")):"")+'</option>').join("");
 const selected=members.find(m=>m.email===selectedStaffEmail&&!m.is_admin&&!m.protected_account);
 if(!selected)selectedStaffEmail="";
 sel.value=selectedStaffEmail;
 const rights=$("staffRightsFieldset"),permissionForm=$("r4Form");
 rights.disabled=!selected;
 for(const key of STAFF_KEYS)permissionForm.elements[key].checked=selected?.permissions?.[key]===true;
 permissionForm.elements.enabled.checked=selected?.enabled===true;
 $("staffSelectionInfo").textContent=selected?
  lookupName(selected.email)+" · "+selected.rank+" · "+(selected.enabled?t("rightsEnabled"):t("rightsDisabled")):
  t("rightsSelected");
 for(const id of ["staffSaveRights","staffUndoRights","staffClearRights","staffDisableAccount"]){
   $(id).disabled=!selected||(id==="staffDisableAccount"&&!selected.enabled);
 }
 if(!members.length)$("staffSelectionInfo").textContent=t("rightsSelected");
}
function render(){patchTranslations();counts();renderRoster();renderTransfers();renderLaws();renderEvents();renderSettings();eventLoans.render();eventHub.render(state,lang,can("events"));discordPlanner.render(lang);operations.render();}
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
 // A dossier must resolve to one immutable game ID. Previously invalid rows
 // with no ID silently returned here and appeared as unresponsive buttons.
 if(entity==="member"&&!record){flash(t("playerUnavailable"),true);return;}
 editing={entity,id:entity==="member"?(record?.note_id||null):id,record};
 $("modalTitle").textContent=t((id?"edit":"new")+(entity==="member"?"Player":entity.charAt(0).toUpperCase()+entity.slice(1)));
 let h="";
 if(entity==="transfer"){
   const s=record||{direction:sourcePlayer?"outgoing":"incoming",status:"interested",target_alliance:"NRW",game_id:sourcePlayer?.game_id||"",player_name:sourcePlayer?.name||"",origin_kingdom:sourcePlayer?state.alliance.kingdom_id:"",power:sourcePlayer?.power||""};
   h='<div class="transfer-id-row">'+control(t("playerId"),"game_id",s.game_id||"","text",{required:"required",pattern:"[0-9]+",maxlength:20})+
     '<button type="button" class="ghost" id="lookupTransferPlayer">'+esc(t("lookupPlayer"))+'</button></div>'+
     '<span id="transferLookupStatus" class="small-note" aria-live="polite"></span>'+
     '<div class="transfer-profile-preview" id="transferProfilePreview" hidden></div>'+
     '<input type="hidden" name="avatar_url" value="'+esc(s.avatar_url||"")+'">'+
     '<div class="form-grid">'+control(t("playerName"),"player_name",s.player_name||"","text",{maxlength:100})+
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
     control(t("to"),"window_end",s.window_end||"","date")+'</div>'+
     '<p class="small-note">'+esc(t("externalNote"))+'</p>'+textarea(t("notes"),"notes",s.notes||"")+
     (s.direction==="incoming"&&s.status==="completed"?'<label class="field check"><input type="checkbox" name="confirm_arrival" '+(s.arrival_confirmed_at?"checked disabled":"")+' > '+esc(t("confirmObservedArrival"))+'</label>':"")+
     '<p class="small-note">'+esc(t("transferInternalOnly"))+'</p>';
 }else if(entity==="law"){
   const s=record||{scope:"kingdom",status:"draft",title:{},body:{}};
   h='<div class="form-grid">'+select(t("scope"),"scope","kingdom",[["kingdom",t("kingdom")]])+
      control(t("lawNumber"),"number",s.number||"","text",{required:"required",maxlength:30})+
      select(t("lawCategory"),"category",s.category||"other",
        ["protection","conduct","combat","alliance","buildings","governance","spending","other"]
          .map(c=>[c,t(c)]))+
      select(t("status"),"status","draft",[["draft",t("lawSaveDraft")],["published",t("lawPublishNow")]])+'</div>'+
      '<p class="notice-inline">'+esc(t("lawEditorTip"))+'</p>';
   h+=LANGS.map(l=>'<hr class="form-break"><span class="eyebrow">'+esc(NAMES[l])+(l==="de"?" *":"")+'</span>'+
     control(t("lawTitle"),"title_"+l,s.title?.[l]||"","text",{maxlength:150})+
     textarea(t("lawText"),"body_"+l,s.body?.[l]||"")).join("");
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
      '<div><small>'+esc(t("cityLevel"))+'</small><b>'+esc(cityLevel(record.tc_level))+'</b></div>'+
      '<div><small>'+esc(t("strength"))+'</small><b>'+esc(record.power==null?t("noPower"):formattedPower(record.power))+'</b></div></div>'+
      '<p class="small-note">'+esc(t("sourceNote"))+'</p>'+
      select(t("memberStatus"),"member_status",record.member_status,[["active",t("active")],["planned",t("planned")],["left",t("left")]])+
      '<div class="form-grid"><div class="field"><span>'+esc(t("discordPresence"))+'</span><p class="discord-presence '+(record.discord_connected?"connected":"unlinked")+'">'+esc(record.discord_connected?t("yes"):t("no"))+'</p><small>'+esc(record.discord_connected?t("discordLinked"):t("discordUnlinked"))+'</small></div>'+
      control(t("joined"),"joined_on",record.joined_on||"","date")+
      control(t("powerInput"),"power_override",record.power_override??"","number",{min:0,max:9999999999999,step:1})+'</div><p class="small-note">'+esc(t("powerHelp"))+'</p>'+
      relationships.editorFields(record)+
      '<div class="field"><span>'+esc(t("spoken"))+'</span><div class="language-options">'+[...LANGS,"tr"].map(l=>'<label class="check"><input type="checkbox" name="spoken_languages" value="'+l+'" '+((record.languages||[]).includes(l)?"checked":"")+'> '+esc(playerLangNames[l]||l)+'</label>').join("")+'</div></div>'+
      control(t("otherSpoken"),"other_spoken",(record.languages||[]).filter(l=>![...LANGS,"tr"].includes(l)).join(", "),"text",{maxlength:400})+
      textarea(t("responsibilities"),"responsibilities",record.responsibilities||"")+
      textarea(t("notes"),"notes",record.notes||"")+
      '<hr class="form-break"><h3>'+esc(t("worldTransfers"))+'</h3>'+
      (external.length?external.map(x=>'<div class="history-item"><b>#'+esc(x.origin_kingdom)+' → #'+esc(x.target_kingdom||state.alliance.kingdom_id)+'</b> · '+esc(t(x.status))+' · '+esc(x.window_start||"—")+'</div>').join(""):'<p class="muted">'+esc(t("noHistory"))+'</p>')+
      '<h3>'+esc(t("serverMoves"))+'</h3>'+
      (internal.length?internal.map(x=>'<div class="history-item">'+esc(dateText(x.moved_at))+' · '+esc(x.from_alliance||"—")+' → '+esc(x.to_alliance||"—")+'</div>').join(""):'<p class="muted">'+esc(t("noHistory"))+'</p>')+
      
      (can("transfers")?'<button type="button" class="ghost" data-plan-player="'+esc(record.game_id)+'">'+esc(t("serverTransfer"))+' →</button>':"")+
      (can("transfers")?'<button type="button" class="ghost" data-loan-player="'+esc(record.game_id)+'">⏱ Event-Ausleihe →</button>':"");
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
       form.elements.avatar_url.value=p.avatar_url||"";
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
 const dialog=$("editDialog");
 if(dialog.open)dialog.close();
 dialog.showModal();
 if(entity==="member"&&record)relationships.activate(record);
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
 if(entity==="law"){
   if(data.status==="published"){
     if(!data.title.de||!data.body.de){flash(t("lawNeedGerman"),true);return;}
     if(!window.confirm(t("lawPublishConfirm").replace("{n}",String(data.number||""))))return;
   }
 }
 if(entity==="transfer"){
    data.share_approved=record?.share_approved??false;
    data.confirm_arrival=fd.has("confirm_arrival");
  }
 if(entity==="member"){
    data.game_id=record.game_id;
    const other=String(fd.get("other_spoken")||"").split(/[,;]/).map(v=>v.trim()).filter(Boolean);
    data.spoken_languages=[...new Set([...fd.getAll("spoken_languages"),...other])];
    relationships.appendSaveData(data,fd);
  }
 $("submitDialog").disabled=true;
 try{
   await request("bootstrap",{action:"save",entity,id,data});
   $("editDialog").close();await refresh();setTab(entity==="member"?"roster":entity==="law"?"laws":entity==="event"?"events":"transfers");flash(t("saved"));
 }catch(e){
   const key=entity==="law"?({law_number_exists:"lawNumberConflict",version_conflict:"lawEditConflict",
     law_requires_german:"lawNeedGerman",incomplete_law:"lawNeedGerman"}[e.message]):null;
   flash(key?t(key):t("genericError")+" ("+e.message+")",true);
 }
 finally{$("submitDialog").disabled=false;}
}
q(".nav-item").forEach(el=>el.addEventListener("click",()=>setTab(el.dataset.tab)));
q("[data-jump]").forEach(el=>el.addEventListener("click",()=>setTab(el.dataset.jump)));
$("language").addEventListener("change",e=>{lang=e.target.value;localStorage.setItem("nrw_page_lang",lang);if(state){render();if(tab==="performance")performance.render();if(tab==="bear")bearManagement.render();if(tab==="fightclub")fightclub.render();if(tab==="participation")participation.render();if(tab==="transfers")eventLoans.render();}else{patchTranslations();loadLeaderList();$("toggleLegacyLogin").textContent=t(legacyLogin?"normalSignIn":"legacySignIn");}});
$("themeToggle").addEventListener("click",()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;localStorage.setItem("nrw_theme",next);});
$("syncPlayerPower").addEventListener("click",syncPlayerPower);
$("rosterSearch").addEventListener("input",()=>state&&renderRoster());
$("rosterStatus").addEventListener("change",()=>state&&renderRoster());
$("rosterSort").addEventListener("change",()=>state&&renderRoster());
// Listen on the persistent table body: search/sort replace its rows every time.
$("rosterRows").addEventListener("click",e=>{
 const button=e.target.closest("[data-edit-member]");
 if(!button||button.disabled)return;
 e.preventDefault();
 try{openEdit("member",button.dataset.editMember);}
 catch(error){
   console.error("Player dossier failed to open",error);
   flash(t("genericError")+" ("+String(error?.message||error)+")",true);
 }
});
$("modalFields").addEventListener("click",event=>{
  const button=event.target.closest("[data-related-player]");
  if(!button||!state)return;
  event.preventDefault();
  const other=state.players.find(p=>String(p.game_id)===String(button.dataset.relatedPlayer));
  if(!other)return;
  $("editDialog").close();
  openEdit("member",other.game_id);
});
$("transferFilter").addEventListener("change",()=>state&&renderTransfers());
$("transferWindowFilter").addEventListener("change",()=>state&&renderTransfers());
 for(const id of ["internalMoveSearch","internalMoveDirection","internalMovePeriod"])
   $(id).addEventListener(id==="internalMoveSearch"?"input":"change",()=>state&&renderTransfers());
q("[data-create]").forEach(el=>el.addEventListener("click",()=>openEdit(el.dataset.create)));
document.addEventListener("click",e=>{
  const loan=e.target.closest("[data-loan-player]");
  if(loan){$("editDialog").close();setTab("transfers");eventLoans.selectPlayer(loan.dataset.loanPlayer);return;}
  const plan=e.target.closest("[data-plan-player]");if(plan){const p=state.players.find(x=>x.game_id===plan.dataset.planPlayer);if(p){$("editDialog").close();openEdit("transfer",null,p);}return;}
 const edit=e.target.closest("[data-edit]");if(edit)openEdit(edit.dataset.edit,edit.dataset.id);
});
$("closeDialog").addEventListener("click",()=>$("editDialog").close());
$("cancelDialog").addEventListener("click",()=>$("editDialog").close());
$("editForm").addEventListener("submit",saveDialog);
function chooseStaffAccount(email,scroll=false){
 const member=(state?.staffMembers||[]).find(m=>m.email===email);
 selectedStaffEmail=member&&!member.is_admin&&!member.protected_account&&/^leader-/.test(email)?email:"";
 renderSettings();
 if(scroll&&selectedStaffEmail)$("r4Form").scrollIntoView({behavior:"smooth",block:"center"});
}
$("staffList").addEventListener("click",e=>{
 const item=e.target.closest("[data-staff-email]");
 if(item)chooseStaffAccount(item.dataset.staffEmail,true);
});
$("staffAccountSelect").addEventListener("change",e=>chooseStaffAccount(e.target.value));
$("staffUndoRights").addEventListener("click",()=>chooseStaffAccount(selectedStaffEmail));
async function saveStaffChanges(email,permissions,enabled,successKey){
 const selected=(state?.staffMembers||[]).find(m=>m.email===email&&!m.is_admin&&!m.protected_account);
 if(!state?.staff?.is_owner||!selected){flash(t("noStaffSelection"),true);return;}
 const controls=["staffSaveRights","staffUndoRights","staffClearRights","staffDisableAccount"];
 controls.forEach(id=>$(id).disabled=true);
 try{
  await request("bootstrap",{action:"staff",email,permissions,enabled});
  selectedStaffEmail=email;
  await refresh();setTab("settings");flash(t(successKey));
 }catch(error){
  flash(t("genericError")+" ("+(error?.message||"unknown")+")",true);
 }finally{
  if(state)renderSettings();
 }
}
$("r4Form").addEventListener("submit",async e=>{
 e.preventDefault();
 if(!selectedStaffEmail)return flash(t("noStaffSelection"),true);
 const form=e.currentTarget,fd=new FormData(form),permissions={};
 for(const key of STAFF_KEYS)permissions[key]=fd.has(key);
 await saveStaffChanges(selectedStaffEmail,permissions,fd.has("enabled"),"rightsSaved");
});
$("staffClearRights").addEventListener("click",async()=>{
 const staff=(state?.staffMembers||[]).find(x=>x.email===selectedStaffEmail);
 if(!staff)return;
 const person=state.players.find(p=>selectedStaffEmail.includes("leader-"+p.game_id+"@"));
 const label=person?.name||staff.rank;
 if(!window.confirm(t("rightsClearConfirm").replace("{name}",label)))return;
 await saveStaffChanges(staff.email,Object.fromEntries(STAFF_KEYS.map(k=>[k,false])),staff.enabled,"rightsCleared");
});
$("staffDisableAccount").addEventListener("click",async()=>{
 const staff=(state?.staffMembers||[]).find(x=>x.email===selectedStaffEmail);
 if(!staff)return;
 const person=state.players.find(p=>selectedStaffEmail.includes("leader-"+p.game_id+"@"));
 const label=person?.name||staff.rank;
 if(!window.confirm(t("rightsDisableConfirm").replace("{name}",label)))return;
 await saveStaffChanges(staff.email,Object.fromEntries(STAFF_KEYS.map(k=>[k,false])),false,"rightsAccountDisabled");
});
$("settingsForm").addEventListener("submit",async(e)=>{
 e.preventDefault();if(!can("settings"))return;
 const fd=new FormData(e.currentTarget),values=Object.fromEntries(fd.entries());
 const languages=q("#activeLanguages input:checked").map(x=>x.value),default_language=$("defaultLanguage").value;
  if(!languages.includes(default_language)){flash(t("genericError"),true);return;}
  if(!languages.some(code=>["de","en","fr"].includes(code))||default_language==="es"){flash(t("siteLanguagesNote"),true);return;}
  const payload={...values,languages,default_language,advertising_enabled:fd.has("advertising_enabled")};
  if(payload.discord_invite_url){try{const url=new URL(payload.discord_invite_url);if(url.protocol!=="https:"||!["discord.gg","discord.com","www.discord.com","discordapp.com","www.discordapp.com"].includes(url.hostname))throw Error();}catch{flash(t("inviteInvalid"),true);return;}}
 try{await request("bootstrap",{action:"save",entity:"settings",data:payload});await refresh();flash(t("saved"));}
 catch(e){flash(t("genericError")+" ("+e.message+")",true);}
});

$("defaultLanguage").addEventListener("change",e=>{
 const input=q("#activeLanguages input").find(x=>x.value===e.target.value);
 if(input)input.checked=true;
});
q("#activeLanguages input").forEach(box=>box.addEventListener("change",()=>{
 const current=$("defaultLanguage").value;
 const enabled=q("#activeLanguages input:checked").map(x=>x.value);
 if(!enabled.length){box.checked=true;return;}
 if(!enabled.includes(current))$("defaultLanguage").value=enabled[0];
}));
function safeLogoType(file){
 return ["image/png","image/jpeg","image/webp"].includes(file?.type)&&file.size>0&&file.size<=8*1024*1024;
}
async function optimizedLogo(file){
 const source=await createImageBitmap(file);
 try{
  const canvas=document.createElement("canvas"),scale=Math.min(1,512/Math.max(source.width,source.height));
  canvas.width=Math.max(1,Math.round(source.width*scale));
  canvas.height=Math.max(1,Math.round(source.height*scale));
  const ctx=canvas.getContext("2d");if(!ctx)throw Error("canvas_unsupported");
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(source,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/webp",.84));
  if(!blob)throw Error("image_processing_failed");
  if(blob.size>1048576)throw Error("image_too_large");
  return blob;
 }finally{source.close?.();}
}
function asBase64(blob){
 return new Promise((resolve,reject)=>{const reader=new FileReader();
  reader.onload=()=>resolve(String(reader.result||"").split(",")[1]||"");
  reader.onerror=()=>reject(Error("file_read_failed"));reader.readAsDataURL(blob);
 });
}
let logoObjectUrl=null;
$("allianceLogoFile").addEventListener("change",e=>{
 if(logoObjectUrl)URL.revokeObjectURL(logoObjectUrl);
 const file=e.target.files?.[0];$("logoUploadStatus").textContent="";
 if(file&&safeLogoType(file)){
  logoObjectUrl=URL.createObjectURL(file);$("logoPreview").src=logoObjectUrl;
 }else{
  if(file)$("logoUploadStatus").textContent=t("logoInvalid");
  $("logoPreview").src=state?.alliance?.logo_url||"../assets/nrw-banner.svg";
 }
});
$("uploadAllianceLogo").addEventListener("click",async()=>{
 if(!can("settings"))return;
 const file=$("allianceLogoFile").files?.[0],button=$("uploadAllianceLogo");
 if(!file){$("logoUploadStatus").textContent=t("logoChoose");return;}
 if(!safeLogoType(file)){$("logoUploadStatus").textContent=t("logoInvalid");return;}
 button.disabled=true;$("logoUploadStatus").textContent=t("logoUploading");
 try{
  const blob=await optimizedLogo(file),base64=await asBase64(blob);
  await request("bootstrap",{action:"alliance_logo_upload",mime_type:blob.type,base64});
  if(logoObjectUrl){URL.revokeObjectURL(logoObjectUrl);logoObjectUrl=null;}
  $("allianceLogoFile").value="";
  await refresh();setTab("settings");
  $("logoUploadStatus").textContent=t("logoUploaded");
 }catch(err){
  $("logoUploadStatus").textContent=(err.message==="image_too_large"?t("logoTooLarge"):t("logoUploadFailed")+" ("+err.message+")");
 }finally{button.disabled=!can("settings");}
});
$("removeAllianceLogo").addEventListener("click",async()=>{
 if(!can("settings"))return;
 const button=$("removeAllianceLogo");button.disabled=true;
 try{
  await request("bootstrap",{action:"alliance_logo_remove"});
  if(logoObjectUrl){URL.revokeObjectURL(logoObjectUrl);logoObjectUrl=null;}
  $("allianceLogoFile").value="";
  await refresh();setTab("settings");$("logoUploadStatus").textContent=t("logoRemoved");
 }catch(e){$("logoUploadStatus").textContent=t("logoUploadFailed")+" ("+e.message+")";}
 finally{button.disabled=!can("settings")||!state?.alliance?.logo_url;}
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
    '<option value="'+esc(x.game_id)+'">'+esc(x.name)+'</option>').join("");
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
 const value=$("staffAccountSelect").value,match=/^leader-([0-9]+)@accounts\.allianceos\.invalid$/i.exec(value);
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
$("logoutBtn").addEventListener("click",async()=>{await supabase.auth.signOut();state=null;discordPlanner.reset();eventBotStatusPanel.reset();performance.reset();bearManagement.reset();fightclub.reset();participation.reset();eventLoans.reset();selectedStaffEmail="";showLogin();});
document.documentElement.dataset.theme=localStorage.getItem("nrw_theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
patchTranslations();
loadLeaderList();
try{
 const {data:{session}}=await supabase.auth.getSession();
 if(session){try{await refresh();setTab(new URLSearchParams(location.search).get("tab")||"overview");}
 catch(e){showLogin(e.message==="not_authorized"?t("locked"):e.message==="authentication_required"?t("sessionExpired"):t("genericError")+" ("+e.message+")");}}
 else showLogin();
}catch{showLogin();}
