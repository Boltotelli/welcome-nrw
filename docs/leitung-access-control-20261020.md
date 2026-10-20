# AllianceOS – unabhängig verwaltbare Modulrechte (20.10.2026)

## Rechte-Matrix

Die private Leitung trennt zehn serverseitige Rechte:
- `members` – vollständige Spielerverwaltung / Spielerakten und Main-Alt-Verknüpfungen
- `performance` – Performanceübersicht, ohne Spieleraktenbearbeitung
- `bear` – Bärenfalle und Bear-Optimierer-Werte, einschließlich Teilnehmerplanung
- `fightclub` – Swordland / TriAlliance-Legionen
- `participation` – allgemeine Event-Teilnahme/Anwesenheitsverwaltung
- `transfers`, `laws`, `events`, `event_bot`, `settings` – bisherige Berechtigungen

### Rechte entziehen

Unter **Allianz & Rechte** kann der autorisierte Administrator ein vorhandenes R4/R5-Konto auswählen, einzelne Module per Schalter deaktivieren und mit **Änderungen speichern** übernehmen. Außerdem gibt es:
- **Änderungen verwerfen**: lädt die aktuell gespeicherten Rechte erneut;
- **Alle Modulrechte entziehen**: setzt alle zehn Modulrechte nach Bestätigung auf `false`, ohne die Login-Freigabe zu ändern;
- **Zugang vollständig sperren**: setzt alle zehn Rechte auf `false` und `enabled=false`. Die Backend-Authentifizierung verweigert anschließend alle API-Anfragen mit dieser Identität.

Diese Aktionen verändern weder Ingame-Ränge noch Discord-Rollen, die NAP-App oder bestehende Spielerdaten. Der autorisierte Administrator kann einen gesperrten, noch als aktiver R4/R5 erkannten Login später über das Formular wieder freigeben. Die automatische Rang-Synchronisierung respektiert manuell gesperrte Konten (`disabled_reason=manual`).

### Datenschutz und Schutz vor versehentlichen Änderungen

- Rechteprüfungen finden **auf dem Backend** statt, bei jedem Request anhand der aktuellen `aos_staff`-Zeile. Eine ausgeblendete Navigation ist keine alleinige Sicherheitskontrolle.
- Spielerakten sind ausschließlich mit `members` aufrufbar. Für die vier neuen Module gibt der gemeinsame Bootstrap, wenn `members` fehlt, nur die für die Darstellung benötigten minimalen Spieleridentitäten zurück.
- Administratoren (`is_admin=true` oder zugelassener Legacy-Eigentümer) behalten alle Rechte. Admin-Konten und das eigene Konto können nicht über das Rechteformular deaktiviert werden.
- Historische `members=true`-Konten wurden im Rahmen einer einmaligen Migration für die vier neuen Rechte aktiviert. Explizite neue Einstellungen werden nicht überschrieben. Leere bzw. gesperrte Konten bleiben ohne Rechte.
- Die Rechte-Synchronisierung setzt explizit gesetzte Modulfreigaben nicht zurück.
- Alle Änderungen laufen über die vorhandene `staff`-Aktion und das bestehende Audit-Log; das gespeicherte Berechtigungsobjekt ist vollständig.

## Veröffentlichung und Tests

- Supabase `allianceos-leitung` v47, `allianceos-leader-sync` v3.
- Vier Sprachfassungen für die Rechteverwaltung (DE/EN/FR/ES) und mobile Styles.
- Syntax und Modulzuordnung wurden geprüft; SQL Migration erfolgreich.
- UI-Simulation mit selektierten, unselektierten und geschützten Admin-Konten.
- Ein authentifizierter End-to-End-Test mit zwei echten verschiedenen R4/R5-Logins bleibt für die Live-Freigabe empfohlen.

Die GitHub-Pages-Testversion wird über den automatischen Pages-Workflow von `main` veröffentlicht; der produktive Vercel-Testbereich bleibt für die vier zusätzlichen Module weiterhin ausgeblendet.
