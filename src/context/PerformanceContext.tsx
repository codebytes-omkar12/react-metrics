import { useContext,createContext,useState,useCallback } from "react";
import type {PropsWithChildren} from "react";
import { type IAllComponentMetrics, type IPerformanceContextValue,type IPropChange, type IMetrics } from "../types";

const PerformanceContext =createContext<IPerformanceContextValue|undefined>(undefined);

type PerformanceProviderProps=PropsWithChildren<{}>
const PerformanceProvider:React.FC<PerformanceProviderProps>=({children})=>{
     const [allMetrics,setAllMetrics]=useState<IAllComponentMetrics>({});

     const 
    return(
        <PerformanceContext.Provider value={allMetrics}>

        </PerformanceContext.Provider>
    )
}

    
    
    

