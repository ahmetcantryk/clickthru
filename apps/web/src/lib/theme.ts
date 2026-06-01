'use client';

import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const KEY = 'clickthru-theme';

/** <html data-theme> üstündeki güncel temayı okur (SSR'da 'light'). */
export function getTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/** Temayı uygula + kalıcı kaydet (FOUC bootstrap ile aynı anahtar). */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // localStorage erişilemezse tema yine de bu oturumda uygulanır.
  }
}

/** Tema durumunu paylaşan hook — toggle ile light/dark arası geçiş. */
export function useTheme(): { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void } {
  const [theme, setThemeState] = useState<Theme>('light');

  // İlk render sonrası gerçek (bootstrap'in koyduğu) temayı yakala.
  useEffect(() => {
    setThemeState(getTheme());
  }, []);

  function setTheme(t: Theme) {
    applyTheme(t);
    setThemeState(t);
  }

  return { theme, toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark'), setTheme };
}
