import React, { useState, useEffect, useRef } from "react";
import PerformanceCharts from "./PerformanceCharts";
import { useMemoryMonitor } from "../hooks/useMemoryMonitor";
import { usePerformanceStore } from '../stores/performanceStore';
import SelectedComponentDetails from "./SelectedComponentDetails";
import MemoryComponent from "./MemoryComponent";
import { useBuildHierarchyTree } from "../utils/useBuildHierarchyTree";
import HealthMeter from "./HealthMeter";
import { useFilePath } from '../context/FilePathContext';
import { useHookAnalysis } from "../context/HookAnalysisContext";

const PerformanceDashboard: React.FC = React.memo(() => {
    // ✅ CORRECT: Select each piece of state individually.
    // This component will now only re-render if one of these specific values changes.
    const selectedComponentId = usePerformanceStore((state) => state.selectedComponentId);
    const allMetrics = usePerformanceStore((state) => state.allMetrics);
    const currentMemoryMetrics = usePerformanceStore((state) => state.currentMemoryMetrics);

    const { filePath } = useFilePath();
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [healthScore, setHealthScore] = useState(0);
    const [loadingScore, setLoadingScore] = useState(false);
    const latestRequestId = useRef<number>(0);

    const buildHierarchyTree = useBuildHierarchyTree(allMetrics);
    const isMemoryMonitoringAvailable = useMemoryMonitor({ intervalMs: 1000 });
    const { hookDetails, hookReady } = useHookAnalysis();

    useEffect(() => {
        if (!filePath || !hookReady || !selectedComponentId) return;

        const currentRequestId = Date.now();
        latestRequestId.current = currentRequestId;

        const fetchScore = async () => {
            setLoadingScore(true);
            try {
                // We use .getState() here to avoid adding allMetrics to the
                // dependency array, making the effect more efficient.
                const selectedMetrics = usePerformanceStore.getState().allMetrics[selectedComponentId] ?? {};
                
                const response = await fetch("http://localhost:5001/ai/score", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        metrics: selectedMetrics,
                        relativeFilePath: filePath,
                        hookDetails,
                    }),
                });

                const data = await response.json();
                if (latestRequestId.current === currentRequestId) {
                    if (typeof data?.score === "number") {
                        setHealthScore(data.score);
                    } else {
                        console.warn("Missing score in response", data);
                    }
                }
            } catch (err) {
                if (latestRequestId.current === currentRequestId) {
                    console.error("AI Score fetch error:", err);
                }
            } finally {
                if (latestRequestId.current === currentRequestId) {
                    setLoadingScore(false);
                }
            }
        };

        fetchScore();
    // The dependency array is now much more stable.
    }, [filePath, hookReady, selectedComponentId, hookDetails]);
    
    return (
        <div>
            <div className="dark:text-white flex flex-auto lg:flex-row gap-6 p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex-[2] min-w-[320px] lg:pl-6 pt-6 lg:pt-0 flex flex-col gap-6">
                    <div className="flex flex-col lg:flex-row gap-6 flex-1">
                        <HealthMeter healthScore={healthScore} loading={loadingScore} />
                        <SelectedComponentDetails
                            selectedComponentId={selectedComponentId}
                            buildHierarchyTree={buildHierarchyTree}
                            setAiSummary={setAiSummary}
                            setLoadingSummary={setLoadingSummary}
                            relativeFilePath={filePath}
                            hookDetails={hookDetails}
                        />
                        <MemoryComponent />
                    </div>
                </div>
            </div>

            {/* AI Summary Section */}
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
        </div>
    );
});

PerformanceDashboard.displayName = "PerformanceDashboard";
export default PerformanceDashboard;