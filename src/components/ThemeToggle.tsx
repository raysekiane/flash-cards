import { useEffect } from 'react';
import { useLocalStorage } from '../shared/hooks/useLocalStorage';

export function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:text-slate-100"
      aria-label="Alternar tema"
    >
      {theme === 'dark' ? '☀️ Claro' : '🌙 Escuro'}
    </button>
  );
}
