import React, { useMemo } from 'react'
import { findPathInTree } from '../utils/findPathInTree'
import { type IAllComponentMetrics, type IHierarchyNode, } from '../types/performance'



interface SelectedComponentDetailProps {
  selectedComponentId: string | null;
  allMetrics: IAllComponentMetrics;
  buildHierarchyTree: IHierarchyNode[]
  setAiSummary:React.Dispatch<React.SetStateAction<string | null>>;
  setLoadingSummary: (loading: boolean) => void;
  loadingSummary?: boolean;
 
}

const SelectedComponentDetails: React.FC<SelectedComponentDetailProps> = React.memo(({ selectedComponentId, allMetrics, buildHierarchyTree, setAiSummary, setLoadingSummary, loadingSummary }) => {

  // Memoize selectedMetrics to avoid unnecessary recalculation and re-renders
  const selectedMetrics = useMemo(() => (
    selectedComponentId ? allMetrics[selectedComponentId] : null
  ), [selectedComponentId, allMetrics]);
// React.MouseEvent<HTMLButtonElement, MouseEvent>
  const handleGetAISummary = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  e.preventDefault();
  e.stopPropagation();
  setLoadingSummary(true);
  setAiSummary(null);

  if (!selectedComponentId || !selectedMetrics) {
    console.warn('Component or metrics not ready.');
    return;
  }

  document.getElementById('ai-summary-box')?.scrollIntoView({ behavior: 'smooth' });

  try {
    const res = await fetch('http://localhost:5001/ai/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics: selectedMetrics })
    });
    

    if (!res.ok || !res.body) {
      const errorText = await res.text();
      console.error('AI summary fetch failed:', errorText);
      setAiSummary('Failed to fetch AI summary.');
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
// const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  let chunkCount = 0;

while (true) {
  const { done, value } = await reader.read();
  // console.log('Raw Uint8Array:', value);
  // console.log('Byte length:', value?.length);
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  
  
 chunkCount++;

      // ✅ Log chunk in debugger-style format
      console.log(`Chunk ${chunkCount}: ${chunk}`);

  // Typewriter effect: one char at a time
  for (const char of chunk) {
    await new Promise((r) => setTimeout(r, 25)); // simulate typing
    setAiSummary((prev) => (prev ?? "") + char);
  }
}

  } catch (err) {
    console.error('AI summary fetch error:', err);
    setAiSummary('Failed to fetch AI summary: ' + (err instanceof Error ? err.message : String(err)));
  } finally {
    setLoadingSummary(false);
  }
};

  // console.log('selectedComponentId:', selectedComponentId, 'selectedMetrics:', selectedMetrics);
SelectedComponentDetails.displayName = "SelectedComponentDetails";


  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex-auto">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Component Details</h3>
      {selectedMetrics ? (
        <div className="space-y-2 text-gray-700 text-sm">
          <p><strong className="font-medium text-gray-800  w-32">ID:</strong> {selectedMetrics.id}</p>
          <p><strong className="font-medium text-gray-800  w-32">Display Name:</strong> {selectedMetrics.displayName}</p>
          <p><strong className="font-medium text-gray-800  w-32">Path:</strong> {

            findPathInTree(buildHierarchyTree, selectedMetrics.id) || 'N/A'
          }</p>
          <p><strong className="font-medium text-gray-800  w-32">Parent ID:</strong> {selectedMetrics.parentId || 'None'}</p>
          <p><strong className="font-medium text-gray-800  w-32">Mount Time:</strong> {selectedMetrics.mountTime.toFixed(2)} ms</p>
          <p ><strong className="font-medium text-gray-800  w-32">Last Render Duration:</strong> {selectedMetrics.lastRenderDuration.toFixed(2)} ms</p>
          <p><strong className="font-medium text-gray-800  w-32">Total Render Duration:</strong> {selectedMetrics.totalRenderDuration.toFixed(2)} ms</p>
          <p><strong className="font-medium text-gray-800  w-32">Re-Renders:</strong> {selectedMetrics.reRenders}</p>

          <h4 className="text-lg font-semibold text-gray-700 mt-6 mb-3">Prop Changes:</h4>
          {Object.keys(selectedMetrics.propsChanged).length > 0 ? (
            <p className="list-disc pl-5 space-y-1 text-sm text-gray-600">
              {Object.entries(selectedMetrics.propsChanged).map(([propName, change]) => (
                <span key={propName}>
                  <strong className="text-gray-700">{propName}:</strong> From `<span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">{String(change.from)}</span>` to `<span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">{String(change.to)}</span>`
                </span>
              ))}
            </p>
          ) : (
            <p className="text-gray-600">No prop changes detected in last render.</p>
          )}
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={(e) => handleGetAISummary(e)}

          >
            {loadingSummary
              ? (!selectedComponentId
                ? "Waiting for selection..."
                : !selectedMetrics
                  ? "Waiting for metrics..."
                  : "Loading...")
              : "Get AI Summary"}
          </button>
        </div>
      ) : (
        <p className="text-gray-600 p-4 border border-dashed border-gray-300 rounded-md text-sm">Click on a component in the hierarchy to see its details.</p>
      )}
    </div>
  )
})

export default SelectedComponentDetails



