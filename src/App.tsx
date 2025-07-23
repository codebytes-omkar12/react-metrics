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

const MonitoredAppLayout = withPerformanceMonitor(AppLayout, { id: 'App' });

function AppLayout() {
  const { filePath } = useFilePath();
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="relative min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark overflow-x-hidden">
      <div style={{ display: 'none' }}>
        <TestComponent someProp="test" />
        <ChildComponent someProp="child test" />
      </div>

      <Sidebar />
      
      {/* This content wrapper slides and resizes for a smooth, responsive animation */}
      <div
        className={`absolute top-0 left-0 flex h-full flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-64 w-[calc(100%-16rem)]' : 'w-full translate-x-0'
        }`}
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-8xl animate-fade-in-up">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <PerformanceDashboard />
                <SelectedComponentDetails />
              </div>
              {filePath && <HookAnalysisDashboard />}
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
