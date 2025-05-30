import React from 'react';
import { Image as ImageIcon, Library as LibraryIcon } from 'lucide-react';

interface BottomNavigationBarProps {
  activeTab: 'generate' | 'library';
  onTabChange: (tab: 'generate' | 'library') => void;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({ activeTab, onTabChange }) => {
  const commonButtonClasses = "flex-1 flex flex-col items-center justify-center p-2 sm:p-3 transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 active:scale-95";
  const activeClasses = "text-blue-600 dark:text-blue-400";
  const inactiveClasses = "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200";

  return (
    <nav className="bg-slate-100 dark:bg-slate-800 border-t border-slate-300 dark:border-slate-700 flex shadow-top sticky bottom-0 w-full">
      <button
        onClick={() => onTabChange('generate')}
        className={`${commonButtonClasses} ${activeTab === 'generate' ? activeClasses : inactiveClasses}`}
        aria-pressed={activeTab === 'generate'}
        aria-label="Generate images"
      >
        <ImageIcon size={24} strokeWidth={activeTab === 'generate' ? 2.5 : 2} />
        <span className={`text-xs mt-1 ${activeTab === 'generate' ? 'font-semibold' : 'font-normal'}`}>Generate</span>
      </button>
      <button
        onClick={() => onTabChange('library')}
        className={`${commonButtonClasses} ${activeTab === 'library' ? activeClasses : inactiveClasses}`}
        aria-pressed={activeTab === 'library'}
        aria-label="View image library"
      >
        <LibraryIcon size={24} strokeWidth={activeTab === 'library' ? 2.5 : 2} />
        <span className={`text-xs mt-1 ${activeTab === 'library' ? 'font-semibold' : 'font-normal'}`}>Library</span>
      </button>
    </nav>
  );
};