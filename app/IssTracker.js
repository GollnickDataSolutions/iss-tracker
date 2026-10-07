'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_URL = 'https://api.wheretheiss.at/v1/satellites/25544';
const POLL_MS = 5000;

const nf = (digits) =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const fmtCoord = nf(4);
const fmtInt = nf(0);

export default function IssTracker() {
  const mapEl = useRef(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const map = L.map(mapEl.current, { worldCopyJump: true }).setView([0, 0], 3);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende',
    }).addTo(map);

    const icon = L.divIcon({
      className: 'iss-marker',
      html: '🛰️',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    let marker = null;
    let first = true;
    let stopped = false;

    async function update() {
      try {
        const res = await fetch(API_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = await res.json();
        if (stopped) return;
        const pos = [d.latitude, d.longitude];
        if (marker) marker.setLatLng(pos);
        else marker = L.marker(pos, { icon, title: 'ISS' }).addTo(map);
        if (first) {
          map.setView(pos, 3);
          first = false;
        }
        setData(d);
        setError(false);
      } catch {
        if (!stopped) setError(true);
      }
    }

    update();
    const id = setInterval(update, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(id);
      map.remove();
    };
  }, []);

  return (
    <main>
      <header>
        <h1>ISS-Live-Tracker</h1>
        <dl className="values">
          <div><dt>Breite</dt><dd>{data ? `${fmtCoord.format(data.latitude)}°` : '–'}</dd></div>
          <div><dt>Länge</dt><dd>{data ? `${fmtCoord.format(data.longitude)}°` : '–'}</dd></div>
          <div><dt>Höhe</dt><dd>{data ? `${fmtInt.format(data.altitude)} km` : '–'}</dd></div>
          <div><dt>Geschwindigkeit</dt><dd>{data ? `${fmtInt.format(data.velocity)} km/h` : '–'}</dd></div>
        </dl>
      </header>
      {error && (
        <p className="status error" role="alert">
          Die Positionsdaten der ISS sind gerade nicht erreichbar. Es wird weiter automatisch versucht …
        </p>
      )}
      <div ref={mapEl} className="map" />
    </main>
  );
}
