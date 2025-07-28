import { create } from 'zustand';

const storedTheme = localStorage.getItem('Lingobuddy-theme') || 'theme-forest';

export const useThemeSelector = create((set) => {
  if (typeof document !== 'undefined') {
    document.documentElement.className = storedTheme;
  }

  return {
    theme: storedTheme,
    setTheme: (theme) => {
      localStorage.setItem('Lingobuddy-theme', theme);
      document.documentElement.className = theme;
      set({ theme });
    },
  };
});
