import { useState,useRef,useEffect} from "react";
import { type IMetrics, type IPropChange } from "../types/performance";
import { usePerformanceContext } from "../context/PerformanceContext";



// to find the propchanges 
  const findPropChanges=(oldProps:Record<string,any>|undefined,newProps:Record<string,any>):Record<string,IPropChange>=>{
   const changes:Record<string,IPropChange>={};
     if(!oldProps){
        return changes;
     }

     const allKeys= new Set({...Object.keys(oldProps),...Object.keys(newProps)})


     allKeys.forEach((key)=>{
                const oldValue=oldProps[key];
                const newValue=newProps[key];
            if (oldValue !== newValue) {
                changes[key] = { from: oldValue, to: newValue };
        }
    });

     
      
     
     return changes;
  }
     
 

export function usePerformanceMonitor(componentName:string,props:Record<string,any>,options?:{parentId?:string; componentPath?:string}){

  //destructuring the optional object
     const{parentId,componentPath}=options||{}

      const[metrics,setMetrics]=useState<IMetrics>({
         mountTime:0,
         lastRenderDuration:0,
         totalRenderDuration: 0,
         reRenders:0,
         propsChanged:{},
        _prevProps:undefined,
        parentId:parentId,
        componentPath:componentPath
      });
    
      const renderCount=useRef<number>(0);
      const lastRenderTime=useRef<number>(0);
      

      const {addOrUpdateMetrics} = usePerformanceContext();


     
   //core hook functtionality
useEffect(() => {
        
  if ( renderCount.current) {
    renderCount.current += 1;
  } else {
    renderCount.current = 1;
    console.warn("Render count was not initialized, setting to 1.");
  }

  const currentRenderTime = performance.now();
  let calculatedLastRenderDuration = 0;

  if (lastRenderTime.current) {
    calculatedLastRenderDuration = currentRenderTime - lastRenderTime.current;
  } else {
    console.warn("Last Render Time was not read");
  }


 setMetrics((prev)=>{
   const oldPropsComparision = prev._prevProps;
   const newPropsComparision = props;

   const detectedPropChange=findPropChanges(oldPropsComparision,newPropsComparision);
   const actualMountTime=(renderCount.current===1)?currentRenderTime:prev.mountTime
  

   const updatedMetrics:IMetrics={
    ...prev,
    mountTime:actualMountTime,
    lastRenderDuration: calculatedLastRenderDuration,
    totalRenderDuration: prev.totalRenderDuration + calculatedLastRenderDuration,
    reRenders: renderCount.current ?? prev.reRenders,
    propsChanged:detectedPropChange,
    _prevProps:newPropsComparision,
    parentId:parentId,
    componentPath:componentPath
   }
   
  return updatedMetrics
 })
 

 lastRenderTime.current = currentRenderTime;
}, [props,addOrUpdateMetrics,parentId,componentPath])

useEffect(() => {
        
        if (metrics.reRenders >= 0) { 
            addOrUpdateMetrics(componentName, metrics);
        }
    }, [metrics, componentName, addOrUpdateMetrics]);


      return metrics;
}

