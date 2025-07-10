import { useEffect } from "react";
import { usePerformanceMonitor } from "./usePerformanceMonitor";
import { useFileContext } from "../context/FilePathContext";

export const useAutoPerformanceTracker = () => {
  const { filePath, componentId } = useFileContext();
 

  // Run when filePath or componentId changes
  useEffect(() => {
    if (!filePath || !componentId) return;

    // Automatically register this component's performance
    usePerformanceMonitor({
      id: componentId,
      displayName: componentId,
      parentId: "PerformanceDashboard", // Optional: Make this dynamic if needed
      props: { filePath },
    });
  }, [filePath, componentId]);
};
