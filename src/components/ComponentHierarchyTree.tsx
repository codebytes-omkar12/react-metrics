// E:\react-metrics\src\components\ComponentHierarchyTree.tsx

import React, { useState } from 'react';
import { usePerformanceMetrics } from '../context/PerformanceContext'; // Still needs to access allMetrics
import ComponentHierarchyNode from './ComponentHierarchyNode'; // Needs ComponentHierarchyNode
import { useBuildHierarchyTree } from '../utils/useBuildHierarchyTree';

// Define props that this component will accept from PerformanceDashboard
interface ComponentHierarchyTreeProps {
    selectedComponentId: string | null;
    onSelectComponent: (id: string) => void;
}

const ComponentHierarchyTree: React.FC<ComponentHierarchyTreeProps> = ({
    selectedComponentId,
    onSelectComponent,
}) => {
    // State for expanded nodes is managed here now
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    // Get allMetrics from context
    const { allMetrics } = usePerformanceMetrics();

    // Callback to toggle expansion
    const handleToggleExpand = (id: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // buildHierarchyTree logic (moved from PerformanceDashboard)
    const buildHierarchyTree = useBuildHierarchyTree(allMetrics)
    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex-1 min-h-[250px]"> {/* Added flex-1 and min-h */}
            <h3 className='text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200'>
                Component Hierarchy
            </h3>
            <ul className='p-0'>
                {buildHierarchyTree.length === 0 ? (<li className="text-gray-500">No monitored components yet.</li>) : (
                    buildHierarchyTree.map(node => (
                        <ComponentHierarchyNode
                            key={node.id}
                            node={node}
                            selectedComponentId={selectedComponentId}
                            onSelectComponent={onSelectComponent}
                            isExpanded={expandedNodes.has(node.id)}
                            onToggleExpand={handleToggleExpand} 
                            expandedNodes={expandedNodes}// Pass its own toggle handler
                        />
                    ))
                )}
            </ul>
        </div>
    );
};

export default ComponentHierarchyTree;