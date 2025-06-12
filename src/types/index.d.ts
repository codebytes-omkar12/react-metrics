export interface IMetrics{
  mountTime:number;
  lastRenderDuration:number;
  totalRenderDuration: number;
  reRenders:number;
  propsChanged:Record<string,IPropChange>;
  _prevProps?:Record<string,any> | undefined
  parentId?:string;
  componentPath?: string;
}

export interface IPropChange{
 from:any;
 to:any;
}

export type IAllComponentMetrics = Record<string,IMetrics>;


export interface IPerformanceContextValue{
    allMetrics:IAllComponentMetrics;
    addOrUpdateMetrics:(componentName:string,metrics:IMetrics)=>void;
    currentMemoryMetrics:IMemoryMetrics | null;
    bundleMetrics:IBundleMetrics | null;
    updateMemoryMetrics:(metrics:IMemoryMetrics)=>void;
}

export interface IBundleMetrics {
  totalSizeKB:number;
}

export interface IMemoryMetrics{
  jsHeapSizeLimit:number;
  totaljsheapSize:number;
  usedJSHeapSize:number;
  timestamp:number;
}
  
