import { create } from 'zustand';
import type { IAllComponentMetrics, IMetrics, IMemoryMetrics, IBundleMetrics } from '../types/performance';
import { throttle } from 'lodash';

interface PerformanceState {
  allMetrics: IAllComponentMetrics;
  selectedComponentId: string | null;
  currentMemoryMetrics: IMemoryMetrics | null;
  bundleMetrics: IBundleMetrics | null;
  memoryHistory: IMemoryMetrics[];
    isApiLimitExceeded: boolean;
  
  // Actions
  setSelectedComponentId: (id: string | null) => void;
  addOrUpdateMetrics: (componentName: string, metrics: IMetrics) => void;
  updateMemoryMetrics: (metrics: IMemoryMetrics | null) => void;
  updateBundleMetrics: (metrics: IBundleMetrics | null) => void;
  setApiLimitExceeded: (hasExceeded: boolean) => void;
}

// Throttling for memory metrics is kept as it is time-series data polled at an interval.
const throttledUpdateMemoryMetrics = throttle((set, metrics) => {
    if (metrics) {
        set((state: PerformanceState) => ({
          currentMemoryMetrics: metrics,
          memoryHistory: [...state.memoryHistory, metrics].slice(-60), // Keep last 60 entries
        }));
      } else {
        set({ currentMemoryMetrics: null });
      }
}, 1000, { leading: true, trailing: true });


export const usePerformanceStore = create<PerformanceState>((set) => ({
  // Initial State
  
  allMetrics: {},
  selectedComponentId: null,
  bundleMetrics: null,
  currentMemoryMetrics: null,
  memoryHistory: [],
  isApiLimitExceeded: false,

  // Actions
  setSelectedComponentId: (id) => set({ selectedComponentId: id }),
  
  /**
   * ✅ REMOVED THROTTLE for component metrics.
   * This ensures that when a component mounts or re-renders, its data is available
   * in the store immediately, fixing the delay bug where details would sometimes not appear on first click.
   */
  addOrUpdateMetrics: (componentName, metrics) => {
    set((state) => ({
      allMetrics: {
        ...state.allMetrics,
        [componentName]: metrics,
      },
    }));
  },
    
  updateMemoryMetrics: (metrics) => {
    throttledUpdateMemoryMetrics(set, metrics);
  },

  updateBundleMetrics: (metrics) => set({ bundleMetrics: metrics }),
  setApiLimitExceeded: (hasExceeded) => set({ isApiLimitExceeded: hasExceeded }),
}));