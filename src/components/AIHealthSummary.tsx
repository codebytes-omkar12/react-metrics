import React, { useState, useEffect, useRef } from 'react';
import { usePerformanceStore } from '../stores/performanceStore';
import { useFilePath } from '../context/FilePathContext';
import { useHookAnalysis } from '../context/HookAnalysisContext';
import withPerformanceMonitor from '../HOC/withPerformanceMonitor';

const AIHealthSummary: React.FC = React.memo(() => {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const latestRequestId = useRef<number>(0);
  const summaryRef = useRef<HTMLParagraphElement | null>(null);
  const selectedComponentId = usePerformanceStore((state) => state.selectedComponentId);
  const { filePath } = useFilePath();
  const { hookDetails, hookReady } = useHookAnalysis();
  const [isKeyPresent, setIsKeyPresent] = useState(false);
  const { setApiLimitExceeded } = usePerformanceStore.getState();

  useEffect(() => {
    const key = localStorage.getItem('gemini_api_key');
    setIsKeyPresent(!!key);

    if (!filePath || !hookReady || !selectedComponentId || !key) {
      setAiSummary(null);
      return;
    }

    const currentRequestId = Date.now();
    latestRequestId.current = currentRequestId;

    const fetchSummary = async () => {
      setLoadingSummary(true);
      if(summaryRef.current) {
        summaryRef.current.textContent = "";
      }
      setAiSummary("");

      try {
        const selectedMetrics = usePerformanceStore.getState().allMetrics[selectedComponentId] ?? {};
        const apiKey = localStorage.getItem('gemini_api_key');

        const summaryResponse = await fetch("http://localhost:5001/ai/summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey || '',
          },
          body: JSON.stringify({ metrics: selectedMetrics, relativeFilePath: filePath, hookDetails }),
        });

        if (!summaryResponse.ok) {
            if (summaryResponse.status === 429) {
                console.error("API rate limit exceeded.");
                setApiLimitExceeded(true);
            }
            throw new Error(`HTTP error status: ${summaryResponse.status}`);
        }

        // On success, reset the API limit exceeded flag
        setApiLimitExceeded(false);

        if (!summaryResponse.body) {
          throw new Error("Failed to fetch AI summary stream.");
        }

        const reader = summaryResponse.body.getReader();
        const decoder = new TextDecoder();

        setLoadingSummary(false);
        let finalSummaryText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (latestRequestId.current !== currentRequestId) break;

          const chunk = decoder.decode(value, { stream: true });
          finalSummaryText += chunk;

          for (const char of chunk) {
            if(summaryRef.current){
               summaryRef.current.textContent+=char;
            }
            await new Promise(r => setTimeout(r, 20));
          }
        }
         setAiSummary(finalSummaryText);
      } catch (err) {
        if (latestRequestId.current === currentRequestId) {
          console.error("AI summary fetch error:", err);
           if (!usePerformanceStore.getState().isApiLimitExceeded) {
              const errorMessage = "Could not retrieve AI summary. Please check the console.";
              if (summaryRef.current) {
                summaryRef.current.textContent = errorMessage;
              }
              setAiSummary(errorMessage);
           }
        }
      } finally {
        if (latestRequestId.current === currentRequestId) {
          setLoadingSummary(false);
        }
      }
    };

    fetchSummary();
  }, [filePath, hookReady, selectedComponentId, hookDetails, setApiLimitExceeded]);

  return (
    <div className="flex-1 flex flex-col justify-center w-auto">
      <div className="min-h-[60px]">
        {!isKeyPresent ? (
          <p className="text-red-500">Please enter a Gemini API Key to use this feature.</p>
        ) : loadingSummary ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
          </div>
        ) : (
          <p ref={summaryRef} className="text-text-secondary-light dark:text-text-secondary-dark text-lg" style={{ whiteSpace: "pre-wrap" }}>
            {aiSummary ?? "Select a component file to analyze its health."}
          </p>
        )}
      </div>
    </div>
  );
});

export default withPerformanceMonitor(AIHealthSummary,{id:"AIHealthSummary"});