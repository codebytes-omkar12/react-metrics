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
    (WrappedComponent as any).displayName || WrappedComponent.name || "UnknownComponent";

  const displayName = monitorArgs.displayName || fallbackName;
  const id = monitorArgs.id || displayName;

  // ✅ Runtime check: skip if WrappedComponent is not a plain function
  if (typeof WrappedComponent !== "function") {
    console.warn(
      `[withPerformanceMonitor] Skipping wrap: Expected a React component function but got ${typeof WrappedComponent}`,
      WrappedComponent
    );
    return WrappedComponent;
  }

  const WrappedWithMonitor: React.FC<P> = (props) => {
    usePerformanceMonitor({
      id,
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
