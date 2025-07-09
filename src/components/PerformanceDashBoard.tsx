import React, { useState, useEffect } from "react";
import PerformanceCharts from "./PerformanceCharts";
import { usePerformanceMetrics } from "../context/PerformanceContext";
import { useMemoryMonitor } from "../hooks/useMemoryMonitor";
import SelectedComponentDetails from "./SelectedComponentDetails";
import MemoryComponent from "./MemoryComponent";
import { useBuildHierarchyTree } from "../utils/useBuildHierarchyTree";
import withPerformanceMonitor from "../HOC/withPerformanceMonitor";
import HookAnalysisDashboard from '../components/HookAnalysisDashboard';
import HealthMeter from "./HealthMeter";
import { useFilePath } from '../context/FilePathContext';
import { getComponentIdFromPath } from "../utils/getComponentIdFromPath";



const PerformanceDashboard: React.FC = () => {
  const { filePath } = useFilePath(); // ⬅ get context setter
  const { allMetrics, currentMemoryMetrics } = usePerformanceMetrics();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [hookDetails, setHookDetails] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState(0);
   const [hookReady, setHookReady] = useState(false); // ✅


  const buildHierarchyTree = useBuildHierarchyTree(allMetrics);
  const isMemoryMonitoringAvailable = useMemoryMonitor({ intervalMs: 1000 });

  useEffect(() => {
    if (filePath) {
     
      const normalizedId =  getComponentIdFromPath(filePath);
      setSelectedComponentId(normalizedId);

      console.log("Selected filePath:", filePath);
      
      console.log("Normalized ID:", normalizedId);
    }
  }, [filePath]);

  // 🧠 Optimized AI Score Fetch (prevents unnecessary calls)
  useEffect(() => {
    if (!filePath || !hookReady || !selectedComponentId) return;

    const fetchScore = async () => {
      try {
        const response = await fetch("http://localhost:5001/ai/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            metrics: allMetrics[selectedComponentId] ?? {},
            relativeFilePath: filePath,
            hookDetails,
          }),
        });

        const data = await response.json();
        if (typeof data?.score === "number") {
          setHealthScore(data.score);
        } else {
          console.warn("Missing score in response", data);
        }
      } catch (err) {
        console.error("AI Score fetch error:", err);
      }
    };

    fetchScore();
  }, [filePath, hookReady, selectedComponentId]);

  const MonitoredMemoryComponent = withPerformanceMonitor(MemoryComponent, { parentId: "PerformanceDashboard" });
  const MonitoredMetricsCard = withPerformanceMonitor(SelectedComponentDetails, { parentId: "PerformanceDashboard" });

  return (
    <div>
      <div className="dark:text-white flex flex-auto lg:flex-row gap-6 p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex-[2] min-w-[320px] lg:pl-6 pt-6 lg:pt-0 flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-6 flex-1">
            <HealthMeter healthScore={healthScore} />
            <MonitoredMetricsCard
              selectedComponentId={selectedComponentId}
              allMetrics={allMetrics}
              buildHierarchyTree={buildHierarchyTree}
              setAiSummary={setAiSummary}
              setLoadingSummary={setLoadingSummary}
              relativeFilePath={filePath}
              hookDetails={hookDetails}
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
          <div className="w-full max-w-2xl border border-blue-200 rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-3">
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mr-2">
                AI Summary
              </span>
            </div>
            <div className="text-left h-auto overflow-y-auto text-black dark:text-white text-base leading-relaxed" style={{ whiteSpace: "pre-wrap" }}>
              {aiSummary}
            </div>
          </div>
        </div>
      ) : (
        loadingSummary && (
          <div
            id="ai-summary-box"
            className="mt-10 mb-10 flex justify-center w-full animate-fadein"
            style={{ minHeight: "2rem" }}
          >
            <div className="w-full max-w-2xl border border-blue-200 rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-5">
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                  AI Summary
                </span>
              </div>
              <div className="text-left h-auto overflow-y-auto text-gray-800 text-base leading-relaxed">
                <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />
              </div>
            </div>
          </div>
        )
      )}

      <PerformanceCharts
        allMetrics={allMetrics}
        currentMemoryMetrics={currentMemoryMetrics}
        isMemoryMonitoringAvailable={isMemoryMonitoringAvailable}
      />

      {filePath && (
        <HookAnalysisDashboard   onHookDetailsExtracted={(details) => {
            setHookDetails(details);
            setHookReady(true); // ✅ trigger AI scoring once ready
          }} />
      )}
    </div>
  );
};

PerformanceDashboard.displayName = "PerformanceDashboard";
export default PerformanceDashboard;
