import { type IAllComponentMetrics, type IHierarchyNode } from "../types/performance";
import { useMemo } from "react";


export const useBuildHierarchyTree = (allMetrics:IAllComponentMetrics):IHierarchyNode[]=>{


    return useMemo(() => {
        const nodes: Record<string, IHierarchyNode> = {};
    
        const rootNodes: IHierarchyNode[] = [];
    
        //for initializing every node(component) with a children node array and a component path
    
        for (const id in allMetrics) {
          const metrics = allMetrics[id];
    
          nodes[id] = {
            ...metrics,
    
            children: [],
    
            componentPath: "",
          };
        }
    
        //for adding children component to the chidren array of their parent component and to add root nodes to the root node array
    
        for (const id in nodes) {
          const node = nodes[id];
    
          if (node.parentId && nodes[node.parentId]) {
            nodes[node.parentId].children.push(node);
          } else {
            rootNodes.push(node);
          }
        }
    
        //to sort the childen nodes of a particulat parent node and to set the componnet path of that node.
    
        const sortAndSetPath = (node: IHierarchyNode, parentPath: string = "") => {
          node.children.sort((a, b) => a.displayName.localeCompare(b.displayName));
    
          node.componentPath = parentPath
            ? `${parentPath} > ${node.displayName}`
            : node.displayName;
    
          node.children.forEach((child) =>
            sortAndSetPath(child, node.componentPath)
          );
        };
    
        //special handling of the app node
    
        const appNode = rootNodes.find((n) => n.id == "App");
    
        if (appNode) {
          sortAndSetPath(appNode);
        }
    
        //if app node is explicitly not marked as the root node then carry out sorting and setting mechanism for all root Nodes.
        else {
          rootNodes.forEach((node) => sortAndSetPath(node));
        }
    
        return rootNodes.sort((a, b) => a.displayName.localeCompare(b.displayName));
      }, [allMetrics]);
}