import { useRef, useEffect } from 'react';
import type { IMemoryMetrics } from '../types/performance';
import { usePerformanceStore } from '../stores/performanceStore';

export function useMemoryMonitor(options?: { intervalMs: number }) {
  const { intervalMs = 1000 } = options || {};
  const intervalRef = useRef<number>(0);
  const isApiAvailableRef = useRef<boolean>(true);

  // This action is now correctly throttled within the Zustand store.
  const updateMemoryMetrics = usePerformanceStore((state) => state.updateMemoryMetrics);

  useEffect(() => {
    if (!(performance && (performance as any).memory)) {
      isApiAvailableRef.current = false;
      console.warn("MemoryMonitoring is not available in this browser");
      updateMemoryMetrics(null);
      return;
    }
    
    isApiAvailableRef.current = true;
       
    const sampleMemory = () => {
      const { jsHeapSizeLimit, usedJSHeapSize, totalJSHeapSize } = (performance as any).memory;
      const currentTimeStamp = performance.now();
      const updatedMemoryMetrics: IMemoryMetrics = {
        jsHeapSizeLimit,
        totalJSHeapSize,
        usedJSHeapSize,
        timestamp: currentTimeStamp
      };
      // This call now invokes the throttled action in the store.
      updateMemoryMetrics(updatedMemoryMetrics);
    };

    const timeoutId = setTimeout(() => {
      sampleMemory();
    }, 500);
    
    intervalRef.current = window.setInterval(sampleMemory, intervalMs);
  
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalRef.current);
    }
  }, [intervalMs, updateMemoryMetrics]);

  return isApiAvailableRef.current;
}