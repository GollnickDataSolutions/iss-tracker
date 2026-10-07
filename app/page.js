'use client';

import dynamic from 'next/dynamic';

// Leaflet benötigt `window`, daher kein Server-Side-Rendering der Karte.
const IssTracker = dynamic(() => import('./IssTracker'), {
  ssr: false,
  loading: () => <p className="status">Karte wird geladen …</p>,
});

export default function Page() {
  return <IssTracker />;
}
