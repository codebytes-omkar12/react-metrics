import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SideBarContext';
import { Menu, X, Sun, Moon } from 'lucide-react';
import withPerformanceMonitor from '../HOC/withPerformanceMonitor';

const Navbar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-30 w-full px-4 sm:px-6 py-3 bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-lg border-b border-border-light dark:border-border-dark">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="relative h-9 w-9 flex items-center justify-center rounded-md text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle Sidebar"
          >
            <Menu
              className={`absolute transition-all duration-300 ${isSidebarOpen ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}
            />
            <X
              className={`absolute transition-all duration-300 ${isSidebarOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`}
            />
          </button>
        </div>
        <button
          onClick={toggleTheme}
          className="h-9 w-9 flex items-center justify-center rounded-md text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Toggle Theme"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default withPerformanceMonitor(Navbar, { id: 'Navbar' });