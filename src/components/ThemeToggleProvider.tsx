"use client";
import React from 'react';

interface Props { children: React.ReactNode }

export const ThemeToggleProvider: React.FC<Props> = ({ children }) => {
  const [theme, setTheme] = React.useState<string>('light');
  React.useEffect(() => {
    const stored = localStorage.getItem('theme-pref');
    if (stored === 'dark' || stored === 'light') {
      setTheme(stored);
      document.documentElement.classList.toggle('dark', stored === 'dark');
    } else {
      const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = prefers ? 'dark' : 'light';
      setTheme(initial);
      document.documentElement.classList.toggle('dark', initial === 'dark');
    }
  }, []);
  function toggle() {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      localStorage.setItem('theme-pref', next);
      return next;
    });
  }
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full border-b themed-border flex items-center justify-between px-4 py-3 gap-4 bg-[rgb(var(--surface))]/95 backdrop-blur supports-[backdrop-filter]:bg-[rgb(var(--surface))]/80 sticky top-0 z-40 shadow-sm">
        <h1 className="text-sm font-semibold tracking-tight">Arbitrage Calculator</h1>
        <button onClick={toggle} className="btn-ghost focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-3 py-1.5" aria-label="Toggle theme">
          {theme === 'dark' ? '🌞 Light' : '🌙 Dark'}
        </button>
      </header>
      <main className="flex-1 w-full px-2 md:px-4 pb-10">{children}</main>
      <footer className="text-xs text-center py-4 opacity-70 bg-[rgb(var(--surface))] border-t themed-border">Educational use only.</footer>
    </div>
  );
};

export default ThemeToggleProvider;
