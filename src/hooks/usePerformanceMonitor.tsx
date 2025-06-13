import { useState,useRef,useLayoutEffect,useEffect} from "react";
import { type IMetrics, type IPropChange } from "../types";
import { usePerformanceContext } from "../context/PerformanceContext";

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
      const mountStart=useRef<number>(performance.now());
      const renderCount=useRef<number>(1);
      const lastRenderTime=useRef<number>(0);
      

      const {addOrUpdateMetrics} = usePerformanceContext();


      useLayoutEffect(() => {
        
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
  

   const updatedMetrics:IMetrics={
    ...prev,
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
   addOrUpdateMetrics(componentName, metrics);
}, [metrics,addOrUpdateMetrics])

      return metrics;
}

