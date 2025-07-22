import React, { useMemo, useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import { type IMetrics, type IMemoryMetrics } from '../types/performance';
import { usePerformanceStore } from '../stores/performanceStore';
import { useMemoryMonitor } from "../hooks/useMemoryMonitor";
import withPerformanceMonitor from '../HOC/withPerformanceMonitor';

const bytesToMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);
const formatTimeStamp = (timeStamp: number) => `${(timeStamp / 1000).toFixed(2)}s`;

const PerformanceCharts: React.FC = () => {
  const allMetrics = usePerformanceStore((state) => state.allMetrics);
  const currentMemoryMetrics = usePerformanceStore((state) => state.currentMemoryMetrics);
  const [memoryHistory, setMemoryHistory] = useState<IMemoryMetrics[]>([]);
  const isMemoryMonitoringAvailable = useMemoryMonitor({ intervalMs: 1000 });

  useEffect(() => {
    if (currentMemoryMetrics) {
      setMemoryHistory(prev => {
        const newHistory = [...prev, currentMemoryMetrics];
        return newHistory.length > 60 ? newHistory.slice(-60) : newHistory;
      });
    }
  }, [currentMemoryMetrics]);

  const componentChartData = useMemo(() => {
    return Object.values(allMetrics)
      .filter((metric: IMetrics) => metric.displayName !== 'Application Root' && metric.reRenders > 0)
      .sort((a: IMetrics, b: IMetrics) => b.reRenders - a.reRenders)
      .map((metric: IMetrics) => ({
        name: metric.id,
        reRenders: metric.reRenders,
        lastRenderDuration: parseFloat(metric.lastRenderDuration.toFixed(2)),
        totalRenderDuration: parseFloat(metric.lastRenderDuration.toFixed(2)),
      }));
  }, [allMetrics]);

  return (
    <div className="flex flex-col gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 flex-1 min-h-[300px]">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
          Component Re-renders (Top 10)
        </h3>
        {componentChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={componentChartData.slice(0, 10)} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} interval={0} style={{ fontSize: '10px' }} />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: '#2d3748', color: '#fff' }} />
              <Legend />
              <Bar dataKey="reRenders" fill="#8884d8" name="Re-renders" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 mt-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm">
            No component re-render data yet.
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 flex-1 min-h-[300px]">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
          Component Last Render Duration (Top 10)
        </h3>
        {componentChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={componentChartData.slice(0, 10).sort((a, b) => b.lastRenderDuration - a.lastRenderDuration)}
              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} interval={0} style={{ fontSize: '10px' }} />
              <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
              <Tooltip contentStyle={{ backgroundColor: '#2d3748', color: '#fff' }} />
              <Legend />
              <Bar dataKey="lastRenderDuration" fill="#82ca9d" name="Last Render (ms)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 mt-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm">
            No component render duration data yet.
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 flex-1 min-h-[300px]">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
          Memory Usage Over Time
        </h3>
        {memoryHistory.length > 1 && isMemoryMonitoringAvailable ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={memoryHistory} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTimeStamp}
                interval="preserveStartEnd"
                style={{ fontSize: '10px' }}
              />
              <YAxis
                label={{ value: 'MB', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => bytesToMB(value)}
              />
              <Tooltip
                formatter={(value: number) => [`${bytesToMB(value)}`, 'Memory']}
                labelFormatter={formatTimeStamp}
                contentStyle={{ backgroundColor: '#2d3748', color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="usedJSHeapSize" stroke="#ffc658" name="Used Heap" dot={false} />
              <Line type="monotone" dataKey="totalJSHeapSize" stroke="#ff7300" name="Total Heap" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 mt-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm">
            {isMemoryMonitoringAvailable
              ? "Not enough memory data yet to plot."
              : "Memory monitoring is not available in this browser."}
          </p>
        )}
      </div>
    </div>
  );
};

export default withPerformanceMonitor(PerformanceCharts, { id: 'PerformanceCharts' });