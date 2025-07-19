import React, { useMemo } from 'react';
import { type IHierarchyNode } from '../types/performance';
import { usePerformanceStore } from '../stores/performanceStore';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

interface SelectedComponentDetailProps {
  selectedComponentId: string | null;
  buildHierarchyTree: IHierarchyNode[];
  setAiSummary: React.Dispatch<React.SetStateAction<string | null>>;
  setLoadingSummary: (loading: boolean) => void;
  loadingSummary?: boolean;
  relativeFilePath: string | null;
  hookDetails: any[];
}

const SelectedComponentDetails: React.FC<SelectedComponentDetailProps> =
  React.memo(({
    selectedComponentId,
    buildHierarchyTree,
    setAiSummary,
    setLoadingSummary,
    loadingSummary,
    relativeFilePath,
    hookDetails,
  }) => {
    usePerformanceMonitor({
        id: 'SelectedComponentDetails', // A unique ID for this component
       
      });
    const selectedMetrics = usePerformanceStore((state) =>
    selectedComponentId ? state.allMetrics[selectedComponentId] : null
  )

    // ✅ Find parentId from the hierarchy tree
    const parentIdFromTree = useMemo(() => {
      if (!selectedComponentId) return 'None';

      const findParent = (nodes: IHierarchyNode[], childId: string): string | null => {
        for (const node of nodes) {
          if (node.children.some(child => child.id === childId)) return node.id;
          const deeper = findParent(node.children, childId);
          if (deeper) return deeper;
        }
        return null;
      };

      return findParent(buildHierarchyTree, selectedComponentId) ?? 'None';
    }, [selectedComponentId, buildHierarchyTree]);

    const handleGetAISummary = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setLoadingSummary(true);
      setAiSummary(null);

      if (!relativeFilePath) {
        setAiSummary('Missing file path for AI summary.');
        setLoadingSummary(false);
        return;
      }

      document.getElementById('ai-summary-box')?.scrollIntoView({ behavior: 'smooth' });

      try {
        const res = await fetch('http://localhost:5001/ai/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metrics: selectedMetrics ?? {},
            relativeFilePath,
            hookDetails: hookDetails ?? [],
          }),
        });

        if (!res.ok || !res.body) {
          const errorText = await res.text();
          console.error('AI summary fetch failed:', errorText);
          setAiSummary('Failed to fetch AI summary.');
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });

          for (const char of chunk) {
            await new Promise(r => setTimeout(r, 25));
            setAiSummary(prev => (prev ?? '') + char);
          }
        }
      } catch (err) {
        console.error('AI summary fetch error:', err);
        setAiSummary('Failed to fetch AI summary: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoadingSummary(false);
      }
    };

    SelectedComponentDetails.displayName = 'SelectedComponentDetails';

    return (
      <div className="rounded-xl text-black shadow-md p-6 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 flex-auto">
        <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
          Component Details
        </h3>
        {selectedMetrics ? (
          <div className="space-y-2 text-sm">
            <p><strong className="font-medium w-32">ID:</strong> {selectedMetrics.id}</p>
            <p><strong className="font-medium w-32">Display Name:</strong> {selectedMetrics.displayName}</p>
            <p><strong className="font-medium w-32">Parent ID:</strong> {parentIdFromTree}</p>
            <p><strong className="font-medium w-32">Mount Time:</strong> {selectedMetrics.mountTime.toFixed(2)} ms</p>
            <p><strong className="font-medium w-32">Last Render Duration:</strong> {selectedMetrics.lastRenderDuration.toFixed(2)} ms</p>
            <p><strong className="font-medium w-32">Re-Renders:</strong> {selectedMetrics.reRenders}</p>

            <h4 className="text-lg font-semibold mt-6 mb-3">Prop Changes:</h4>
            {Object.keys(selectedMetrics.propsChanged).length > 0 ? (
              <div className="list-disc pl-5 space-y-1 text-sm">
                {Object.entries(selectedMetrics.propsChanged).map(([propName, change]) => (
                  <p key={propName}>
                    <strong>{propName}:</strong> From{' '}
                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                      {String(change.from)}
                    </span>{' '}
                    to{' '}
                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                      {String(change.to)}
                    </span>
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">No prop changes detected in last render.</p>
            )}

            <button
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              onClick={handleGetAISummary}
            >
              {loadingSummary
                ? 'Loading...'
                : 'Get AI Summary'}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 dark:text-gray-300 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm">
              Click on a component in the hierarchy to see its details.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              onClick={handleGetAISummary}
            >
              {loadingSummary ? 'Loading...' : 'Get AI Summary'}
            </button>
          </div>
        )}
      </div>
    );
  })
;

export default  SelectedComponentDetails;
