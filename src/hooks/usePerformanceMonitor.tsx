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

   
    const mountStartTimeRef = /* Ref to record the time when the hook is first called (mount start)*/useRef<number>(performance.now());
    const lastRenderTime = /*ref for measuring last reRender duration 0 for 1st Render*/useRef<number>(performance.now());  
    const renderCountRef =/*ref for measuring last reRender Count 0 for 1st Render*/ useRef(0);
    renderCountRef.current += 1;
   
    const metricsRef =/*ref for storing metrics of the component*/ useRef<IMetrics>({
        mountTime: 0, // Will be set to mount duration (ms)
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

   


    const { addOrUpdateMetrics } = /*Hook for using dispatch functions from context*/usePerformanceDispatch(); // This is stable due to useCallback([])

   



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

        // Calculate mount duration only on first render
        const isFirstRender = prevMetrics.mountTime === 0;
        const mountDuration = isFirstRender ? (currentRenderTimestamp - mountStartTimeRef.current) : prevMetrics.mountTime;

        // Update metrics object
        const updatedMetrics: IMetrics = {
            ...prevMetrics,
            mountTime: mountDuration, // Now represents mount duration in ms
            lastRenderDuration: calculatedLastRenderDuration/1000,
            totalRenderDuration: prevMetrics.totalRenderDuration + calculatedLastRenderDuration,
            reRenders: renderCountRef.current, // Use the actual render count, including initial render
            propsChanged: detectedPropChange,
            _prevProps: props, // Store current props for next comparison
        };

        metricsRef.current = updatedMetrics; // Update the ref with the new metrics
        lastRenderTime.current = currentRenderTimestamp; // Update for the next render cycle

        const shallowPropsChanged = (prev: Record<string, any> = {}, next: Record<string, any>) => {
            const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
            for (const key of keys) {
                const a = prev[key];
                const b = next[key];
                if (typeof a === 'function' || typeof b === 'function') continue; // Skip functions
                if (a !== b) return true;
            }
            return false;
        };

        const hasChanges =
            shallowPropsChanged(prevMetrics._prevProps, props) ||
            prevMetrics.lastRenderDuration !== updatedMetrics.lastRenderDuration;
        const hasRealChange =
            Object.keys(detectedPropChange).length > 0 ||
            updatedMetrics.lastRenderDuration !== prevMetrics.lastRenderDuration ||
            updatedMetrics.reRenders !== prevMetrics.reRenders;

        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        if (hasRealChange && hasChanges) {
            timeoutId = setTimeout(() => {
                addOrUpdateMetrics(componentId, updatedMetrics);
            }, 300 );
        }

        // Cleanup: clear the timeout if effect re-runs or unmounts
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
             renderCountRef.current--;
        };
    }, [props, componentId, displayName, parentId, addOrUpdateMetrics]); // Effect dependencies

    return metricsRef.current; // Return the current state of metrics
}