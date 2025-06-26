import React, { useState, useEffect } from "react";
import PerformanceCharts from "./PerformanceCharts";
import { usePerformanceMetrics } from "../context/PerformanceContext";
import { useMemoryMonitor } from "../hooks/useMemoryMonitor";
import SelectedComponentDetails from "./SelectedDetailComponent";
import MemoryComponent from "./MemoryComponent";
import ComponentHierarchyTree from "./ComponentHierarchyTree";
import { useBuildHierarchyTree } from "../utils/useBuildHierarchyTree";
import withPerformanceMonitor from "../HOC/withPerformanceMonitor";


const PerformanceDashboard: React.FC = () => {
  const { allMetrics ,currentMemoryMetrics} = /*Hook Used to access the metrics data of other component with the help of context*/usePerformanceMetrics();
   const [aiSummary, setAiSummary] =/*state variable Used to store the API response*/useState<string | null>(null);
   const [loadingSummary, setLoadingSummary] =/*Boolean state variable tos set the loading phase*/  useState(false);
   const [typewriterText, setTypewriterText] = useState<string>("");
   const [selectedComponentId, setSelectedComponentId] =/*State Variable to set and Update  the selected Component's ID*/useState<string | null>(null);

  const buildHierarchyTree=/*Hook To build a Hierarch tree from allMetrics data*/useBuildHierarchyTree(allMetrics);
  const isMemoryMonitoringAvailable=/*Hook to extract the heap memory metrics from component returns true if heap memory data is available*/useMemoryMonitor({intervalMs:1000})
  const MonitoredSelectedComponentDetails=withPerformanceMonitor(SelectedComponentDetails,{id: "SelectedComponentDetails",
    displayName: "Component Details",
    parentId: "Performance DashBoard",})
   const MonitoredMemoryComponent=withPerformanceMonitor(MemoryComponent,{id:"MemoryComponent",displayName :"Memory Metrics",parentId:"Performance DashBoard"})
  // const MonitoredPerformanceCharts=withPerformanceMonitor(PerformanceCharts,{id:"PerformanceChart",displayName:"PerformanceChart",parentId:"Performance DashBoard"})


  // Typewriter effect for aiSummary
  useEffect(() => {
    if (aiSummary && !loadingSummary) {
      setTypewriterText("");
      let i = 0;
      const interval = setInterval(() => {
        setTypewriterText((prev) => prev + aiSummary[i]);
        i++;
        if (i >= aiSummary.length) clearInterval(interval);
      }, 15); // Adjust speed as needed
      return () => clearInterval(interval);
    } else if (loadingSummary) {
      setTypewriterText("");
    }
  }, [aiSummary, loadingSummary]);

  return (
    <div>
    <div className="flex flex-auto lg:flex-row gap-6 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      {/* The Left Panel: Node Tree */}

      <ComponentHierarchyTree
        selectedComponentId={selectedComponentId}
        onSelectComponent={setSelectedComponentId}
      />

      {/* The Right Panel : Selected Component Details*/}

      <div className="flex-[2] min-w-[320px] lg:pl-6 pt-6 lg:pt-0 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          {" "}
          {/* NEW CONTAINER for horizontal alignment */}
          {/* Selected Component Details */}
          <MonitoredSelectedComponentDetails
            selectedComponentId={selectedComponentId}
            allMetrics={allMetrics}
            buildHierarchyTree={buildHierarchyTree}
            setAiSummary={setAiSummary}
            setLoadingSummary={setLoadingSummary}
          />
          {/* Memory and Bundle Metrics - Now beside Component Details */}
          <MonitoredMemoryComponent />
        </div>
      </div>
    </div>
    <PerformanceCharts allMetrics={allMetrics} currentMemoryMetrics={currentMemoryMetrics} isMemoryMonitoringAvailable={isMemoryMonitoringAvailable}/>
     <div id="ai-summary-box" className="mt-8">
      <label className="font-bold mb-2 block text-black">AI Summary</label>
      <div
        className="text-left w-full max-w-7xl h-64 p-3 border rounded bg-gray-50 overflow-y-auto text-red-950"
        style={{ whiteSpace: 'pre-wrap' }}
        tabIndex={0}
      >
        {loadingSummary
          ? "Loading summary..."
          : typewriterText || "No summary yet. Select a component and click 'Get AI Summary'."}
      </div>
    </div>
    </div>
  );
};

export default PerformanceDashboard;
