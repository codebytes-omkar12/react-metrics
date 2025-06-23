import React from "react";
import { useMemoryMonitor } from "../hooks/useMemoryMonitor";
import { usePerformanceMetrics } from "../context/PerformanceContext";

const MemoryComponent: React.FC = () => {
    function bytesToMB(bytes: number) {
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    const { bundleMetrics, currentMemoryMetrics } = usePerformanceMetrics();
    const isMemoryMonitoringAvailable = useMemoryMonitor({ intervalMs: 1000 });
    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex-auto">
             
            {/* flex-1 allows it to take half width */} 
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Memory Metrics
            </h3>
             
            {isMemoryMonitoringAvailable ? (
                currentMemoryMetrics ? (
                    <table className="w-full border-collapse text-sm text-gray-700">
                         
                        <thead className="bg-gray-50">
                             
                            <tr>
                                 
                                <th className="px-4 py-2 text-left border border-gray-200 font-medium">
                                    Metric
                                </th>
                                 
                                <th className="px-4 py-2 text-left border border-gray-200 font-medium">
                                    Value
                                </th>
                                 
                            </tr>
                             
                        </thead>
                         
                        <tbody>
                             
                            <tr className="bg-white hover:bg-gray-50">
                                <td>Used JS Heap Size</td>
                                <td>
                                    <span className="font-mono">
                                        {bytesToMB(currentMemoryMetrics.usedJSHeapSize)} 
                                    </span>
                                </td>
                            </tr>
                             
                            <tr className="bg-gray-50 hover:bg-gray-100">
                                <td>Total JS Heap Size</td>
                                <td>
                                    <span className="font-mono">
                                        {bytesToMB(currentMemoryMetrics.totalJSHeapSize)} 
                                    </span>
                                </td>
                            </tr>
                             
                            <tr className="bg-white hover:bg-gray-50">
                                <td>JS Heap Size Limit</td>
                                <td>
                                    <span className="font-mono">
                                        {bytesToMB(currentMemoryMetrics.jsHeapSizeLimit)}
                                    </span>
                                </td>
                            </tr>
                             
                            <tr className="bg-gray-50 hover:bg-gray-100">
                                <td>Timestamp</td>
                                <td>
                                    <span className="font-mono">
                                        {currentMemoryMetrics.timestamp.toFixed(2)}
                                    </span>
                                </td>
                            </tr>
                             
                        </tbody>
                         
                    </table>
                ) : (
                    <p className="text-gray-600 mt-4 p-4 border border-dashed border-gray-300 rounded-md text-sm">
                        Waiting for memory data...
                    </p>
                )
            ) : (
                <p className="text-red-600 mt-4 p-4 border border-dashed border-red-300 rounded-md text-sm">
                    Memory monitoring is not available in this browser.
                </p>
            )}
             
            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4 pb-2 border-b border-gray-200">
                Bundle Metrics
            </h3>
             
            {bundleMetrics ? (
                <p className="text-gray-700 mt-4 text-sm">
                    <strong className="font-medium text-gray-800">
                        Total Bundle Size:
                    </strong> 
                    <span className="font-mono">
                        {bundleMetrics.totalSizeKB.toFixed(2)} KB
                    </span>
                </p>
            ) : (
                <p className="text-gray-600 mt-4 p-4 border border-dashed border-gray-300 rounded-md text-sm">
                    Bundle metrics not available yet.
                </p>
            )}

        </div>
    );
};

export default MemoryComponent;
