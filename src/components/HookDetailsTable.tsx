import React from 'react';
import { type HookDetail } from '../types/performance';

export default function HookDetailsTable({ data }: { data: HookDetail[] }) {
  if (!data.length)
    return (
      <p className="text-gray-500 dark:text-gray-300 mt-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm text-center">
        No hooks found in this file.
      </p>
    );

  return (
    <div className="overflow-x-auto mt-4">
      <table className="table-auto w-full border border-gray-300 dark:border-gray-700 text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800 text-center text-gray-800 dark:text-gray-100">
            <th className="px-4 py-2">Hook</th>
            <th className="px-4 py-2">Line</th>
            <th className="px-4 py-2">Source</th>
            <th className="px-4 py-2">Args</th>
            <th className="px-4 py-2">First Arg</th>
            <th className="px-4 py-2">Description</th>
          </tr>
        </thead>
        <tbody className="text-center text-gray-700 dark:text-gray-200">
          {data.map((hook, idx) => (
            <tr key={idx} className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <td className="px-4 py-2 font-mono">{hook.hook}</td>
              <td className="px-4 py-2">{hook.line}</td>
              <td className="px-4 py-2">{hook.source || 'Unknown'}</td>
              <td className="px-4 py-2">{hook.args ?? '-'}</td>
              <td className="px-4 py-2">{hook.firstArg ?? '-'}</td>
              <td className="px-4 py-2 text-left max-w-[300px] break-words">{hook.description ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
