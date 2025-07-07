import { useState, useEffect } from 'react';
import HookDetailsTable from './HookDetailsTable';
import { type HookDetail } from '../types/performance';

interface Props {
  filePath: string;
}

export default function HookAnalysisDashboard({ filePath }: Props) {
  const [hookDetails, setHookDetails] = useState<HookDetail[] | null>(null);

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

  // 🔁 Trigger analysis when filePath changes
  useEffect(() => {
    if (filePath) {
      handleAnalyze(filePath);
    }
  }, [filePath]);

  const hooksUsed = hookDetails
    ? Array.from(new Set(hookDetails.map((h) => h.hook)))
    : [];

  return (
    <div className="p-4 space-y-4">
      {hookDetails && hookDetails.length > 0 ? (
        <div>
          <h2 className="text-lg font-bold mb-2">Hooks Found:</h2>
          <ul className="space-y-2 text-red-900">
            {hookDetails.map((hook, index) => (
              <li key={index} className="bg-gray-100 p-2 rounded shadow-sm">
                <strong>{hook.hook}</strong> @ line {hook.line}
                <br />
                {hook.description && (
                  <span className="text-sm italic">“{hook.description}”</span>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <h3 className="font-semibold text-red-950">Unique Hooks Used:</h3>
            <code className='text-red-900'>{JSON.stringify(hooksUsed)}</code>
          </div>

          <HookDetailsTable data={hookDetails} />
        </div>
      ) : (
        <p className="mt-6 text-center text-gray-500 text-lg font-semibold">
          No Hooks in this file
        </p>
      )}
    </div>
  );
}
