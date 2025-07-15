import { useMemo } from "react";
import { type IAllComponentMetrics, type IHierarchyNode } from "../types/performance";
import { buildHierarchyTree } from "./buildHierarchyTree";

export const useBuildHierarchyTree = (allMetrics: IAllComponentMetrics): IHierarchyNode[] => {
  return useMemo(() => buildHierarchyTree(allMetrics), [allMetrics]);
};
