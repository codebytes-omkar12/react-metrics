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
     
    
  const stateValue=useMemo(() => ({allMetrics,currentMemoryMetrics,bundleMetrics}), [allMetrics,currentMemoryMetrics,bundleMetrics])
   const dispatchValue = useMemo(() => ({
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
    const context=useContext(PerformanceMetricsStateContext);
    if(context === undefined){
        throw new Error('usePerformanceMetrics must be used within a PerformanceProvider');
    }
    return context;
}

export const usePerformanceDispatch = () =>{
    const context=useContext(PerformanceMetricsDispatchContext);
    if(context === undefined){
        throw new Error('usePerformanceDispatch must be used within a PerformanceProvider');
    }
    return context;
}
    
    
    

