// components/Navbar.tsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SideBarContext'

const Navbar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { toggleSidebar } = useSidebar();

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
        >
          📁
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">React Performance Dashboard</h1>
      </div>
      <button
        onClick={toggleTheme}
        className="text-gray-800 dark:text-white hover:text-yellow-500 text-xl"
        title="Toggle Theme"
      >
        {isDarkMode ? '🌙' : '☀️'}
      </button>
    </nav>
  );
};

export default Navbar;
