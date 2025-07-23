import React, { useMemo } from 'react';
import { type IHierarchyNode } from '../types/performance';
import { usePerformanceStore } from '../stores/performanceStore';
import { useBuildHierarchyTree } from '../utils/useBuildHierarchyTree';
import withPerformanceMonitor from '../HOC/withPerformanceMonitor';

const SelectedComponentDetails: React.FC = React.memo(() => {
  const selectedMetrics = usePerformanceStore((state) =>
    state.selectedComponentId ? state.allMetrics[state.selectedComponentId] : null
  );

  const allMetrics = usePerformanceStore((state) => state.allMetrics);
  const buildHierarchyTree = useBuildHierarchyTree(allMetrics);
  
  const selectedComponentId = usePerformanceStore((state) => state.selectedComponentId);

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

  SelectedComponentDetails.displayName = 'SelectedComponentDetails';

  return (
    <div className="rounded-xl  shadow-md p-6 border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark flex-auto ">
      <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-border-light dark:border-border-dark">
        Component Details
      </h3>
      {selectedMetrics ? (
        <div className="space-y-2 text-sm">
          <p><strong className="font-medium w-32 text-text-primary-light dark:text-text-primary-dark">ID:</strong> <span className="text-text-secondary-light dark:text-text-secondary-dark">{selectedMetrics.id}</span></p>
          {/* <p><strong className="font-medium w-32 text-text-primary-light dark:text-text-primary-dark">Display Name:</strong> <span className="text-text-secondary-light dark:text-text-secondary-dark">{selectedMetrics.displayName}</span></p> */}
          <p><strong className="font-medium w-32 text-text-primary-light dark:text-text-primary-dark">Parent ID:</strong> <span className="text-text-secondary-light dark:text-text-secondary-dark">{parentIdFromTree}</span></p>
          <p><strong className="font-medium w-32 text-text-primary-light dark:text-text-primary-dark">Mount Time:</strong> <span className="text-text-secondary-light dark:text-text-secondary-dark">{selectedMetrics.mountTime.toFixed(2)} ms</span></p>
          <p><strong className="font-medium w-32 text-text-primary-light dark:text-text-primary-dark">Last Render:</strong> <span className="text-text-secondary-light dark:text-text-secondary-dark">{selectedMetrics.lastRenderDuration.toFixed(2)} ms</span></p>
          <p><strong className="font-medium w-32 text-text-primary-light dark:text-text-primary-dark">Re-Renders:</strong> <span className="text-text-secondary-light dark:text-text-secondary-dark">{selectedMetrics.reRenders}</span></p>

          <h4 className="text-lg font-semibold pt-4 mt-4 border-t border-border-light dark:border-border-dark">Prop Changes:</h4>
          {Object.keys(selectedMetrics.propsChanged).length > 0 ? (
            <div className="list-disc pl-5 space-y-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {Object.entries(selectedMetrics.propsChanged).map(([propName, change]) => (
                <p key={propName}>
                  <strong>{propName}:</strong> From{' '}
                  <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                    {String(change.from)}
                  </span>{' '}
                  to{' '}
                  <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                    {String(change.to)}
                  </span>
                </p>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary-light dark:text-text-secondary-dark italic">No prop changes detected in last render.</p>
          )}
        </div>
      ) : (
        <div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark p-4 border border-dashed border-border-light dark:border-border-dark rounded-md text-sm">
            Click on a component in the hierarchy to see its details.
          </p>
        </div>
      )}
    </div>
  );
});

export default withPerformanceMonitor(SelectedComponentDetails,{id:"SelectedComponentDetails"});