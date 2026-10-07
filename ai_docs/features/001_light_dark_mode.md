# Light/Dark-Mode-Umschalter

## Kontext & Problemstellung
Die App hat derzeit nur ein helles Erscheinungsbild. Nutzer sollen zwischen Light und Dark Mode wechseln können. Der Dark Mode soll dem Entwurf „Missionskontrolle“ entsprechen (Referenz: `ai_docs/images/darkmode_example.png`): dunkler Hintergrund, Monospace-Schrift, grüner Akzent, Telemetrie-Spalte rechts, Fadenkreuz-Marker.

## Anforderungen
- [ ] Als Nutzer möchte ich per Schalter in der Kopfzeile zwischen Light und Dark Mode wechseln.
- [ ] Als Nutzer möchte ich, dass meine Wahl beim nächsten Besuch erhalten bleibt.
- [ ] Ohne gespeicherte Wahl gilt die Systemeinstellung (`prefers-color-scheme`).
- [ ] Der Light Mode entspricht dem heutigen Aussehen der App.
- [ ] Der Dark Mode entspricht der Referenz:
  - Hintergrund ca. `#0a0f14`, Flächen ca. `#0d151c`, Trennlinien ca. `#1f2d38`.
  - Schrift: JetBrains Mono (Werte, Labels), Space Grotesk (Titel „ISS · LIVE“).
  - Kopfzeile: Titel, „NORAD 25544“, rechts Statusanzeige („SIGNAL OK · 5 s“) in Akzentgrün `#3ddc97`.
  - Werte-Spalte rechts: Labels in Großbuchstaben mit Sperrung (BREITE, LÄNGE, HÖHE, GESCHWINDIGKEIT), große weiße Zahlen, Einheiten kleiner und grau, Abschnitte durch Linien getrennt.
  - Fehlerhinweis als rot umrandeter Block („KEIN SIGNAL“ + Erklärtext).
  - Karte dunkel; ISS-Marker als grünes Fadenkreuz mit Ringen.
- [ ] Die Karte (Leaflet) wechselt mit dem Theme ihr Erscheinungsbild; Attribution bleibt sichtbar und lesbar.
- [ ] Die Statusanzeige zeigt im Fehlerfall einen Fehlerzustand statt „SIGNAL OK“.
- [ ] Der Schalter ist ein echter `<button>` mit `aria-label` bzw. `aria-pressed`, per Tastatur bedienbar, Trefferfläche ≥ 44 px.
- [ ] Kein Aufblitzen des falschen Themes beim Laden (kein „Flash of wrong theme“).
- [ ] Kontrast Text/Hintergrund in beiden Modi mind. 4,5:1.
- [ ] Alle Requests weiterhin über HTTPS, keine API-Keys (gilt auch für Kartenkacheln).

## Definition of Done
- [ ] Umschalten wirkt sofort auf Kopfzeile, Werte, Fehlerhinweis, Karte und Marker.
- [ ] Wahl überlebt Neuladen; ohne Wahl folgt die App der Systemeinstellung.
- [ ] Dark Mode stimmt sichtbar mit `ai_docs/images/darkmode_example.png` überein (Review per Screenshot-Vergleich).
- [ ] Layout funktioniert bei Handybreite (Spalte rutscht unter die Karte).
- [ ] Polling, Fehlerhinweis und Erholung nach Fehler funktionieren in beiden Modi unverändert.
- [ ] Keine Mixed-Content- oder Hydration-Warnungen in der Browser-Konsole.
- [ ] `npm run build` erfolgreich.
- [ ] Automatisierte Tests vorhanden und grün (siehe Abschnitt "Tests").

