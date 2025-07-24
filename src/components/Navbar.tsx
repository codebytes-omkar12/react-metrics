import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SideBarContext';
import { Menu, X, Sun, Moon } from 'lucide-react';
import withPerformanceMonitor from '../HOC/withPerformanceMonitor';
import ApiKeyManager from './ApiKeyManager'; // Import the new component
import ApiLimitWarning from './ApiLimitWarning';

const Navbar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <header
      className="sticky top-0 z-30 w-full px-4 py-3 bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-lg border-b border-border-light dark:border-border-dark sm:px-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-text-secondary-light transition-colors hover:bg-gray-200 dark:text-text-secondary-dark dark:hover:bg-gray-700"
            aria-label="Toggle Sidebar"
          >
            <Menu
              className={`absolute transition-all duration-300 ${isSidebarOpen ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}
            />
            <X
              className={`absolute transition-all duration-300 ${isSidebarOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`}
            />
          </button>
          {/* Page Title and Subtitle */}
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              React Performance Metrics
            </h1>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark hidden sm:block">
              An overview of your application's health and performance.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 pr-9">
          <ApiLimitWarning/>
          <ApiKeyManager />
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-md text-text-secondary-light transition-colors hover:bg-gray-200 dark:text-text-secondary-dark dark:hover:bg-gray-700 "
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default withPerformanceMonitor(Navbar, { id: 'Navbar' });