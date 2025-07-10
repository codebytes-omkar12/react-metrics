import React from 'react';
import SelectedComponentDetails from './SelectedComponentDetails';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { useFileContext } from '../context/FilePathContext';
import { type IHierarchyNode } from '../types/performance';

interface Props {
  buildHierarchyTree: IHierarchyNode[];
  setAiSummary: React.Dispatch<React.SetStateAction<string | null>>;
  setLoadingSummary: (loading: boolean) => void;
  loadingSummary?: boolean;
  hookDetails: any[];
}

const SelectedComponentTracker: React.FC<Props> = ({
  buildHierarchyTree,
  setAiSummary,
  setLoadingSummary,
  loadingSummary,
  hookDetails,
}) => {
  const { filePath, componentId } = useFileContext();

  // ✅ Register performance metrics directly inside the component (safe use of hooks)
  
  usePerformanceMonitor({
    id: componentId??"Unknown",
    displayName: componentId??"Unknown Comp",
    parentId: 'PerformanceDashboard',
    props: { filePath },
  });

  return (
    <SelectedComponentDetails
      buildHierarchyTree={buildHierarchyTree}
      setAiSummary={setAiSummary}
      setLoadingSummary={setLoadingSummary}
      loadingSummary={loadingSummary}
      hookDetails={hookDetails}
    />
  );
};

export default SelectedComponentTracker;
