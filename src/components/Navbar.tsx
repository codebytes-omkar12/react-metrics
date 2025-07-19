import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SideBarContext';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <nav className="w-full flex items-center justify-between px-4 sm:px-6 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-md">
      <div className="flex items-center gap-3">
        {/* Button container for the icons */}
        <button
          onClick={toggleSidebar}
          className="relative h-8 w-8 flex items-center justify-center rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Sidebar"
        >
          {/* Menu Icon (Hamburger) */}
          <Menu
            className={`absolute transition-all duration-300 ${
              isSidebarOpen ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
            }`}
          />
          {/* X Icon */}
          <X
            className={`absolute transition-all duration-300 ${
              isSidebarOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
            }`}
          />
        </button>
        <h1 className="text-lg font-semibold tracking-tight text-slate-800 dark:text-white">React Performance Dashboard</h1>
      </div>
      <button
        onClick={toggleTheme}
        className="h-8 w-8 flex items-center justify-center rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Toggle Theme"
        aria-label="Toggle Theme"
      >
        <span className="text-xl">{isDarkMode ? '🌙' : '☀️'}</span>
      </button>
    </nav>
  );
};

export default Navbar;