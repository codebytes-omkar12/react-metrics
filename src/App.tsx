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
import withPerformanceMonitor from './HOC/withPerformanceMonitor';
import TestComponent from './components/TestComponent';
import ChildComponent from './components/ChildComponent';

// Wrap the main layout with the HOC to monitor it
const MonitoredAppLayout = withPerformanceMonitor(AppLayout, { id: 'App' });

function AppLayout() {
  const { filePath } = useFilePath();
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
      {/* Hidden components for metrics collection */}
      <div style={{ display: 'none' }}>
        <TestComponent someProp="test" />
        <ChildComponent someProp="child test" />
      </div>

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
              {/* Row 1: Performance Dashboard and Selected Component Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PerformanceDashboard />
                <SelectedComponentDetails />
              </div>

              {/* Row 2: Hook Analysis (conditional) */}
              {filePath && <HookAnalysisDashboard />}

              {/* Row 3: Performance Charts (now full-width) */}
              <PerformanceCharts />
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
              <MonitoredAppLayout />
            </HookAnalysisProvider>
          </FilePathProvider>
        </SidebarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
