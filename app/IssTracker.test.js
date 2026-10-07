import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const m = vi.hoisted(() => {
  const marker = { addTo: vi.fn(), setLatLng: vi.fn(), setIcon: vi.fn() };
  marker.addTo.mockReturnValue(marker);
  const map = { setView: vi.fn(), remove: vi.fn() };
  map.setView.mockReturnValue(map);
  const layer = { addTo: vi.fn() };
  return {
    marker,
    map,
    L: {
      map: vi.fn(() => map),
      tileLayer: vi.fn(() => layer),
      divIcon: vi.fn((o) => o),
      marker: vi.fn(() => marker),
    },
  };
});

vi.mock('leaflet', () => ({ default: m.L }));
vi.mock('leaflet/dist/leaflet.css', () => ({}));

import IssTracker from './IssTracker';

const okResponse = {
  ok: true,
  json: async () => ({ latitude: -5.19, longitude: 151.37, altitude: 419, velocity: 27586 }),
};

async function renderTracker() {
  render(<IssTracker />);
  await act(async () => {});
}

beforeEach(() => {
  vi.clearAllMocks();
  m.marker.addTo.mockReturnValue(m.marker);
  window.localStorage.clear();
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.theme;
});

describe('Theme-Schalter', () => {
  it('Klick setzt data-theme und aria-Attribute', async () => {
    await renderTracker();
    const btn = screen.getByRole('button', { name: /dunklen modus/i });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(document.documentElement.dataset.theme).toBe('light');

    await userEvent.click(btn);

    expect(document.documentElement.dataset.theme).toBe('dark');
    const btn2 = screen.getByRole('button', { name: /hellen modus/i });
    expect(btn2).toHaveAttribute('aria-pressed', 'true');
  });

  it('ist per Enter und Leertaste bedienbar', async () => {
    await renderTracker();
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(document.documentElement.dataset.theme).toBe('dark');
    await user.keyboard(' ');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('Theme-Wechsel tauscht das Icon, ohne zweiten Marker oder neue Karte', async () => {
    await renderTracker();
    expect(m.L.marker).toHaveBeenCalledTimes(1);
    m.marker.setIcon.mockClear();

    await userEvent.click(screen.getByRole('button'));

    expect(m.marker.setIcon).toHaveBeenCalledTimes(1);
    expect(m.marker.setIcon.mock.calls[0][0].className).toBe('iss-crosshair');
    expect(m.L.marker).toHaveBeenCalledTimes(1);
    expect(m.L.map).toHaveBeenCalledTimes(1);
  });
});

describe('Fehlerzustand im Dark Mode', () => {
  it('zeigt KEIN SIGNAL und erholt sich nach erfolgreichem Abruf', async () => {
    window.localStorage.setItem('iss-theme', 'dark');
    vi.useFakeTimers();
    fetch.mockRejectedValueOnce(new Error('offline'));

    render(<IssTracker />);
    await act(async () => {});

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('alert')).toHaveTextContent('KEIN SIGNAL');
    expect(screen.getByRole('status')).toHaveTextContent('KEIN SIGNAL');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('SIGNAL OK');
  });
});
