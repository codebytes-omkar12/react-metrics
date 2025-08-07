import { useState, useEffect, useMemo } from 'react';
import HookDetailsTable from './HookDetailsTable';
import { useFilePath } from '../context/FilePathContext';
import { type HookDetail } from '../types/performance';
import { useHookAnalysis } from '../context/HookAnalysisContext';
import withPerformanceMonitor from '../HOC/withPerformanceMonitor';

function HookAnalysisDashboard() {
  const { filePath } = useFilePath();
  const { setHookDetails, setHookReady } = useHookAnalysis();
  const [hookDetails, setLocalHookDetails] = useState<HookDetail[] | null>(null);

  useEffect(() => {
    if (!filePath) {
      setLocalHookDetails(null);
      return;
    }
    setLocalHookDetails(null);
    const fetchHookDetails = async () => {
      try {
        const res = await fetch("/api/analyze", {
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
          setLocalHookDetails([]);
          setHookDetails([]);
          setHookReady(false);
        }
      } catch (err) {
        setLocalHookDetails([]);
        setHookDetails([]);
        setHookReady(false);
      }
    };
    fetchHookDetails();
  }, [filePath, setHookDetails, setHookReady]);

  const hookCounts = useMemo(() => {
    if (!hookDetails) return {};
    return hookDetails.reduce((acc: Record<string, number>, hook) => {
      acc[hook.hook] = (acc[hook.hook] || 0) + 1;
      return acc;
    }, {});
  }, [hookDetails]);

  if (!hookDetails || hookDetails.length === 0) {
    return null;
  }

  return (
    <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg border border-border-light dark:border-border-dark shadow-sm animate-fade-in-up">
      <h2 className="text-2xl font-bold pb-2 border-b border-border-light dark:border-border-dark">
        🧩 Hook Analysis Report
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <h3 className="font-semibold text-lg mb-2">Unique Hooks Used:</h3>
          <div className="bg-background-light dark:bg-background-dark p-3 rounded">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border-light dark:border-border-dark">
                  <th className="p-2 font-semibold">Hook</th>
                  <th className="p-2 font-semibold text-right">Instances</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(hookCounts).map(([hookName, count]) => (
                  <tr key={hookName} className="border-t border-border-light dark:border-border-dark">
                    <td className="p-2 font-mono">{hookName}</td>
                    <td className="p-2 font-mono text-right">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div >
          <h3 className="font-semibold text-lg mb-2">Hook Summary:</h3>
          < div className='bg-background-light dark:bg-background-dark p-3 rounded'>
          <ul className="space-y-2 text-sm ">
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
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3 pt-4 border-t border-border-light dark:border-border-dark">
          🗂️ Full Hook Details
        </h3>
        <HookDetailsTable data={hookDetails} />
      </div>
    </div>
  );
}

export default withPerformanceMonitor(HookAnalysisDashboard, { id: 'HookAnalysisDashboard' });