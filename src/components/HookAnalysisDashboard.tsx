import  { useState } from 'react';
import HookFilePicker from './FilePickerComponent';
// import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import HookDetailsTable from './HookDetailsTable';

interface HookDetail {
  name: string;
  line: number;
  importedFrom: string;
  description?: string;
  numArgs: number;
  firstArgSummary?: string;
}

export default function HookAnalysisDashboard() {
  const [result, setResult] = /*State Variable to store  an object containing the hookDetails array and hookUsed array*/useState<{
    hookDetails: HookDetail[];
    hooksUsed: string[];
  } | null>(null);

  const handleAnalyze = async (filePath: string) => {
    const res = await fetch('http://localhost:5001/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relativeFilePath: filePath }),
    });


    const data = await res.json();
    if (Array.isArray(data.hookDetails)) {
      setResult(data);
    } else {
      console.error('Invalid response from server:', data);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <HookFilePicker onAnalyze={handleAnalyze} />

      {(result?.hookDetails?.length ?? 0) > 0 ? (
        <div>
          <h2 className="text-lg font-bold mb-2">Hooks Found:</h2>
          <ul className="space-y-2 text-red-900">
            {result?.hookDetails.map((hook, index) => (
              <li key={index} className="bg-gray-100 p-2 rounded shadow-sm">
                <strong>{hook.name}</strong> @ line {hook.line}
                <br />
                {hook.description && (
                  <span className="text-sm italic">“{hook.description}”</span>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <h3 className="font-semibold">Unique Hooks Used:</h3>
            <code>{JSON.stringify(result?.hooksUsed)}</code>
          </div>

          {/* <BarChart
            width={400}
            height={300}
            data={result?.hookDetails.map((h) => ({ name: h.name, count: 1 }))}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart> */}

          <HookDetailsTable data={result?.hookDetails ?? []} />
        </div>
      ) : (
        <p className="mt-6 text-center text-gray-500 text-lg font-semibold">
          No Hooks in this file
        </p>
      )}
    </div>
  );
}
