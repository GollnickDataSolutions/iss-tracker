# iss-tracker
Das ist unser Repo für die ISS-Tracker App

Die App zeigt die aktuelle Position der ISS live auf einer Karte (Next.js, Leaflet, Daten von `api.wheretheiss.at`).

## Starten

Voraussetzung: Node.js (empfohlen: aktuelle LTS-Version).

```
npm install      # einmalig: Abhängigkeiten installieren
npm run dev      # Entwicklungsserver starten
```

Danach http://localhost:3000 im Browser öffnen. Beenden mit `Strg+C`.

## Produktionsversion lokal testen

```
npm run build
npm start
```

## Deployment

```
npx vercel --prod
```
