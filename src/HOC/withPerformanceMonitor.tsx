import React from "react";
import { usePerformanceMonitor} from "../hooks/usePerformanceMonitor";


interface WithPerformanceMonitorArgs{
    id:string;
    displayName?:string;
    parentId?:string;
}



function withPerformanceMonitor<P extends Object>(WrappedComponent:React.ComponentType<P>,monitorArgs:WithPerformanceMonitorArgs){


    const WithPerformanceMonitorComponent:React.FC<P>=(props)=>{
        const{id,displayName,parentId}=monitorArgs;
               usePerformanceMonitor(id,displayName || WrappedComponent.displayName|| WrappedComponent.name || 'UnknownComponent', props,parentId)
            return <WrappedComponent {...props}/>

    }
    

    return WithPerformanceMonitorComponent;

}  


export default withPerformanceMonitor;



