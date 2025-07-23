import React, { useRef } from "react";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";
import { ParentMonitorProvider, useParentId } from "../context/ParentMonitorContext";

const MonitorSpy: React.FC<{ monitorId: string; monitorDisplayName: string; props: object; parentId: string | null; }> = ({ monitorId, monitorDisplayName, props, parentId }) => {
  /**
   * The Hook Used Extracting Metrics Data
   */
  usePerformanceMonitor({
    id: monitorId,
    displayName: monitorDisplayName,
    parentId: parentId ?? undefined,
    props,
  });

  return null;
};

function withPerformanceMonitor<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  monitorArgs: { id?: string; displayName?: string; } = {}
) {
  const fallbackName =
    (WrappedComponent as any).displayName || WrappedComponent.name || "UnknownComponent";

  const displayName = monitorArgs.displayName || fallbackName;
  const id = monitorArgs.id || displayName;

  const WrappedWithMonitor = React.forwardRef<unknown, P>((props, ref) => {
    const parentId =     
    /**
   * The Context Hook To Track The Parent Component
   */useParentId();

    const propsRef =   
    /**
   * The Props Ref Variable
   */useRef(props);
    propsRef.current = props;

    return (
      <>
        <MonitorSpy
          monitorId={id}
          monitorDisplayName={displayName}
          props={propsRef.current}
          parentId={parentId}
        />
        <ParentMonitorProvider id={id}>
          <WrappedComponent {...props as P} ref={ref} />
        </ParentMonitorProvider>
      </>
    );
  });

  WrappedWithMonitor.displayName = `WithPerformanceMonitor(${displayName})`;

  return WrappedWithMonitor;
}

export default withPerformanceMonitor;