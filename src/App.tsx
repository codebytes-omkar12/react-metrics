// App.tsx
import './App.css';
import PerformanceDashboard from './components/PerformanceDashBoard';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { SidebarProvider, useSidebar } from './context/SideBarContext';
import { ThemeProvider } from './context/ThemeContext';
import { FilePathProvider, useFilePath } from './context/FilePathContext';
import HookAnalysisDashboard from './components/HookAnalysisDashboard';
import { HookAnalysisProvider } from './context/HookAnalysisContext';
import SelectedComponentDetails from './components/SelectedComponentDetails';
import PerformanceCharts from './components/PerformanceCharts';
import MemoryComponent from './components/MemoryComponent';

function AppLayout() {
  const { filePath } = useFilePath();
  const { isSidebarOpen } = useSidebar();

  // usePerformanceMonitor({
  //   id: "App",
  //   displayName: "Application Root",
  //   props: { filePath },
  // });

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"}`}
      >
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="w-full max-w-8xl mx-auto animate-fade-in-up">
            <header className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">
                React Performance Metrics
              </h1>
              <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
                An overview of your application's health and performance.
              </p>
            </header>
            
            <div className="space-y-6">
              <PerformanceDashboard />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <MemoryComponent />
                </div>
                <div className="lg:col-span-2">
                  <SelectedComponentDetails />
                </div>
              </div>
              
              <PerformanceCharts />

              {filePath && <HookAnalysisDashboard />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallback={<div>Fatal Error</div>}>
      <ThemeProvider>
        <SidebarProvider>
          <FilePathProvider>
            <HookAnalysisProvider>
              <AppLayout />
            </HookAnalysisProvider>
          </FilePathProvider>
        </SidebarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}