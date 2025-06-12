export interface IMetrics{
  mountTime:number;
  lastRenderDuration:number;
  totalRenderDuration: number;
  reRenders:number;
  propsChanged:Record<string,IPropChange>;
  _prevProps?:any;
}

export interface IPropChange{
 from:any;
 to:any;0
}

export type IAllComponentMetrics = Record<string,IMetrics>;


export interface IPerformanceContextValue{
    allMetrics:IAllComponentMetrics;
    addOrUpdateMetrics:(componentName:string,metrics:IMetrics)=>void;
}