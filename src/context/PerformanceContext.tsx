import { useContext,createContext,useState,useCallback,useEffect,useMemo } from "react";
import type {PropsWithChildren} from "react";
import { type IAllComponentMetrics, type IPerformanceContextValue, type IMetrics, type IBundleMetrics, type IMemoryMetrics } from "../types/performance";



const PerformanceContext =createContext<IPerformanceContextValue|undefined>(undefined);

type PerformanceProviderProps=PropsWithChildren<{}>
export const PerformanceProvider:React.FC<PerformanceProviderProps>=({children})=>{
     const [allMetrics,setAllMetrics]=useState<IAllComponentMetrics>({});
     const [currentMemoryMetrics,setCurrentMemoryMetrics]=useState<IMemoryMetrics|null>(null)
     const [bundleMetrics,setBundleMetrics]= useState<IBundleMetrics |null>(null)

     //add new component and its metrics to the allcomponentmetrics
     const addOrUpdateMetrics = useCallback(
        (componentName:string,metrics:IMetrics)=>{
            setAllMetrics(prev=>({
                ...prev,
                [componentName]:metrics,

            }));
        }
     ,[])

     //update the memory metrics
     const updateMemoryMetrics= useCallback(
       (metrics:IMemoryMetrics|null) => {
        setCurrentMemoryMetrics(metrics)
       },
       [],
     )

     useEffect(() => {
       setBundleMetrics({totalSizeKB:1234})
     
     }, [ ])
     
    
  const contextValue: IPerformanceContextValue = useMemo(() => {
        return {
            allMetrics,
            addOrUpdateMetrics,
            currentMemoryMetrics,
            bundleMetrics,
            updateMemoryMetrics
        };
    }, [allMetrics, addOrUpdateMetrics, currentMemoryMetrics, bundleMetrics, updateMemoryMetrics]);
     
    return(
        <PerformanceContext.Provider value={contextValue}>
            {children}
        </PerformanceContext.Provider>
    )
}

export const usePerformanceContext = () =>{
    const context=useContext(PerformanceContext);
    if(context === undefined){
        throw new Error('usePerformanceContext must be used within a PerformanceProvider')
    }
    return context;
}

    
    
    

