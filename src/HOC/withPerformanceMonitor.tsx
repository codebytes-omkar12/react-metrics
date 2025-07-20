import React, { useRef } from "react";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";
import { ParentMonitorProvider, useParentId } from "../context/ParentMonitorContext";

/**
 * An invisible "spy" component whose only job is to run the performance monitor hook.
 * Because it's rendered as a child of the component being monitored, it will
 * re-render every time the parent does, accurately capturing the update.
 */
const MonitorSpy: React.FC<{ monitorId: string; monitorDisplayName: string; props: object; }> = ({ monitorId, monitorDisplayName, props }) => {
  const parentId = useParentId();
  
  usePerformanceMonitor({
    id: monitorId,
    displayName: monitorDisplayName,
    parentId: parentId ?? undefined,
    props,
  });

  return null; // This component renders nothing to the DOM
};

/**
 * A robust HOC that monitors a component without interfering with its render cycle.
 * It works by rendering the component directly and injecting an invisible "spy"
 * component as a child to perform the monitoring.
 */
function withPerformanceMonitor<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  monitorArgs: { id?: string; displayName?: string; } = {}
) {
  const fallbackName =
    (WrappedComponent as any).displayName || WrappedComponent.name || "UnknownComponent";

  const displayName = monitorArgs.displayName || fallbackName;
  const id = monitorArgs.id || displayName;

  const WrappedWithMonitor = React.forwardRef<unknown, P>((props, ref) => {
    // We use a ref to ensure the props object passed to the spy is always the latest one
    // from the current render, which is important for tracking prop changes accurately.
    const propsRef = useRef(props);
    propsRef.current = props;

    return (
      <ParentMonitorProvider id={id}>
        {/* Render the original component directly */}
        <WrappedComponent {...props as P} ref={ref} />
        
        {/* Render the invisible spy alongside it. The spy's props will be updated
          on every render of the HOC, triggering the monitoring hook.
        */}
        <MonitorSpy
          monitorId={id}
          monitorDisplayName={displayName}
          props={propsRef.current}
        />
      </ParentMonitorProvider>
    );
  });

  WrappedWithMonitor.displayName = `WithPerformanceMonitor(${displayName})`;

  return WrappedWithMonitor;
}

export default withPerformanceMonitor;