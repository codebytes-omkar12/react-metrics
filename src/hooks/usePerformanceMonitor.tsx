// src/hooks/usePerformanceMonitor.tsx
import { useRef, useEffect } from "react";
import { type IMetrics, type IPropChange } from "../types/performance";
import { usePerformanceDispatch } from '../context/PerformanceContext';

const findPropChanges = (oldProps: Record<string, any> | undefined, newProps: Record<string, any>): Record<string, IPropChange> => {
    const changes: Record<string, IPropChange> = {};
    if (!oldProps) {
        // If no oldProps, all newProps are considered 'changes' from undefined state
        Object.keys(newProps).forEach(key => {
            changes[key] = { from: undefined, to: newProps[key] };
        });
        return changes;
    }

    const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

    allKeys.forEach((key) => {
        const oldValue = oldProps[key];
        const newValue = newProps[key];

        // Deep comparison for objects/arrays might be needed here for true "change" detection
        // For simplicity, we'll stick to shallow comparison (value !== newValue)
        if (oldValue !== newValue) {
            changes[key] = { from: oldValue, to: newValue };
        }
    });

    return changes;
}

export function usePerformanceMonitor(
    componentId:string,
    displayName:string,
    props: Record<string, any>,
     parentId?: string,
) {
   //comments to check if the double invoking of strict mode was working or not.
    // console.log("hallo");
    // console.log("Naturlich");

    
  const lastRenderTime = useRef<number>(performance.now());  
   const renderCountRef = useRef(0);
    renderCountRef.current += 1;
   
    const metricsRef = useRef<IMetrics>({
        mountTime: 0,
        lastRenderDuration:0,
        totalRenderDuration: 0,
        reRenders: 0,
        propsChanged: {},
        _prevProps: undefined, // Will store the props from the *previous* render
        parentId: parentId,
        id:componentId,
        displayName:displayName
    });

    // This ref tracks the total number of times the component has rendered.
    // It's incremented on every execution of the hook function.
    
    
    // Increment on every render of the component using this hook

     // Time of the previous render completion

   


    const { addOrUpdateMetrics } = usePerformanceDispatch(); // This is stable due to useCallback([])

    // This effect runs after every render where its dependencies change.
    useEffect(() => {
        const prevMetrics = metricsRef.current;
        const currentRenderTimestamp = performance.now(); // Time of this render's effect execution

        let calculatedLastRenderDuration = 0;
        // Calculate duration only if it's not the very first render and a previous time exists
        if (renderCountRef.current > 1 && lastRenderTime.current !== 0) {
            calculatedLastRenderDuration = currentRenderTimestamp - lastRenderTime.current;
        }

        const detectedPropChange = findPropChanges(prevMetrics._prevProps, props);

        // Update metrics object
        const updatedMetrics: IMetrics = {
            ...prevMetrics,
            mountTime: prevMetrics.mountTime === 0 ? currentRenderTimestamp : prevMetrics.mountTime, // Set mount time once
            lastRenderDuration: calculatedLastRenderDuration/1000,
            totalRenderDuration: prevMetrics.totalRenderDuration + calculatedLastRenderDuration,
            reRenders: renderCountRef.current/2, // Total renders up to this point
            propsChanged: detectedPropChange,
            _prevProps: props, // Store current props for next comparison
           
        };

        metricsRef.current = updatedMetrics; // Update the ref with the new metrics
        lastRenderTime.current = currentRenderTimestamp; // Update for the next render cycle

        // Report the updated metrics to the global context
        addOrUpdateMetrics(componentId, metricsRef.current);

        // Optional cleanup on unmount
        return () => {
            
        };
    }, [props,
        componentId,
        displayName,
        parentId,
        addOrUpdateMetrics]); // Effect dependencies

    return metricsRef.current; // Return the current state of metrics
}