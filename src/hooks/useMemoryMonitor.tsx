import{useRef,useEffect} from 'react'
import type{ IMemoryMetrics } from '../types/performance'
import { usePerformanceDispatch } from '../context/PerformanceContext'


export function useMemoryMonitor(options?:{intervalMs:number}){

  const{intervalMs=1000}=options ||{}
   
    const intervalRef=/*Ref Variable to set interval */useRef<number>(0);
    const isApiAvaialbleRef=/*Ref Variable to set boolean variable saying is using the useMemoryMonitor hook is possible or not */useRef<boolean>(true);

    const {updateMemoryMetrics}=/*Hook to import dispatch function updateMemoryMetrics from the context */usePerformanceDispatch();
    // console.log(performance);
    
//Hook to run the updateMemoryMetrics function on render of the components
useEffect(() => { 
    if(!(performance &&(performance as any).memory )){
          isApiAvaialbleRef.current=false;
          console.warn("MemoryMonitoring not possible for this component")
          updateMemoryMetrics(null);
          return;
      }
    
        isApiAvaialbleRef.current=true;
       
        function sampleMemory(){
          const {jsHeapSizeLimit,usedJSHeapSize,totalJSHeapSize}=(performance as any).memory
            const currentTimeStamp=performance.now()
            const updatedMemoryMetrics:IMemoryMetrics={
                jsHeapSizeLimit:jsHeapSizeLimit,
                totalJSHeapSize:totalJSHeapSize,
                usedJSHeapSize:usedJSHeapSize,
                timestamp:currentTimeStamp
        }
        updateMemoryMetrics(updatedMemoryMetrics)
      };
      // Run one sample after 500ms
      const timeoutId = setTimeout(() => {
        sampleMemory();
      }, 500);
      intervalRef.current = window.setInterval(() => {
        sampleMemory();
      }, intervalMs);
  
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalRef.current);
    }
  }, [intervalMs,updateMemoryMetrics])

  return isApiAvaialbleRef.current;
  
}