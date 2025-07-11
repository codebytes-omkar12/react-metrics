export interface IMetrics {
  mountTime: number;
  lastRenderDuration: number;
  totalRenderDuration: number;
  reRenders: number;
  propsChanged: Record<string, IPropChange>;
  _prevProps?: Record<string, any> | undefined
  parentId?: string;
  id: string;
  displayName: string;
}

export type PerformanceConfig = {
  parentId?: string;
  id: string;
  displayName: string;
}

export interface IPropChange {
  from: any;
  to: any;
}

export type IAllComponentMetrics = Record<string, IMetrics>;



export interface IBundleMetrics {
  totalSizeKB: number;
}

export interface IMemoryMetrics {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
  timestamp: number;
}

export interface IHierarchyNode extends IMetrics {
  componentPath: string;
  children: IHierarchyNode[];

}

export interface HookDetail {
  hook: string;
  line: number;
  source: string;
  args: number;
  firstArg: string;
  description?: string;
}