import { useRef, useEffect } from 'react';
import type { IMemoryMetrics } from '../types/performance';
// 1. We import the Zustand store now
import { usePerformanceStore } from '../stores/performanceStore';

export function useMemoryMonitor(options?: { intervalMs: number }) {
  const { intervalMs = 1000 } = options || {};
  const intervalRef = useRef<number>(0);
  const isApiAvailableRef = useRef<boolean>(true);

  // 2. We get the update action from our new store
  const updateMemoryMetrics = usePerformanceStore((state) => state.updateMemoryMetrics);

  useEffect(() => {
    if (!(performance && (performance as any).memory)) {
      isApiAvailableRef.current = false;
      console.warn("MemoryMonitoring not possible for this component");
      updateMemoryMetrics(null);
      return;
    }
    
    isApiAvailableRef.current = true;
       
    function sampleMemory() {
      const { jsHeapSizeLimit, usedJSHeapSize, totalJSHeapSize } = (performance as any).memory;
      const currentTimeStamp = performance.now();
      const updatedMemoryMetrics: IMemoryMetrics = {
        jsHeapSizeLimit,
        totalJSHeapSize,
        usedJSHeapSize,
        timestamp: currentTimeStamp
      };
      // 3. This now calls the action on our Zustand store
      updateMemoryMetrics(updatedMemoryMetrics);
    };

    const timeoutId = setTimeout(() => {
      sampleMemory();
    }, 500);
    
    intervalRef.current = window.setInterval(() => {
      sampleMemory();
    }, intervalMs);
  
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalRef.current);
    }
  }, [intervalMs, updateMemoryMetrics]);

  return isApiAvailableRef.current;
}