export const THEME_KEY = 'iss-theme';

const isTheme = (v) => v === 'light' || v === 'dark';

function systemTheme() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function getInitialTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (isTheme(saved)) return saved;
  } catch {
    // localStorage nicht verfügbar (z. B. privates Fenster)
  }
  return systemTheme();
}

export function saveTheme(theme) {
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignorieren
  }
}

export function toggleTheme(current) {
  const next = current === 'dark' ? 'light' : 'dark';
  saveTheme(next);
  return next;
}

// Gleiche Logik als Inline-Script, läuft vor dem ersten Rendern (kein Theme-Flash).
export const themeInitScript = `(function(){try{var t=null;try{t=localStorage.getItem('${THEME_KEY}')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}})();`;
