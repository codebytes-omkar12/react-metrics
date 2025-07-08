import { useRef, useEffect } from "react";
import { type IMetrics, type IPropChange } from "../types/performance";
import { usePerformanceDispatch } from '../context/PerformanceContext';


interface PerformanceMonitorOptions {
  id?: string;
  displayName?: string;
  parentId?: string;
  props?: Record<string, any>;
}

const findPropChanges = (oldProps: Record<string, any> | undefined, newProps: Record<string, any>): Record<string, IPropChange> => {
  const changes: Record<string, IPropChange> = {};
  if (!oldProps) {
    Object.keys(newProps).forEach(key => {
      changes[key] = { from: undefined, to: newProps[key] };
    });
    return changes;
  }

  const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);
  allKeys.forEach((key) => {
    const oldValue = oldProps[key];
    const newValue = newProps[key];
    if (oldValue !== newValue) {
      changes[key] = { from: oldValue, to: newValue };
    }
  });

  return changes;
};

export function usePerformanceMonitor(options: PerformanceMonitorOptions) {
  const { id, displayName, props = {}, parentId } = options;
  const componentId = id ?? "Unknown Component"
  const label = displayName ?? componentId;

  const mountStartTimeRef = useRef<number>(performance.now());
  const lastRenderTime = useRef<number>(performance.now());
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  const metricsRef = useRef<IMetrics>({
    mountTime: 0,
    lastRenderDuration: 0,
    totalRenderDuration: 0,
    reRenders: 0,
    propsChanged: {},
    _prevProps: undefined,
    parentId: parentId,
    id: componentId,
    displayName: label
  });

  const { addOrUpdateMetrics } = usePerformanceDispatch();

  useEffect(() => {
    const prevMetrics = metricsRef.current;
    const now = performance.now();

    const calculatedLastRenderDuration = renderCountRef.current > 1
      ? now - lastRenderTime.current
      : 0;

    const detectedPropChange = findPropChanges(prevMetrics._prevProps, props);
    const mountDuration = prevMetrics.mountTime === 0
      ? now - mountStartTimeRef.current
      : prevMetrics.mountTime;

    const updatedMetrics: IMetrics = {
      ...prevMetrics,
      mountTime: mountDuration,
      lastRenderDuration: calculatedLastRenderDuration / 1000,
      totalRenderDuration: prevMetrics.totalRenderDuration + calculatedLastRenderDuration,
      reRenders: renderCountRef.current,
      propsChanged: detectedPropChange,
      _prevProps: props,
    };

    metricsRef.current = updatedMetrics;
    lastRenderTime.current = now;

    const shallowPropsChanged = (prev: Record<string, any> = {}, next: Record<string, any>) => {
      const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
      for (const key of keys) {
        if (typeof prev[key] !== "function" && typeof next[key] !== "function" && prev[key] !== next[key]) {
          return true;
        }
      }
      return false;
    };

    const hasChanges = shallowPropsChanged(prevMetrics._prevProps, props)
      || prevMetrics.lastRenderDuration !== updatedMetrics.lastRenderDuration;

    const hasRealChange = Object.keys(detectedPropChange).length > 0
      || updatedMetrics.lastRenderDuration !== prevMetrics.lastRenderDuration
      || updatedMetrics.reRenders !== prevMetrics.reRenders;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    if (hasRealChange && hasChanges) {
      timeoutId = setTimeout(() => {
        addOrUpdateMetrics(componentId, updatedMetrics);
      }, 300);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      renderCountRef.current--;
    };
  }, [props, componentId, label, parentId, addOrUpdateMetrics]);

  return metricsRef.current;
}
