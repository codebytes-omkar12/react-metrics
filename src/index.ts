// Main entry point for the react-metrics npm package

// Components
export { default as PerformanceDashBoard } from './components/PerformanceDashBoard';
export { default as ComponentHierarchyNode } from './components/ComponentHierarchyNode';
export { default as ComponentHierarchyTree } from './components/ComponentHierarchyTree';
export { default as HookAnalysisDashboard } from './components/HookAnalysisDashboard';
export { default as TestComponent } from './components/TestComponent';
export { default as SelectedDetailComponent } from './components/SelectedDetailComponent';
export { default as HookDetailsTable } from './components/HookDetailsTable';
export { default as ChildComponent } from './components/ChildComponent';
export { default as PerformanceCharts } from './components/PerformanceCharts';
export { default as MemoryComponent } from './components/MemoryComponent';
export { default as FilePickerComponent } from './components/FilePickerComponent';
export { default as ErrorBoundary } from './components/ErrorBoundary';

// Hooks
export { useMemoryMonitor } from './hooks/useMemoryMonitor';
export { usePerformanceMonitor } from './hooks/usePerformanceMonitor';

// HOC
export { default as withPerformanceMonitor } from './HOC/withPerformanceMonitor';
