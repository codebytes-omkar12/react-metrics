import React, { useState, useEffect } from "react";
import PerformanceCharts from "./PerformanceCharts";
import { usePerformanceMetrics } from "../context/PerformanceContext";
import { useMemoryMonitor } from "../hooks/useMemoryMonitor";
import SelectedComponentDetails from "./SelectedComponentDetails";
import MemoryComponent from "./MemoryComponent";
import { useBuildHierarchyTree } from "../utils/useBuildHierarchyTree";
import withPerformanceMonitor from "../HOC/withPerformanceMonitor";
import HookAnalysisDashboard from '../components/HookAnalysisDashboard';

interface Props {
  filePath: string | null;
}

const PerformanceDashboard: React.FC<Props> = ({ filePath }) => {
  const { allMetrics, currentMemoryMetrics } = usePerformanceMetrics();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  const buildHierarchyTree = useBuildHierarchyTree(allMetrics);
  const isMemoryMonitoringAvailable = useMemoryMonitor({ intervalMs: 1000 });

 useEffect(() => {
  if (filePath) {
    const filename = filePath.split('/').pop() || "";
    const componentId = filename.replace(/\.[^/.]+$/, "");
    const normalizedId = componentId.charAt(0).toUpperCase() + componentId.slice(1);

    setSelectedComponentId(normalizedId);

    console.log("Selected filePath:", filePath);
    console.log("Derived componentId:", componentId);
    console.log("Normalized ID:", normalizedId);
    console.log("All Metrics keys:", Object.keys(allMetrics));
    console.log("Looking for selected ID:", normalizedId);
  }
}, [filePath]);
   const MonitoredMemoryComponent=withPerformanceMonitor(MemoryComponent,{parentId:"PerformanceDashboard"});
   const MonitoredMetricsCard=withPerformanceMonitor(SelectedComponentDetails,{parentId:"PerformanceDashboard"});
  //  const MonitoredCharts=withPerformanceMonitor(PerformanceCharts,{id:"PerformanceCharts",parentId:"PerformanceDashboard"});

  return (
    <div>
      <div className="flex flex-auto lg:flex-row gap-6 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="flex-[2] min-w-[320px] lg:pl-6 pt-6 lg:pt-0 flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-6 flex-1">
            <MonitoredMetricsCard
              selectedComponentId={selectedComponentId}
              allMetrics={allMetrics}
              buildHierarchyTree={buildHierarchyTree}
              setAiSummary={setAiSummary}
              setLoadingSummary={setLoadingSummary}
            />
            <MonitoredMemoryComponent />
          </div>
        </div>
      </div>

      {aiSummary ? (
        <div
          id="ai-summary-box"
          className="mt-10 mb-10 flex justify-center w-full animate-fadein"
          style={{ minHeight: "2rem" }}
        >
          <div className="w-full max-w-2xl bg-white border border-blue-200 rounded-2xl shadow-lg p-6 transition-opacity duration-700 ease-in-out opacity-100">
            <div className="flex items-center mb-3">
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mr-2 tracking-wide">
                AI Summary
              </span>
            </div>
            <div
              className="text-left h-auto overflow-y-auto text-gray-800 text-base leading-relaxed mr-2"
              style={{ whiteSpace: "pre-wrap", fontFamily: "Inter, sans-serif" }}
              tabIndex={0}
            >
              {aiSummary}
            </div>
          </div>
        </div>
      ) : (
        <>
          {loadingSummary && (
            <div
              id="ai-summary-box"
              className="mt-10 mb-10 flex justify-center w-full animate-fadein"
              style={{ minHeight: "2rem" }}
            >
              <div className="w-full max-w-2xl bg-white border border-blue-200 rounded-2xl shadow-lg p-6 transition-opacity duration-700 ease-in-out opacity-100">
                <div className="flex items-center mb-5">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full tracking-wide">
                    AI Summary
                  </span>
                </div>
                <div
                  className="text-left h-auto overflow-y-auto text-gray-800 text-base leading-relaxed"
                  style={{ whiteSpace: "pre-wrap", fontFamily: "Inter, sans-serif" }}
                  tabIndex={0}
                >
                  <span className="text-blue-500 font-semibold animate-pulse mr-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <PerformanceCharts
        allMetrics={allMetrics}
        currentMemoryMetrics={currentMemoryMetrics}
        isMemoryMonitoringAvailable={isMemoryMonitoringAvailable}
      />
      {filePath && (<HookAnalysisDashboard filePath={filePath}/>)}
        
    </div>
  );
};

// ✅ Set display name so HOC can derive ID dynamically
PerformanceDashboard.displayName = "PerformanceDashboard";

export default PerformanceDashboard;
