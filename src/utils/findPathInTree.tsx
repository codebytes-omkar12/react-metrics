import { type IHierarchyNode } from "../types/performance";


export const findPathInTree = (nodes: IHierarchyNode[], targetId: string): string | undefined => {
                                    for (const n of nodes) {
                                        if (n.id === targetId) return n.componentPath;
                                        const foundChild = findPathInTree(n.children, targetId);
                                        if (foundChild) return foundChild;
                                    }
                                    return undefined;
                                };