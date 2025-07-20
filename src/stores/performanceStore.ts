import { create } from 'zustand';
import type { IAllComponentMetrics, IMetrics, IMemoryMetrics, IBundleMetrics } from '../types/performance';
import { throttle } from 'lodash';

interface PerformanceState {
  allMetrics: IAllComponentMetrics;
  selectedComponentId: string | null;
  currentMemoryMetrics: IMemoryMetrics | null;
  bundleMetrics: IBundleMetrics | null;
  memoryHistory: IMemoryMetrics[];
  // Actions
  setSelectedComponentId: (id: string | null) => void;
  addOrUpdateMetrics: (componentName: string, metrics: IMetrics) => void;
  updateMemoryMetrics: (metrics: IMemoryMetrics | null) => void;
  updateBundleMetrics: (metrics: IBundleMetrics | null) => void;
}

// Throttled function for performance metrics (stable instance)
const throttledSetMetrics = throttle((set, componentName, metrics) => {
  set((state: PerformanceState) => ({
    allMetrics: { ...state.allMetrics, [componentName]: metrics },
  }));
}, 300, { leading: true, trailing: true });

// ✅ Throttled function for memory metrics (stable instance)
const throttledUpdateMemoryMetrics = throttle((set, metrics) => {
    if (metrics) {
        set((state: PerformanceState) => ({
          currentMemoryMetrics: metrics,
          memoryHistory: [...state.memoryHistory, metrics].slice(-60),
        }));
      } else {
        set({ currentMemoryMetrics: null });
      }
}, 1000, { leading: true, trailing: true }); // Throttle to once per second


export const usePerformanceStore = create<PerformanceState>((set) => ({
  // Initial State
  allMetrics: {},
  selectedComponentId: null,
  bundleMetrics: null,
  currentMemoryMetrics: null,
  memoryHistory: [],

  // Actions
  setSelectedComponentId: (id) => set({ selectedComponentId: id }),
  
  // This action now correctly invokes the stable throttled function
  addOrUpdateMetrics: (componentName, metrics) => {
    throttledSetMetrics(set, componentName, metrics);
  },
    
  // ✅ This action now also correctly invokes its stable throttled function
  updateMemoryMetrics: (metrics) => {
    throttledUpdateMemoryMetrics(set, metrics);
  },

  updateBundleMetrics: (metrics) => set({ bundleMetrics: metrics }),
}));