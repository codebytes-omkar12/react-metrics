import { useState,useRef,useLayoutEffect,useEffect} from "react";
import { type IMetrics, type IPropChange } from "../types";
import { usePerformanceContext } from "../context/PerformanceContext";

 function usePerformanceMonitor(componentName:string,props:Record<string,any>,options?:{parentId?:string; componentPath?:string}){

      const[metrics,setMetrics]=useState<IMetrics>({
         mountTime:0,
         lastRenderDuration:0,
         totalRenderDuration: 0,
         reRenders:0,
         propsChanged:{},
        _prevProps:undefined,
        parentId:options?.parentId,
        componentPath:options?.componentPath
      });
      const mountStart=useRef<number|null>(0);
      const renderCount=useRef<number|null>(0);
      const lastRenderTime=useRef<number|null>(0);

      const {addOrUpdateMetrics} = usePerformanceContext();


      useLayoutEffect(() => {
        mountStart.current=performance.now()
        const mountEnd=performance.now();
            let calculatedMountTime=0;
            if(mountStart.current){
                       calculatedMountTime=mountEnd-mountStart.current;
            }
            else{
                console.warn("mount time was not recorded or the the component before unmount")
            }
               setMetrics(prev => ({
            ...prev,
            mountTime: calculatedMountTime
          })) 
        
      }, [])


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

  const findPropChanges=(oldProps:Record<string,any>|undefined,newProps:Record<string,any>):Record<string,IPropChange>=>{
   const changes:Record<string,IPropChange>={};
     if(!oldProps){
        return changes;
     }
     for(const key of Object.keys(newProps)) {
          const oldValue=oldProps[key];
          const newValue=newProps[key];
          if(newValue!==oldValue){
            try{
                if(JSON.stringify(oldValue)!==JSON.stringify(newValue)){
                    changes[key]={from:oldValue,to:newValue}
                }
                
            }
            catch(e){
                changes[key]={from:'[complex type]',to:'[complex type]'}
            }
          
          }
      
     }
     return changes;
     
 }

 setMetrics((prev)=>{
   const oldPropsComparision = prev._prevProps;
   const newPropsComparision = props;

   const detectedPropChange=findPropChanges(oldPropsComparision,newPropsComparision);
   const actualMountTime = (renderCount.current===1 &&prev.mountTime===0)?currentRenderTime:prev.mountTime;

   const updatedMetrics:IMetrics={
    ...prev,
    mountTime:actualMountTime,
    lastRenderDuration: calculatedLastRenderDuration,
    totalRenderDuration: prev.totalRenderDuration + calculatedLastRenderDuration,
    reRenders: renderCount.current ?? prev.reRenders,
    propsChanged:detectedPropChange,
    _prevProps:newPropsComparision,
    parentId:options?.parentId,
    componentPath:options?.componentPath
   }
   addOrUpdateMetrics(componentName,updatedMetrics);

   return updatedMetrics
 })
 
 lastRenderTime.current = currentRenderTime;


}, [props,componentName,addOrUpdateMetrics,options])
      





    return metrics;
}

export default usePerformanceMonitor