import React, { useState, useEffect } from "react";
import PerformanceCharts from "./PerformanceCharts";
import { usePerformanceMetrics } from "../context/PerformanceContext";
import { useMemoryMonitor } from "../hooks/useMemoryMonitor";
import SelectedComponentDetails from "./SelectedDetailComponent";
import MemoryComponent from "./MemoryComponent";
import ComponentHierarchyTree from "./ComponentHierarchyTree";
import { useBuildHierarchyTree } from "../utils/useBuildHierarchyTree";
import withPerformanceMonitor from "../HOC/withPerformanceMonitor";
import TypewriterComponent from "typewriter-effect";


const PerformanceDashboard: React.FC = () => {
  const { allMetrics ,currentMemoryMetrics} = /*Hook Used to access the metrics data of other component with the help of context*/usePerformanceMetrics();
   const [aiSummary, setAiSummary] =/*state variable Used to store the API response*/useState<string | null>(null);
   const [loadingSummary, setLoadingSummary] =/*Boolean state variable tos set the loading phase*/  useState(false);
   const [selectedComponentId, setSelectedComponentId] =/*State Variable to set and Update  the selected Component's ID*/useState<string | null>(null);

  const buildHierarchyTree=/*Hook To build a Hierarch tree from allMetrics data*/useBuildHierarchyTree(allMetrics);
  const isMemoryMonitoringAvailable=/*Hook to extract the heap memory metrics from component returns true if heap memory data is available*/useMemoryMonitor({intervalMs:1000})
  const MonitoredSelectedComponentDetails=withPerformanceMonitor(SelectedComponentDetails,{id: "SelectedComponentDetails",
    displayName: "Component Details",
    parentId: "Performance DashBoard",})
   const MonitoredMemoryComponent=withPerformanceMonitor(MemoryComponent,{id:"MemoryComponent",displayName :"Memory Metrics",parentId:"Performance DashBoard"})
  // const MonitoredPerformanceCharts=withPerformanceMonitor(PerformanceCharts,{id:"PerformanceChart",displayName:"PerformanceChart",parentId:"Performance DashBoard"})


  // Typewriter effect for aiSummary
  // useEffect(() => {
  //   if (aiSummary && !loadingSummary) {
  //     setTypewriterText("");
  //     let i = 0;
  //     const interval = setInterval(() => {
  //       setTypewriterText((prev) => prev + aiSummary[i]);
  //       i++;
  //       if (i >= aiSummary.length) clearInterval(interval);
  //     }, 15); // Adjust speed as needed
  //     return () => clearInterval(interval);
  //   } else if (loadingSummary) {
  //     setTypewriterText("");
  //   }
  // }, [aiSummary, loadingSummary]);

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
    {/* Improved AI Summary UI */}
    {(loadingSummary || aiSummary) && (
      <div
        id="ai-summary-box"
        className="mt-10 mb-10 flex justify-center w-full animate-fadein"
        style={{ minHeight: '2rem' }}
      >
        <div className="w-full max-w-2xl bg-white border border-blue-200 rounded-2xl shadow-lg p-6 transition-opacity duration-700 ease-in-out opacity-100">
          <div className="flex items-center mb-3">
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mr-2 tracking-wide">AI Summary</span>
          </div>
          <div
            className="text-left h-auto overflow-y-auto text-gray-800 text-base leading-relaxed flex items-center justify-center"
            style={{ whiteSpace: 'pre-wrap', fontFamily: 'Inter, sans-serif' }}
            tabIndex={0}
          >
            {loadingSummary
              ? <span className="text-blue-500 font-semibold animate-pulse">Loading...</span>
: aiSummary ? (
  <TypewriterComponent
     onInit={(typewriter) => {
    typewriter
      .typeString(aiSummary || "")
      .start(); // no .deleteAll(), no loop
  }}
  options={{
    delay: 25,
    cursor: " ",
  }}
  />
) : (
  <span className="text-gray-400">No summary yet. Select a component and click 'Get AI Summary'.</span>
)}
          </div>
        </div>
      </div>
    )}
    <PerformanceCharts allMetrics={allMetrics} currentMemoryMetrics={currentMemoryMetrics} isMemoryMonitoringAvailable={isMemoryMonitoringAvailable}/>
     
    </div>
  );
};

export default PerformanceDashboard;
