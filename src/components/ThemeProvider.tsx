"use client";
import React from "react";

interface TPProps { children: React.ReactNode }

export const ThemeProvider: React.FC<TPProps> = ({ children }) => {
  const [theme, setTheme] = React.useState<string>("light");

  // initialize on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("theme-pref");
      let next = stored as string | null;
      if (next !== "light" && next !== "dark") {
        next = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      setTheme(next);
      document.documentElement.classList.toggle("dark", next === "dark");
    } catch {}
  }, []);

  function toggle() {
    setTheme(prev => {
      const nxt = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", nxt === "dark");
      try { localStorage.setItem("theme-pref", nxt); } catch {}
      return nxt;
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full border-b themed-border flex items-center justify-between px-4 py-3 gap-4">
        <h1 className="text-sm font-semibold tracking-tight">Arbitrage Calculator</h1>
        <button onClick={toggle} className="btn-ghost" aria-label="Toggle theme">
          {theme === 'dark' ? '🌞 Light' : '🌙 Dark'}
        </button>
      </header>
      <main className="flex-1 w-full">{children}</main>
      <footer className="text-xs text-center py-4 opacity-70">Educational use only.</footer>
    </div>
  );
};

export default ThemeProvider;
