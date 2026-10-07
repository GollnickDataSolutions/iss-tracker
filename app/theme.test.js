import { beforeEach, describe, expect, it, vi } from 'vitest';
import { THEME_KEY, getInitialTheme, toggleTheme } from './theme';

function mockSystem(dark) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: dark });
}

beforeEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('getInitialTheme', () => {
  it('ohne Wert und dunkles System → dark', () => {
    mockSystem(true);
    expect(getInitialTheme()).toBe('dark');
  });

  it('ohne Wert und helles System → light', () => {
    mockSystem(false);
    expect(getInitialTheme()).toBe('light');
  });

  it('gespeichertes light hat Vorrang vor dunklem System', () => {
    mockSystem(true);
    window.localStorage.setItem(THEME_KEY, 'light');
    expect(getInitialTheme()).toBe('light');
  });

  it('ungültiger Wert → Fallback auf Systemeinstellung', () => {
    mockSystem(true);
    window.localStorage.setItem(THEME_KEY, 'blau');
    expect(getInitialTheme()).toBe('dark');
  });

  it('localStorage wirft → kein Absturz, Systemeinstellung', () => {
    mockSystem(true);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(getInitialTheme()).toBe('dark');
  });
});

describe('toggleTheme', () => {
  it('wechselt light → dark → light und speichert', () => {
    expect(toggleTheme('light')).toBe('dark');
    expect(window.localStorage.getItem(THEME_KEY)).toBe('dark');
    expect(toggleTheme('dark')).toBe('light');
    expect(window.localStorage.getItem(THEME_KEY)).toBe('light');
  });

  it('stürzt nicht ab, wenn Speichern fehlschlägt', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(toggleTheme('light')).toBe('dark');
  });
});
