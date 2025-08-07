import React, { useState, useEffect, useRef } from "react";
import { usePerformanceStore } from '../stores/performanceStore';
import HealthMeter from "./HealthMeter";
import AIHealthSummary from "./AIHealthSummary";
import { useFilePath } from '../context/FilePathContext';
import { useHookAnalysis } from "../context/HookAnalysisContext";
import withPerformanceMonitor from "../HOC/withPerformanceMonitor";
import { Sparkles } from "lucide-react";

const PerformanceDashboard: React.FC = React.memo(() => {
  const { setApiLimitExceeded } = usePerformanceStore.getState();
    const selectedComponentId = usePerformanceStore((state) => state.selectedComponentId);
    const { filePath } = useFilePath();
    const [healthScore, setHealthScore] = useState(0);
    const [loadingScore, setLoadingScore] = useState(false);
    const latestRequestId = useRef<number>(0);
    const { hookDetails, hookReady } = useHookAnalysis();
    const [isKeyPresent, setIsKeyPresent] = useState(false);

    useEffect(() => {
        const key = localStorage.getItem('gemini_api_key');
        setIsKeyPresent(!!key);

        if (!filePath || !hookReady || !selectedComponentId || !key) {
            setHealthScore(0);
            return;
        };

        const currentRequestId = Date.now();
        latestRequestId.current = currentRequestId;
        setHealthScore(0);

        const fetchScore = async () => {
        setLoadingScore(true);
        try {
            const selectedMetrics = usePerformanceStore.getState().allMetrics[selectedComponentId] ?? {};
            const apiKey = localStorage.getItem('gemini_api_key');

            const scoreResponse = await fetch("/api/ai/score", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": apiKey || '',
                },
                body: JSON.stringify({ metrics: selectedMetrics, relativeFilePath: filePath, hookDetails }),
            });
            
            // Check for HTTP errors, especially 429 for rate limiting
            if (!scoreResponse.ok) {
                if (scoreResponse.status === 429) {
                    console.error("API rate limit exceeded.");
                    setApiLimitExceeded(true);
                }
                // Throw an error to stop execution and go to the catch block
                throw new Error(`HTTP error status: ${scoreResponse.status}`);
            }

            // If the request was successful, ensure the error state is cleared
            setApiLimitExceeded(false);

            const scoreData = await scoreResponse.json();

            if (latestRequestId.current === currentRequestId && typeof scoreData?.score === "number") {
                setHealthScore(scoreData.score);
            }
        } catch (err) {
            if (latestRequestId.current === currentRequestId) {
                console.error("AI score fetch error:", err);
                setHealthScore(0);
            }
        } finally {
            if (latestRequestId.current === currentRequestId) {
                setLoadingScore(false);
            }
        }
    };
        fetchScore();
    }, [filePath, hookReady, selectedComponentId, hookDetails]);

    return (
        
        <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-lg border border-border-light dark:border-border-dark shadow-sm">
  {/* 1. The title is now a direct child of the card, positioned at the top. */}
  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
    <Sparkles className="text-primary-light dark:text-primary-dark" size={20} />
    AI Health Summary
  </h3>

  {/* 2. This new div now controls the layout of the content below the title. */}
  <div className="flex flex-col md:flex-row items-center gap-6">
    {!isKeyPresent ? (
      <div className="text-red-500 text-center w-full">
        Please enter a Gemini API Key to get a health score.
      </div>
    ) : (
      <>
        <HealthMeter healthScore={healthScore} loading={loadingScore} />
        
        {/* This divider will now correctly separate the items in the row/column. */}
        <div className="w-full md:w-px h-px md:h-24 bg-border-light dark:border-border-dark"></div>
        
        <AIHealthSummary />
      </>
    )}
  </div>
</div>

    );
});

export default withPerformanceMonitor(PerformanceDashboard,{id:"PerformanceDashBoard"});