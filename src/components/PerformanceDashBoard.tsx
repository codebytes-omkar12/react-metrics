import React, { useState} from "react";

import { usePerformanceMetrics } from "../context/PerformanceContext";


import SelectedComponentDetails from "./SelectedDetailComponent";
import MemoryComponent from "./MemoryComponent";
import ComponentHierarchyTree from "./ComponentHierarchyTree";
import { useBuildHierarchyTree } from "../utils/useBuildHierarchyTree";
const PerformanceDashboard: React.FC = () => {
  const { allMetrics } = usePerformanceMetrics();

  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null
  );

  const buildHierarchyTree=useBuildHierarchyTree(allMetrics);

  return (
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
          <SelectedComponentDetails
            selectedComponentId={selectedComponentId}
            allMetrics={allMetrics}
            buildHierarchyTree={buildHierarchyTree}
          />
          {/* Memory and Bundle Metrics - Now beside Component Details */}
          <MemoryComponent />
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
