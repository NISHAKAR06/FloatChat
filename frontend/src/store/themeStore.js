import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        get().applyTheme(newTheme);
      },
      setTheme: (theme) => {
        set({ theme });
        get().applyTheme(theme);
      },
      applyTheme: (theme) => {
        const root = document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
          root.style.colorScheme = 'dark';
        } else {
          root.classList.remove('dark');
          root.style.colorScheme = 'light';
        }
      },
      initializeTheme: () => {
        const { theme } = get();
        get().applyTheme(theme);
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
          if (get().theme === 'system') {
            get().applyTheme(e.matches ? 'dark' : 'light');
          }
        };
        mediaQuery.addEventListener('change', handleChange);
        
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    }),
    {
      name: 'theme-storage',
    }
  )
);

export default useThemeStore;