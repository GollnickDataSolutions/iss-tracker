'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getInitialTheme, toggleTheme } from './theme';

const API_URL = 'https://api.wheretheiss.at/v1/satellites/25544';
const POLL_MS = 5000;

const nf = (digits) =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const fmtCoord = nf(4);
const fmtInt = nf(0);

const CROSSHAIR_SVG = `<svg width="110" height="110" viewBox="0 0 110 110" fill="none" stroke="#3ddc97" stroke-width="2" aria-hidden="true">
  <circle cx="55" cy="55" r="45" stroke-opacity="0.35" stroke-width="1.5"/>
  <circle cx="55" cy="55" r="26" stroke-opacity="0.7"/>
  <line x1="55" y1="0" x2="55" y2="40"/><line x1="55" y1="70" x2="55" y2="110"/>
  <line x1="0" y1="55" x2="40" y2="55"/><line x1="70" y1="55" x2="110" y2="55"/>
  <circle cx="55" cy="55" r="8" fill="#3ddc97" stroke="none"/>
</svg>`;

function createIcon(theme) {
  if (theme === 'dark') {
    return L.divIcon({
      className: 'iss-crosshair',
      html: CROSSHAIR_SVG,
      iconSize: [110, 110],
      iconAnchor: [55, 55],
    });
  }
  return L.divIcon({ className: 'iss-marker', html: '🛰️', iconSize: [32, 32], iconAnchor: [16, 16] });
}

export default function IssTracker() {
  const mapEl = useRef(null);
  const markerRef = useRef(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
    document.documentElement.dataset.theme = theme;
    // Marker-Icon wechseln, ohne Karte oder Marker neu zu erzeugen
    if (markerRef.current) markerRef.current.setIcon(createIcon(theme));
  }, [theme]);

  useEffect(() => {
    const map = L.map(mapEl.current, { worldCopyJump: true }).setView([0, 0], 3);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende',
    }).addTo(map);

    let first = true;
    let stopped = false;

    async function update() {
      try {
        const res = await fetch(API_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = await res.json();
        if (stopped) return;
        const pos = [d.latitude, d.longitude];
        if (markerRef.current) markerRef.current.setLatLng(pos);
        else markerRef.current = L.marker(pos, { icon: createIcon(themeRef.current), title: 'ISS' }).addTo(map);
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
      markerRef.current = null;
      map.remove();
    };
  }, []);

  const dark = theme === 'dark';

  return (
    <main>
      <header>
        <h1>ISS · LIVE</h1>
        <span className="norad">NORAD 25544</span>
        <div className="header-end">
          <span className={`signal${error ? ' lost' : ''}`} role="status">
            {error ? 'KEIN SIGNAL' : 'SIGNAL OK · 5 s'}
          </span>
          <button
            type="button"
            className="theme-toggle"
            aria-pressed={dark}
            aria-label={dark ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'}
            onClick={() => setTheme((t) => toggleTheme(t))}
          >
            {dark ? '☀ Hell' : '☾ Dunkel'}
          </button>
        </div>
      </header>
      <div className="content">
        <div ref={mapEl} className="map" />
        <aside className="telemetry">
          <dl>
            <div className="metric"><dt>Breite</dt><dd>{data ? `${fmtCoord.format(data.latitude)}°` : '–'}</dd></div>
            <div className="metric"><dt>Länge</dt><dd>{data ? `${fmtCoord.format(data.longitude)}°` : '–'}</dd></div>
            <div className="metric">
              <dt>Höhe</dt>
              <dd>{data ? <>{fmtInt.format(data.altitude)}<small>km</small></> : '–'}</dd>
            </div>
            <div className="metric">
              <dt>Geschwindigkeit</dt>
              <dd>{data ? <>{fmtInt.format(data.velocity)}<small>km/h</small></> : '–'}</dd>
            </div>
          </dl>
          {error && (
            <div className="error" role="alert">
              <strong>KEIN SIGNAL</strong>
              Die ISS-Daten sind gerade nicht erreichbar. Neuer Versuch läuft automatisch.
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
