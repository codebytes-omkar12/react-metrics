import { type IAllComponentMetrics, type IHierarchyNode } from "../types/performance";

export const buildHierarchyTree = (allMetrics: IAllComponentMetrics): IHierarchyNode[] => {
  const nodes: Record<string, IHierarchyNode> = {};
  const rootNodes: IHierarchyNode[] = [];

  // Step 1: Convert metrics to tree nodes
  for (const id in allMetrics) {
    nodes[id] = {
      ...allMetrics[id],
      children: [],
      componentPath: "",
    };
  }

  // Step 2: Link children to their parents
  for (const id in nodes) {
    const node = nodes[id];
    const parent = node.parentId ? nodes[node.parentId] : null;

    if (parent) {
      parent.children.push(node);
    } else {
      rootNodes.push(node);
    }
  }

  // Step 3: Assign componentPath and sort children
  const buildPaths = (node: IHierarchyNode, parentPath = "") => {
    node.componentPath = parentPath ? `${parentPath} > ${node.displayName}` : node.displayName;
    node.children.sort((a, b) => a.displayName.localeCompare(b.displayName));
    node.children.forEach((child) => buildPaths(child, node.componentPath));
  };

  const appNode = rootNodes.find((n) => n.id === "App");

  if (appNode) {
    buildPaths(appNode);
  } else {
    rootNodes.forEach((node) => buildPaths(node));
  }

  return rootNodes.sort((a, b) => a.displayName.localeCompare(b.displayName));
};
