import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useThemeStore } from './themeStore';

function applyTheme(mode: 'light' | 'dark') {
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  return children;
}

