import React from 'react'
import { findPathInTree } from '../utils/findPathInTree'
import { type IAllComponentMetrics, type IHierarchyNode, type IPropChange ,type IMetrics } from '../types/performance' 


interface SelectedComponentDetailProps{
    selectedComponentId:string|null;
    allMetrics:IAllComponentMetrics;
    buildHierarchyTree:IHierarchyNode[]
}


const SelectedComponentDetails:React.FC<SelectedComponentDetailProps> = ({selectedComponentId,allMetrics,buildHierarchyTree}) => {
    
     const selectedMetrics=selectedComponentId?allMetrics[selectedComponentId]:null
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
                </div>
            ) : (
                <p className="text-gray-600 p-4 border border-dashed border-gray-300 rounded-md text-sm">Click on a component in the hierarchy to see its details.</p>
            )}
        </div>
  )
}

export default SelectedComponentDetails



