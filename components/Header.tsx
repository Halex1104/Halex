
import React from 'react';
import { Sun, Moon, Settings } from 'lucide-react'; // Added Settings icon

interface HeaderProps {
  title: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onToggleSettings: () => void; // Added prop for settings
}

export const Header: React.FC<HeaderProps> = ({ title, theme, toggleTheme, onToggleSettings }) => {
  return (
    <header className="bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-300 dark:border-slate-700 p-4 sticky top-0 z-10 flex items-center justify-between">
      <button
        onClick={onToggleSettings}
        className="p-1.5 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-150 active:scale-90"
        aria-label="Open settings"
      >
        <Settings size={20} />
      </button>
      <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200 text-center flex-grow">{title}</h1>
      <button
        onClick={toggleTheme}
        className="p-1.5 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-150 active:scale-90"
        aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </header>
  );
};
