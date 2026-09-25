export type Theme = "dark" | "light";

export const themeStorageKey = "portfolio-theme";

const themeChangeEvent = "portfolio-themechange";

export function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this visit.
  }
  window.dispatchEvent(new Event(themeChangeEvent));
}

export function subscribeToTheme(onChange: () => void) {
  window.addEventListener(themeChangeEvent, onChange);
  return () => window.removeEventListener(themeChangeEvent, onChange);
}
