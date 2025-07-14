// App.tsx
import './App.css';
import PerformanceDashboard from './components/PerformanceDashBoard';
import { PerformanceProvider } from './context/PerformanceContext';
import TestComponent from './components/TestComponent';
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';


import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { SidebarProvider, useSidebar } from './context/SideBarContext';
import { ThemeProvider } from './context/ThemeContext';
import { FilePathProvider } from './context/FilePathContext';
import { useFilePath } from './context/FilePathContext';

function AppLayout() {
  const{filePath}=useFilePath()
 
  const { isSidebarOpen } = useSidebar();

  // Monitor App performance
  usePerformanceMonitor({
    id:"App",
    displayName: "Application Root",
    props: { filePath},
  });


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Navbar />

      <div className="flex flex-1">
        {isSidebarOpen && <Sidebar />}

        <main className="flex-1 p-6 overflow-y-auto transition-all duration-300">
          <div className="w-full max-w-7xl mx-auto bg-white dark:bg-gray-900 dark:text-white rounded-xl shadow-2xl p-8">
            <h1 className="text-center text-4xl font-extrabold text-gray-800 dark:text-white mb-8 pb-4 border-b-4 border-gray-200 dark:border-gray-700">
              Performance Monitoring Dashboard
            </h1>

            {/* Hidden test component */}
            <div
              className="flex flex-wrap justify-center gap-6 mb-10 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-inner"
              style={{ display: "none" }}
            >
              <TestComponent someProp="easy prop" />
            </div>

            <hr className="my-10 border-t-2 border-gray-300 dark:border-gray-600 w-full" />

            <PerformanceDashboard />
          </div>
        </main>
      </div>
    </div>
  );
}



export default function App() {
  return (
    <ErrorBoundary fallback={<div>Fatal Error</div>}>
      <PerformanceProvider>
        <ThemeProvider>
          <SidebarProvider>
            <FilePathProvider>
              <AppLayout />
            </FilePathProvider>
          </SidebarProvider>
        </ThemeProvider>
      </PerformanceProvider>
    </ErrorBoundary>
  );
}