## Betroffene Bereiche & Technik
- `app/layout.js`: Theme-Attribut am `<html>` (z. B. `data-theme`), Script gegen Theme-Flash, Google Fonts (JetBrains Mono, Space Grotesk) über `next/font`.
- `app/globals.css`: Farben als CSS-Variablen auf `:root`, Überschreibung unter `[data-theme="dark"]`; Styles für Telemetrie-Spalte, Statusanzeige, Fehlerblock.
- `app/IssTracker.js`: Schalter-Button, Theme-State, Speicherung in `localStorage`, Kartenkacheln/Marker-Icon je Theme, Statusanzeige.
- Neu (Vorschlag): `app/theme.js` mit reiner Logik (Anfangs-Theme bestimmen, speichern, umschalten), damit sie testbar ist.
- Test-Setup neu: Vitest + React Testing Library + jsdom (`package.json`-Script `test`).

## Tests
Runner: Vitest (+ React Testing Library, jsdom), Dateien unter `app/**/*.test.js`.

- [ ] Unit `theme.test.js`: ohne gespeicherten Wert und `prefers-color-scheme: dark` → Anfangs-Theme `dark`.
- [ ] Unit: ohne gespeicherten Wert und helles System → `light`.
- [ ] Unit: gespeicherter Wert `light` hat Vorrang vor dunklem System.
- [ ] Unit: ungültiger gespeicherter Wert (z. B. `"blau"`) → Fallback auf Systemeinstellung.
- [ ] Unit: `localStorage` wirft (privates Fenster) → kein Absturz, Fallback auf Systemeinstellung.
- [ ] Unit: Umschalten `light` → `dark` → `light` liefert die richtigen Werte und speichert sie.
- [ ] Komponente `IssTracker.test.js` (Leaflet und `fetch` gemockt): Klick auf Schalter setzt `data-theme="dark"` am `<html>` und ändert `aria-pressed`/`aria-label`.
- [ ] Komponente: Schalter ist per Tastatur (Enter/Leertaste) auslösbar.
- [ ] Komponente: bei fehlschlagendem `fetch` erscheint im Dark Mode „KEIN SIGNAL“, nach erfolgreichem Folgeabruf verschwindet er.
- [ ] Komponente: Theme-Wechsel tauscht die Kachel-URL bzw. die Karten-Klasse und erzeugt keinen zweiten Marker.
- [ ] Manuell (Screenshot-Vergleich): Dark Mode gegen `ai_docs/images/darkmode_example.png` bei 1910 px Breite.

## Umsetzungsideen / Hinweise (optional)
- Theme-Flash vermeiden: kleines Inline-Script in `layout.js`, das vor dem Rendern `data-theme` aus `localStorage`/`matchMedia` setzt; `suppressHydrationWarning` auf `<html>`.
- Dunkle Karte: Variante A = OSM-Kacheln behalten und im Dark Mode per CSS-Filter auf `.leaflet-tile-pane` abdunkeln (kein neuer Anbieter); Variante B = dunkle Kacheln eines Anbieters (z. B. CARTO Dark Matter, HTTPS, eigene Attribution, Nutzungsbedingungen prüfen). Empfehlung: A, weil kein neuer Anbieter.
- Marker als `L.divIcon` mit Inline-SVG (Fadenkreuz) im Dark Mode, bisheriger Marker im Light Mode; Icon per `marker.setIcon()` wechseln statt Marker neu zu erzeugen.
- Leaflet-Karte beim Theme-Wechsel nicht neu initialisieren (sonst Reset von Zoom/Position).

## Offene Fragen / Abhängigkeiten (optional)
- Bisher gibt es kein Test-Setup im Projekt; die Spec setzt Vitest voraus. Annahme: wird mit diesem Feature eingeführt. - mache das so
- Soll der Light Mode ebenfalls das neue Layout (Telemetrie-Spalte rechts) bekommen oder nur andere Farben? Annahme: gleiches Layout, nur helle Farben und Standardschrift. - gleiches Layout, nur helle Farben und Standardschrift
- Dunkle Karte per CSS-Filter oder eigener Kachelanbieter? (siehe Hinweise) - dunkle Karte per CSS-Filter
- Die Orbit-Linie in der Referenz ist nicht Teil dieses Features (gehört zu Bonus B1 „Spur“).
