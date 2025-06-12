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
            if(typeof mountStart.current=='number'){
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
        // Increment render count
  if (typeof renderCount.current === "number") {
    renderCount.current += 1;
  } else {
    renderCount.current = 1;
    console.warn("Render count was not initialized, setting to 1.");
  }

  const currentRenderTime = performance.now();
  let calculatedLastRenderDuration = 0;

  if (typeof lastRenderTime.current === "number") {
    calculatedLastRenderDuration = currentRenderTime - lastRenderTime.current;
  } else {
    console.warn("Last Render Time was not read");
  }

  setMetrics(prev => ({
    ...prev,
    lastRenderDuration: calculatedLastRenderDuration,
    totalRenderDuration: prev.totalRenderDuration + calculatedLastRenderDuration,
    reRenders: renderCount.current ?? 0
  }));

  lastRenderTime.current = currentRenderTime;

  return () => {};
}, [props])
      





    return(<>


        </>)
}

export default usePerformanceMonitor