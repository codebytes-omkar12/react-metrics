import './App.css';
import PerformanceDashboard from './components/PerformanceDashBoard';
import { PerformanceProvider } from './context/PerformanceContext';
import TestComponent from './components/TestComponent';
import { useState } from 'react';
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';
import withPerformanceMonitor from './HOC/withPerformanceMonitor';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';

function App() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Hook for monitoring App component itself (no static id needed)
  usePerformanceMonitor({
    displayName: "Application Root",
    props: { selectedFile },
  });

  // Dashboard wrapped with HOC, using custom ID and label
const MonitoredPerformanceDashboard = withPerformanceMonitor(PerformanceDashboard, {
  parentId: "App"
});


  return (
    <ErrorBoundary fallback={<div>Fatal Error</div>}>
      <PerformanceProvider>
        <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-white">
          {/* Sidebar on the left */}
          <Sidebar onSelectFile={setSelectedFile} />

          {/* Main content on the right */}
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-2xl p-8">
              <h1 className="text-center text-4xl font-extrabold text-gray-800 mb-8 pb-4 border-b-4 border-gray-200">
                Performance Monitoring Dashboard
              </h1>

              {/* Optional test component rendered invisibly for metrics */}
              <div
                className="flex flex-wrap justify-center gap-6 mb-10 p-6 bg-gray-50 rounded-xl shadow-inner"
                style={{ display: "none" }}
              >
                <TestComponent someProp="easy prop" />
              </div>

              <hr className="my-10 border-t-2 border-gray-300 w-full" />

              <MonitoredPerformanceDashboard filePath={selectedFile} />
            
            </div>
          </main>
        </div>
      </PerformanceProvider>
    </ErrorBoundary>
  );
}

export default App;
