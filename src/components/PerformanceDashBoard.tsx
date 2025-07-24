import React, { useState, useEffect, useRef } from "react";
import { usePerformanceStore } from '../stores/performanceStore';
import HealthMeter from "./HealthMeter";
import AIHealthSummary from "./AIHealthSummary";
import { useFilePath } from '../context/FilePathContext';
import { useHookAnalysis } from "../context/HookAnalysisContext";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";
import withPerformanceMonitor from "../HOC/withPerformanceMonitor";

const PerformanceDashboard: React.FC = React.memo(() => {
    usePerformanceMonitor({id:"PerformanceDashBoard"});
    const selectedComponentId = usePerformanceStore((state) => state.selectedComponentId);
    const { filePath } = useFilePath();
    const [healthScore, setHealthScore] = useState(0);
    const [loadingScore, setLoadingScore] = useState(false);
    const latestRequestId = useRef<number>(0);
    const { hookDetails, hookReady } = useHookAnalysis();
    const [isKeyPresent, setIsKeyPresent] = useState(false);

    useEffect(() => {
        const key = sessionStorage.getItem('gemini_api_key');
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
                const apiKey = sessionStorage.getItem('gemini_api_key');

                const scoreResponse = await fetch("http://localhost:5001/ai/score", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-Key": apiKey || '',
                    },
                    body: JSON.stringify({ metrics: selectedMetrics, relativeFilePath: filePath, hookDetails }),
                });
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
        <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-lg border border-border-light dark:border-border-dark shadow-sm flex flex-col md:flex-row items-center gap-6">
            {!isKeyPresent ? (
                <div className="text-red-500 text-center w-full">Please enter a Gemini API Key to get a health score.</div>
            ) : (
                <>
                    <HealthMeter healthScore={healthScore} loading={loadingScore} />
                    <div className="w-full md:w-px h-px md:h-24 bg-border-light dark:border-border-dark"></div>
                    <AIHealthSummary />
                </>
            )}
        </div>
    );
});

export default withPerformanceMonitor(PerformanceDashboard,{id:"PerformanceDashboard"});