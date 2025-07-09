import React from "react";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";

type MonitorArgs = {
  id?: string;
  displayName?: string;
  parentId?: string;
};

function withPerformanceMonitor<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  monitorArgs: MonitorArgs = {}
) {
  const fallbackName =
    WrappedComponent.displayName || WrappedComponent.name || "UnknownComponent";

  const displayName = monitorArgs.displayName || fallbackName;
  const id = monitorArgs.id || displayName; // ✅ use displayName as fallback ID

  const WrappedWithMonitor: React.FC<P> = (props) => {
    usePerformanceMonitor({
      id,                         // ✅ This guarantees ID is never undefined
      displayName,
      parentId: monitorArgs.parentId,
      props,
    });

    return <WrappedComponent {...props} />;
  };

  WrappedWithMonitor.displayName = `WithPerformanceMonitor(${displayName})`;

  return WrappedWithMonitor;
}

export default withPerformanceMonitor;
