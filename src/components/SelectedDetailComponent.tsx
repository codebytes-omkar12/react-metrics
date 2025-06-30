import React, { useMemo, useState } from 'react'
import { findPathInTree } from '../utils/findPathInTree'
import { type IAllComponentMetrics, type IHierarchyNode, } from '../types/performance'



interface SelectedComponentDetailProps{
    selectedComponentId:string|null;
    allMetrics:IAllComponentMetrics;
    buildHierarchyTree:IHierarchyNode[]
    setAiSummary: (summary: string | null) => void;
    setLoadingSummary?: (loading: boolean) => void;
}

const SelectedComponentDetails: React.FC<SelectedComponentDetailProps> = React.memo(({selectedComponentId,allMetrics,buildHierarchyTree,setAiSummary,setLoadingSummary}) => {

    // Memoize selectedMetrics to avoid unnecessary recalculation and re-renders
    const selectedMetrics = useMemo(() => (
        selectedComponentId ? allMetrics[selectedComponentId] : null
    ), [selectedComponentId, allMetrics]);

    const [loadingSummary] = useState(false);

    const handleGetAISummary = async () => {
        console.log("clicked")
      setLoadingSummary && setLoadingSummary(true);
      setAiSummary(null);
      // Scroll to the summary box immediately
      document.getElementById('ai-summary-box')?.scrollIntoView({ behavior: 'smooth' });//DOM manipualtion
      try {
        const res = await fetch('http://localhost:5001/ai/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metrics: selectedMetrics // Only send metrics for now
          }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          console.error('AI summary fetch failed:', errorData);
          setAiSummary('Failed to fetch AI summary: ' + (errorData.error || res.statusText));
        } else {
          const data = await res.json();
          console.log('AI summary response:', data);
          setAiSummary(data.summary);
        }
      } catch (err) {
        console.error('AI summary fetch error:', err);
        setAiSummary('Failed to fetch AI summary: ' + (err instanceof Error ? err.message : String(err)));
      }
      setLoadingSummary && setLoadingSummary(false);
    };
    
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
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                            {Object.entries(selectedMetrics.propsChanged).map(([propName, change]) => (
                                <li key={propName}>
                                    <strong className="text-gray-700">{propName}:</strong> From `<span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">{String(change.from)}</span>` to `<span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">{String(change.to)}</span>`
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600">No prop changes detected in last render.</p>
                    )}
                    <button
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                        onClick={handleGetAISummary}
                        disabled={loadingSummary}
                    >
                        {loadingSummary ? "Loading..." : "Get AI Summary"}
                    </button>
                </div>
            ) : (
                <p className="text-gray-600 p-4 border border-dashed border-gray-300 rounded-md text-sm">Click on a component in the hierarchy to see its details.</p>
            )}
        </div>
  )
})

export default SelectedComponentDetails



