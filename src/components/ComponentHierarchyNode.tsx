import {type IHierarchyNode} from '../types/performance';

// Helper to convert bytes to MB
// const bytesToMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);

// Component to render a single node in the hierarchy tree
interface HierarchyNodeProps {
    node: IHierarchyNode;
    selectedComponentId: string | null;
    onSelectComponent: (id: string) => void;
    isExpanded: boolean;
    onToggleExpand: (id: string) => void;
    expandedNodes: Set<string>;
}

const ComponentHierarchyNode: React.FC<HierarchyNodeProps> = ({
    node,
    selectedComponentId,
    onSelectComponent,
    isExpanded,
    onToggleExpand,
    expandedNodes
}) => {
    if (!node) {
        console.error("ComponentHierarchyNode received an undefined node prop.");
        return null; // Don't render anything if node is invalid
    }
    const isSelected = node.id === selectedComponentId;
    const hasChildren = node.children.length > 0;

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasChildren) {
            onToggleExpand(node.id);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectComponent(node.id);
    };

    return (
        <li className="list-none my-1">
            <span
                className={`inline-block py-1 px-2 rounded-md cursor-pointer transition-all duration-150 ease-in-out
                            ${isSelected ? 'bg-blue-100 text-blue-700 font-semibold shadow' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                style={{ marginLeft: hasChildren ? '0px' : '20px' }} // Indent non-parent nodes slightly
            >
                {hasChildren && (
                    <span className={`inline-block mr-1 transform transition-transform duration-150 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
                        ▶
                    </span>
                )}
                {node.displayName} <span className="text-sm text-gray-500">(ID: {node.id})</span>
            </span>

            {/* Conditionally render children based on expansion state */}
            {hasChildren && isExpanded && (
                <ul className="pl-6"> {/* Tailwind's pl-6 adds padding-left */}
                    {node.children.map(childNode => (
                        <ComponentHierarchyNode
                            key={childNode.id}
                            node={childNode}
                            selectedComponentId={selectedComponentId}
                            onSelectComponent={onSelectComponent}
                            isExpanded={isExpanded} // This is passed down, but child manages its own state from expandedNodes
                            onToggleExpand={onToggleExpand}
                            expandedNodes={expandedNodes}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default ComponentHierarchyNode;

