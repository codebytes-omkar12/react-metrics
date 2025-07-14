import React from 'react';

import { useContext,createContext,useState,useCallback,useEffect,useMemo } from "react";
import type {PropsWithChildren} from "react";
import { type IAllComponentMetrics, type IMetrics, type IBundleMetrics, type IMemoryMetrics } from "../types/performance";


interface IPerformanceMetricsState{
    allMetrics:IAllComponentMetrics;
    currentMemoryMetrics:IMemoryMetrics | null;
    bundleMetrics:IBundleMetrics|null;
}

interface IPerformanceMetricsDispatch{
    addOrUpdateMetrics:(componentname:string,metrics:IMetrics)=>void;
     updateMemoryMetrics: (metrics: IMemoryMetrics | null) => void;

}
const PerformanceMetricsStateContext = createContext<IPerformanceMetricsState | undefined>(undefined);
const PerformanceMetricsDispatchContext = createContext<IPerformanceMetricsDispatch | undefined>(undefined);

type PerformanceProviderProps=PropsWithChildren<{}>

export const PerformanceProvider:React.FC<PerformanceProviderProps>=({children})=>{
     const [allMetrics,setAllMetrics]=/*State Variable to store and update allMetrics Data*/useState<IAllComponentMetrics>({});
     const [currentMemoryMetrics,setCurrentMemoryMetrics]=/*State Variable to store and update currentMemoryMetrics Data*/useState<IMemoryMetrics|null>(null)
     const [bundleMetrics,setBundleMetrics]=/*State Variable to store and update bundle memory Data*/useState<IBundleMetrics |null>(null)

   
     const addOrUpdateMetrics =/*memoizes the function used to add new component and its metrics to the allcomponentmetrics */useCallback(
        (componentName:string,metrics:IMetrics)=>{
            setAllMetrics(prev=>({
                ...prev,
                [componentName]:metrics,

            }));
        }
     ,[])

     //update the memory metrics
     const updateMemoryMetrics=/*memoizes the function used to update the memory metrics of a component */ useCallback(
       (metrics:IMemoryMetrics|null) => {
        setCurrentMemoryMetrics(metrics)
       },
       [],
     )

     /*Hook To render the Bundle Memory*/useEffect(() => {
       setBundleMetrics({totalSizeKB:1234})
     
     }, [ ])
     
    
  const stateValue=/*Hook To memoize the object containing metrics data*/useMemo(() => ({allMetrics,currentMemoryMetrics,bundleMetrics}), [allMetrics,currentMemoryMetrics,bundleMetrics])
   const dispatchValue =/*Hook To memoize the dispatch functions*/ useMemo(() => ({
        addOrUpdateMetrics,
        updateMemoryMetrics
    }), [addOrUpdateMetrics, updateMemoryMetrics]);
     
    return(
        <PerformanceMetricsStateContext.Provider value={stateValue}>
            <PerformanceMetricsDispatchContext.Provider value={dispatchValue}>
                {children}
            </PerformanceMetricsDispatchContext.Provider>
        </PerformanceMetricsStateContext.Provider>
    )
}

export const usePerformanceMetrics = () =>{
    const context=/*Hook to use the declared context for performance metrics*/useContext(PerformanceMetricsStateContext);
    if(context === undefined){
        throw new Error('usePerformanceMetrics must be used within a PerformanceProvider');
    }
    return context;
}

export const usePerformanceDispatch = () =>{
    const context=/*Hook to use the declared context for dispatch function cretae dinside the context*/useContext(PerformanceMetricsDispatchContext);
    if(context === undefined){
        throw new Error('usePerformanceDispatch must be used within a PerformanceProvider');
    }
    return context;
}
    
    
    

