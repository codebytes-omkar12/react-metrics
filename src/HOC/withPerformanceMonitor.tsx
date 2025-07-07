import React from "react";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";

type MonitorArgs = {
  id?: string;           // Optional manual override
  displayName?: string;  // Optional label override
  parentId?: string;     // Optional parent
};

function withPerformanceMonitor<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  monitorArgs: MonitorArgs = {}
) {
  const fallbackName =
    WrappedComponent.displayName || WrappedComponent.name || "UnknownComponent";

  const componentId = monitorArgs.id || fallbackName;
  const displayName = monitorArgs.displayName || fallbackName;

  const WrappedWithMonitor: React.FC<P> = (props) => {
    usePerformanceMonitor({id:componentId, displayName:displayName, props:props, parentId:monitorArgs.parentId});
    return <WrappedComponent {...props} />;
  };

  // For devtools/debugging
  WrappedWithMonitor.displayName = `WithPerformanceMonitor(${displayName})`;

  return WrappedWithMonitor;
}

export default withPerformanceMonitor;
