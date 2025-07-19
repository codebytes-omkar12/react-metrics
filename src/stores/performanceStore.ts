import { create } from 'zustand';
import type { IAllComponentMetrics, IMetrics, IMemoryMetrics, IBundleMetrics } from '../types/performance';

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

export const usePerformanceStore = create<PerformanceState>((set) => ({
  // Initial State
  allMetrics: {},
  selectedComponentId: null,
  bundleMetrics: null,
  currentMemoryMetrics: null,
  memoryHistory: [],

  // Actions
  setSelectedComponentId: (id) => set({ selectedComponentId: id }),
  addOrUpdateMetrics: (componentName, metrics) =>
    set((state) => ({
      allMetrics: { ...state.allMetrics, [componentName]: metrics },
    })),
  
  // ✅ 3. Enhance the updateMemoryMetrics action to manage history
  updateMemoryMetrics: (metrics) => {
    if (metrics) {
      set((state) => ({
        currentMemoryMetrics: metrics,
        memoryHistory: [...state.memoryHistory, metrics].slice(-60), 
      }));
    } else {
      set({ currentMemoryMetrics: null });
    }
  },

  updateBundleMetrics: (metrics) => set({ bundleMetrics: metrics }),
}));