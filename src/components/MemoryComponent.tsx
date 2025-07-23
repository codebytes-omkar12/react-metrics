import React from "react";
import { usePerformanceStore } from '../stores/performanceStore';
import { useMemoryMonitor } from "../hooks/useMemoryMonitor";
import withPerformanceMonitor from "../HOC/withPerformanceMonitor";

const MemoryComponent: React.FC = () => {
  function bytesToMB(bytes: number) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  const currentMemoryMetrics = usePerformanceStore((state) => state.currentMemoryMetrics);
  const isMemoryMonitoringAvailable = useMemoryMonitor({ intervalMs: 1000 });

  return (
    <div className="rounded-xl h-auto shadow-md p-6 border border-gray-100 dark:border-gray-700 bg-white dark:bg-card-dark text-gray-800 dark:text-gray-100 flex-auto">
      <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
        Memory Metrics
      </h3>

      {isMemoryMonitoringAvailable ? (
        currentMemoryMetrics ? (
          <table className="w-full border-collapse text-base">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left border border-gray-200 dark:border-gray-600 font-medium">
                  Metric
                </th>
                <th className="px-4 py-2 text-left border border-gray-200 dark:border-gray-600 font-medium">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 text-left border border-gray-200 dark:border-gray-600">
                <td className="px-4 py-2">Used JS Heap Size</td>
                <td className="text-left border border-gray-200 dark:border-gray-600 px-4 py-2">
                  <span className="font-mono">{bytesToMB(currentMemoryMetrics.usedJSHeapSize)}</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-100 dark:hover:bg-gray-700 text-left border border-gray-200 dark:border-gray-600">
                <td className="px-4 py-2">Total JS Heap Size</td>
                <td className="text-left border border-gray-200 dark:border-gray-600 px-4 py-2">
                  <span className="font-mono">{bytesToMB(currentMemoryMetrics.totalJSHeapSize)}</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-100 dark:hover:bg-gray-700 text-left border border-gray-200 dark:border-gray-600">
                <td className="px-4 py-2">Timestamp</td>
                <td className="px-4 py-2">
                  <span className="font-mono">{currentMemoryMetrics.timestamp.toFixed(2)}</span>
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 mt-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm">
            Waiting for memory data...
          </p>
        )
      ) : (
        <p className="text-red-600 dark:text-red-400 mt-4 p-4 border border-dashed border-red-300 dark:border-red-500 rounded-md text-sm">
          Memory monitoring is not available in this browser.
        </p>
      )}
    </div>
  );
};

export default withPerformanceMonitor(MemoryComponent, { id: 'MemoryComponent' });