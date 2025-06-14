import { usePerformanceContext} from "../context/PerformanceContext";
import { useEffect} from "react";
import React from "react";
import { useMemoryMonitor } from "../hooks/useMemoryMonitor";

function bytesToMB(bytes: number) {
   return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const PerformanceDashboard:React.FC=()=>{

   const isMemoryMonitoringAvailable=useMemoryMonitor({intervalMs:1000})
   const {allMetrics,currentMemoryMetrics,bundleMetrics}=usePerformanceContext();
   //  console.log("PerformanceDashboard is rendering.");
   //  console.log("isMemoryMonitoringAvailable from useMemoryMonitor:", isMemoryMonitoringAvailable);
   //  console.log("currentMemoryMetrics from context:", currentMemoryMetrics);
     
   
   useEffect(()=>{
      
         // console.log("Memory Metrics",currentMemoryMetrics);
         // console.log("All Component Metrics",allMetrics);
   },[currentMemoryMetrics,allMetrics])
    return(
    <div className="p-5 font-sans border border-gray-300 rounded-lg max-w-4xl mx-auto my-5 shadow-lg bg-white">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Performance Dashboard</h2>
       <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">

         <h3 className="text-xl font-semibold text-gray-700 mb-3">Memory Metrics</h3>
         {isMemoryMonitoringAvailable?(currentMemoryMetrics?(<>
                <p className="text-green-600"><strong className="font-medium text-green-600">JS Heap Used:</strong> {bytesToMB(currentMemoryMetrics.usedJSHeapSize)}</p>
                <p className="text-green-600"><strong className="font-medium text-green-600">JS Heap Total:</strong> {bytesToMB(currentMemoryMetrics.totalJSHeapSize)}</p>
                <p className="text-green-600"><strong className="font-medium text-green-600">JS Heap Limit:</strong> {bytesToMB(currentMemoryMetrics.jsHeapSizeLimit)}</p>
                <p className="text-sm text-gray-600 mt-2">Last Updated: {new Date(currentMemoryMetrics.timestamp).toLocaleTimeString()}</p>
            
                {/* <p className="text-sm text-orange-600 mt-2">
                    (Note: Memory data is from `performance.memory` - non-standard, deprecated, Chromium-only, and may be unreliable.)
                </p> */}
            </>):(<p className="text-red-600">Waiting for memory data...</p>)):(<p className="text-red-500">Memory monitoring is not available in this browser</p>)}
       </div>
       
       {bundleMetrics&&(<div className="mb-6 p-4 border-gray-200 rounded-md bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Bundle Metrics</h3>
        <p className="text-green-900"><strong className="font-medium">Total Bundle Size:</strong>{bundleMetrics.totalSizeKB} KB</p>
       </div>)}

       <div className="p-4 border-gray-200 rounded-md bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Component render Metrics</h3>
        {Object.keys(allMetrics).length>0?(<table className="w-full border-collapse table-auto">
          <thead>
            <tr className="bg-gray-200 text-red-800">
                <th className="px-4 py-2 text-left border-b border-gray-300">Component</th>
                <th className="px-4 py-2 text-left border-b border-gray-300">Renders</th>
                <th className="px-4 py-2 text-left border-b border-gray-300">Last Render</th>
                <th className="px-4 py-2 text-left border-b border-gray-300">Prop Changes</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(allMetrics).map(([componentName, metrics]) => (
              <tr key={componentName} className="text-green-700">
                <td className="px-4 py-2 border-b border-black font-medium">{componentName}</td>
                <td className="px-4 py-2 border-b border-black font-medium">{metrics.reRenders}</td>
                <td className="px-4 py-2 border-b border-black font-medium">{metrics.lastRenderDuration?.toFixed(2)}</td>
                <td className="px-4 py-2 border-b border-black text-sm text-gray-700">
                {
                 metrics.propsChanged && Object.keys(metrics.propsChanged).length>0?Object.entries(metrics.propsChanged).map(([propName,change])=>(`${propName} (from:${JSON.stringify(change.from)}, to: ${JSON.stringify(change.to)})`))
                 .join(','):'None'
                }
               </td>


              </tr>
            ))}
          </tbody>
        </table>):(<p className="text-gray-600">No component render metrics collected yet. Make sure `usePerformanceMonitor` is active in some components.</p>)}
       </div>

    </div>
    )
}

export default PerformanceDashboard;