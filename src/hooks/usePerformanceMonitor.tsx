import { useState,useRef,useLayoutEffect,useEffect,useCallback } from "react";
import { type IMetrics, type IPropChange } from "../types";

 function usePerformanceMonitor(componentName:string,props:Record<string,any>){

      const[metrics,setMetrics]=useState<IMetrics>({
         mountTime:0,
         lastRenderDuration:0,
         totalRenderDuration: 0,
         reRenders:0,
         propsChanged:{},
        _prevProps:undefined
      });
      const mountStart=useRef<number|null>(0);
      const renderCount=useRef<number|null>(0);
      const lastRenderTime=useRef<number|null>(0);


      useLayoutEffect(() => {
        mountStart.current=performance.now()
        return () => {
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
           
          ;
        };
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

  setMetrics(prev => ({
    ...prev,
    lastRenderDuration: calculatedLastRenderDuration,
    totalRenderDuration: prev.totalRenderDuration + calculatedLastRenderDuration,
    reRenders: renderCount.current ?? prev.reRenders
  }));

  lastRenderTime.current = currentRenderTime;
 
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

   return{
    ...prev,
    propsChanged:detectedPropChange,
    _prevProps:newPropsComparision
   }
 })

  return () => {};
}, [props])
      





    return metrics;
}

export default usePerformanceMonitor