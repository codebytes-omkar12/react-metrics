// Main entry point for the react-metrics npm package

// Components
export { default as PerformanceDashBoard } from './components/PerformanceDashboard';
export { default as HookAnalysisDashboard } from './components/HookAnalysisDashboard';
export { default as TestComponent } from './components/TestComponent';
export { default as SelectedDetailComponent } from './components/SelectedComponentDetails';
export { default as HookDetailsTable } from './components/HookDetailsTable';
export { default as ChildComponent } from './components/ChildComponent';
export { default as PerformanceCharts } from './components/PerformanceCharts';
export { default as MemoryComponent } from './components/MemoryComponent';
export { default as ErrorBoundary } from './components/ErrorBoundary';

// Hooks
export { useMemoryMonitor } from './hooks/useMemoryMonitor';
export { usePerformanceMonitor } from './hooks/usePerformanceMonitor';

// HOC
export { default as withPerformanceMonitor } from './HOC/withPerformanceMonitor';
