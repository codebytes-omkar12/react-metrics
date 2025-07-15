import React from "react";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";
import { ParentMonitorProvider, useParentId } from "../context/ParentMonitorContext";

function withPerformanceMonitor<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  monitorArgs: { id?: string; displayName?: string ;parentId?: string;} = {}
) {
  const fallbackName =
    (WrappedComponent as any).displayName || WrappedComponent.name || "UnknownComponent";

  const displayName = monitorArgs.displayName || fallbackName;
  const id = monitorArgs.id || displayName;

  const WrappedWithMonitor: React.FC<P> = (props) => {
    const parentId = useParentId(); // 🟢 Dynamically get parent ID

    usePerformanceMonitor({
      id,
      displayName,
      parentId: monitorArgs.parentId ?? (parentId ?? undefined),
      props,
    });

    return (
      <ParentMonitorProvider id={id}>
        <WrappedComponent {...props} />
      </ParentMonitorProvider>
    );
  };

  WrappedWithMonitor.displayName = `WithPerformanceMonitor(${displayName})`;

  return WrappedWithMonitor;
}

export default withPerformanceMonitor;
