// Light / dark mode. "system" follows the phone or computer setting; the others override it
// by setting data-theme on <html>, which docs.css reads. Remembered in this browser.

export type Theme = 'system' | 'light' | 'dark';

const KEY = 'kept.lab.theme';

// Toolbar colors for the browser chrome, matching the page background in each mode.
const CHROME = { light: '#ffffff', dark: '#000000' };

export function getTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Blocked storage: follow the system.
  }
  return 'system';
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = theme;

  // index.html has one theme-color per system mode; when a mode is chosen, both use it.
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    const systemDark = meta.media.includes('dark');
    const mode = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
    meta.content = CHROME[mode];
  });
}

export function setTheme(theme: Theme) {
  try {
    if (theme === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch {
    // Not remembered; still applied for this visit.
  }
  applyTheme(theme);
}
