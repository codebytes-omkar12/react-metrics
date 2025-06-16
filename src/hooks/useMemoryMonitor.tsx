import{useRef,useEffect} from 'react'
import type{ IMemoryMetrics } from '../types/performance'
import { usePerformanceDispatch } from '../context/PerformanceContext'


export function useMemoryMonitor(options?:{intervalMs:number}){

  const{intervalMs=1000}=options ||{}
   
    const intervalRef=useRef<number>(0);
    const isApiAvaialbleRef=useRef<boolean>(true);

    const {updateMemoryMetrics}=usePerformanceDispatch();
    // console.log(performance);
    

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
      setTimeout(() => {
        sampleMemory();
      }, 500);
      
intervalRef.current=setInterval(() => {
  sampleMemory();
}, intervalMs);
  
    return () => {
      clearInterval(intervalRef.current);
    }
  }, [intervalMs,updateMemoryMetrics])

  return isApiAvaialbleRef.current;
  
}