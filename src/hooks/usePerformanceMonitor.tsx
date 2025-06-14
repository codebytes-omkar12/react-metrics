import { useRef, useEffect } from "react";
import { type IMetrics, type IPropChange } from "../types/performance";
import { usePerformanceContext } from "../context/PerformanceContext";



// to find the propchanges 
const findPropChanges = (oldProps: Record<string, any> | undefined, newProps: Record<string, any>): Record<string, IPropChange> => {
  const changes: Record<string, IPropChange> = {};
  if (!oldProps) {
    return changes;
  }

  const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)])


  allKeys.forEach((key) => {
    const oldValue = oldProps[key];
    const newValue = newProps[key];
    if (oldValue !== newValue) {
      changes[key] = { from: oldValue, to: newValue };
    }
  });

  return changes;
}



export function usePerformanceMonitor(componentName: string, props: Record<string, any>, options?: { parentId?: string; componentPath?: string }) {

  //destructuring the optional object
  const { parentId, componentPath } = options || {}

  const metricsRef = useRef<IMetrics>({
    mountTime: 0,
    lastRenderDuration: 0,
    totalRenderDuration: 0,
    reRenders: 0,
    propsChanged: {},
    _prevProps: undefined,
    parentId: parentId,
    componentPath: componentPath
  });

  const renderCount = useRef<number>(1);
  const lastRenderTime = useRef<number>(performance.now());


  const { addOrUpdateMetrics } = usePerformanceContext();



  //core hook functtionality
  useEffect(() => {

  const prevMetrics=metricsRef.current;
     renderCount.current += 1;
    

    const currentRenderTime = performance.now();
    let calculatedLastRenderDuration = 0;

    if (lastRenderTime.current) {
      calculatedLastRenderDuration = currentRenderTime - lastRenderTime.current;
    } else {
      console.warn("Last Render Time was not read");
    }
    const detectedPropChange = findPropChanges(prevMetrics._prevProps, props);

    // Mount time is the time of the very first render
    const actualMountTime = (renderCount.current === 1) ? currentRenderTime : prevMetrics.mountTime;
          const updatedMetrics: IMetrics = {
        ...prevMetrics,
        mountTime: actualMountTime,
        lastRenderDuration: calculatedLastRenderDuration,
        totalRenderDuration: prevMetrics.totalRenderDuration + calculatedLastRenderDuration,
        reRenders: renderCount.current ?? prevMetrics.reRenders,
        propsChanged: detectedPropChange,
        _prevProps: props,
        parentId: parentId,
        componentPath: componentPath
      }
     metricsRef.current= updatedMetrics;
    lastRenderTime.current = currentRenderTime;
  }, [addOrUpdateMetrics, parentId, componentPath])

  useEffect(() => {
    if (metricsRef.current.reRenders >= 0) {
      addOrUpdateMetrics(componentName, metricsRef.current);
    }

  }, [metricsRef.current.reRenders, componentName,addOrUpdateMetrics])

  return metricsRef.current
}