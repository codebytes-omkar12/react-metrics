import React, { useState } from 'react';
import { usePerformanceMetrics } from '../context/PerformanceContext';
import ComponentHierarchyNode from './ComponentHierarchyNode';
import { useBuildHierarchyTree } from '../utils/useBuildHierarchyTree';

/**
 * Props accepted by the ComponentHierarchyTree component
 * @property selectedComponentId - ID of the currently selected component
 * @property onSelectComponent - Callback to handle selection of a component
 */
interface ComponentHierarchyTreeProps {
    selectedComponentId: string | null;
    onSelectComponent: (id: string) => void;
}

/**
 * Component responsible for rendering the hierarchy of monitored components.
 * Accepts a selected component and a handler to update the selection.
 */
const ComponentHierarchyTree: React.FC<ComponentHierarchyTreeProps> = ({
  selectedComponentId,
  onSelectComponent,
}) => {

/**
 * Tracks which component nodes in the tree are expanded or collapsed.
 * @param expandedNodes - Set of component IDs that are currently expanded.
 */
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  /**
   * Accesses performance metrics from context.
   * @returns An object containing allMetrics array used for hierarchy tree construction.
   * @remarks Provides `allMetrics` needed for building the component hierarchy.
   */
  const { allMetrics } = usePerformanceMetrics();

  /**
   * Constructs the component hierarchy tree based on available metrics.
   * @param allMetrics - Metrics array from context used to build hierarchy structure.
   * @returns Tree structure representing component relationships.
   */
  const buildHierarchyTree = useBuildHierarchyTree(allMetrics);

  const handleToggleExpand = (id: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex-1 min-h-[250px]">
      <h3 className='text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200'>
        Component Hierarchy
      </h3>
      <ul className='p-0'>
        {buildHierarchyTree.length === 0 ? (
          <li className="text-gray-500">No monitored components yet.</li>
        ) : (
          buildHierarchyTree.map(node => (
            <ComponentHierarchyNode
              key={node.id}
              node={node}
              selectedComponentId={selectedComponentId}
              onSelectComponent={onSelectComponent}
              isExpanded={expandedNodes.has(node.id)}
              onToggleExpand={handleToggleExpand}
              expandedNodes={expandedNodes}
            />
          ))
        )}
      </ul>
    </div>
  );
};
 export default ComponentHierarchyTree