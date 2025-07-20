import { useState, useEffect } from 'react';
import HookDetailsTable from './HookDetailsTable';
import { useFilePath } from '../context/FilePathContext';
import { type HookDetail } from '../types/performance';
import { useHookAnalysis } from '../context/HookAnalysisContext';
import withPerformanceMonitor from '../HOC/withPerformanceMonitor'; // ✅ Import the HOC
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

function HookAnalysisDashboard() {
  usePerformanceMonitor({
    id: 'HookAnalysisDashboard',
  });

  const { filePath } = useFilePath();
  const { setHookDetails, setHookReady } = useHookAnalysis();
  const [hookDetails, setLocalHookDetails] = useState<HookDetail[] | null>(null);

  useEffect(() => {
    if (!filePath) {
      setLocalHookDetails(null); // Clear details when no file is selected
      return;
    }

    setLocalHookDetails(null); // Show loading state immediately

    const fetchHookDetails = async () => {
      try {
        const res = await fetch("http://localhost:5001/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ relativeFilePath: filePath }),
        });

        if (!res.ok) throw new Error('Failed to fetch hook details');

        const data = await res.json();

        if (Array.isArray(data)) {
          setLocalHookDetails(data);
          setHookDetails(data);
          setHookReady(true);
        } else {
          console.error("Invalid hook data:", data);
          setLocalHookDetails([]);
          setHookDetails([]);
          setHookReady(false);
        }
      } catch (err) {
        console.error("Error analyzing hooks:", err);
        setLocalHookDetails([]);
        setHookDetails([]);
        setHookReady(false);
      }
    };

    fetchHookDetails();
  }, [filePath, setHookDetails, setHookReady]);

  const hooksUsed = hookDetails
    ? Array.from(new Set(hookDetails.map((h) => h.hook)))
    : [];

  // Don't render anything if no file is selected or no hooks are found
  if (!hookDetails || hookDetails.length === 0) {
    return null;
  }

  return (
    <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg border border-border-light dark:border-border-dark shadow-sm animate-fade-in-up space-y-6">
        <h2 className="text-2xl font-bold pb-2 border-b border-border-light dark:border-border-dark">
            🧩 Hook Analysis Report
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="font-semibold text-lg mb-2">Unique Hooks Used:</h3>
                <div className="bg-background-light dark:bg-background-dark p-3 rounded font-mono text-sm">
                    {hooksUsed.join(', ')}
                </div>
            </div>
            <div>
                <h3 className="font-semibold text-lg mb-2">Hook Summary:</h3>
                <ul className="space-y-2 text-sm">
                    {hookDetails.map((hook, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-primary-light dark:text-primary-dark bg-primary-light/10 dark:bg-primary-dark/10 px-2 py-1 rounded">
                          {hook.hook}
                        </span>
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">
                          used on line {hook.line}
                        </span>
                      </li>
                    ))}
                </ul>
            </div>
        </div>

        <div>
            <h3 className="text-xl font-semibold mb-3 pt-4 border-t border-border-light dark:border-border-dark">
                🗂️ Full Hook Details
            </h3>
            <HookDetailsTable data={hookDetails} />
        </div>
    </div>
  );
}

// ✅ Export the component wrapped in the HOC with an explicit ID
export default HookAnalysisDashboard;