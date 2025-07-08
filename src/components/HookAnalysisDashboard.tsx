import { useState, useEffect } from 'react';
import HookDetailsTable from './HookDetailsTable';
import { type HookDetail } from '../types/performance';

interface Props {
  filePath: string;
   onHookDetailsExtracted: (details: any[]) => void;
}

export default function HookAnalysisDashboard({ filePath,onHookDetailsExtracted }: Props) {
  const [hookDetails, setHookDetails] = useState<HookDetail[] | null>(null);


  useEffect(() => {
  if (!filePath) return;

  const fetchHookDetails = async () => {
    try {
      const res = await fetch("http://localhost:5001/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relativeFilePath: filePath }),
      });

      const hookData = await res.json();
      onHookDetailsExtracted(hookData);
      
    } catch (error) {
      console.error("Error fetching hook details:", error);
    }
  };

  fetchHookDetails();
}, [filePath]);
  const handleAnalyze = async (filePath: string) => {
    try {
      const res = await fetch('http://localhost:5001/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relativeFilePath: filePath }),
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setHookDetails(data);
      } else {
        console.error('Invalid response from server:', data);
        setHookDetails([]);
      }
    } catch (err) {
      console.error('Error analyzing file:', err);
      setHookDetails([]);
    }
  };

  useEffect(() => {
    if (filePath) {
      handleAnalyze(filePath);
    }
  }, [filePath]);

  const hooksUsed = hookDetails
    ? Array.from(new Set(hookDetails.map((h) => h.hook)))
    : [];

  return (
    <div className="p-4 space-y-6 text-gray-800 dark:text-gray-100">
      {hookDetails && hookDetails.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold mb-3 border-b pb-1 dark:border-gray-600">
            🧩 Hook Analysis Report
          </h2>

          <ul className="space-y-3">
            {hookDetails.map((hook, index) => (
              <li
                key={index}
                className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md shadow-sm"
              >
                <p>
                  <span className="font-mono font-semibold text-blue-800 dark:text-blue-300">
                    {hook.hook}
                  </span>{' '}
                  used on line{' '}
                  <span className="font-mono">{hook.line}</span>
                </p>
                {hook.description && (
                  <p className="text-sm italic text-gray-600 dark:text-gray-400 mt-1">
                    “{hook.description}”
                  </p>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-1">🧠 Unique Hooks Used:</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded font-mono text-sm text-gray-900 dark:text-gray-100">
              {hooksUsed.join(', ')}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-3 border-b pb-1 dark:border-gray-600">
              🗂️ Full Hook Details
            </h3>
            <HookDetailsTable data={hookDetails} />
          </div>
        </div>
      ) : (
        <p className="mt-6 text-center text-gray-500 dark:text-gray-400 text-lg font-medium">
          No React Hooks found in this file.
        </p>
      )}
    </div>
  );
}
