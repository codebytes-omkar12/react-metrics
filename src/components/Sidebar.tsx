import React, { useEffect, useState } from "react";
import { Folder, FileText, ChevronDown, ChevronRight, BarChart3 } from "lucide-react";
import { useSidebar } from "../context/SideBarContext";
import { useFilePath } from "../context/FilePathContext";
import { usePerformanceStore } from '../stores/performanceStore';
import { getComponentIdFromPath } from "../utils/getComponentIdFromPath";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";

interface TreeNode {
  name: string;
  path: string;
  children?: TreeNode[];
  type: "file" | "folder";
}

function buildTree(paths: string[]): TreeNode[] {
  const root: TreeNode[] = [];
  for (const filePath of paths) {
    const parts = filePath.split("/");
    let currentLevel = root;
    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      let node = currentLevel.find((n) => n.name === part);
      if (!node) {
        node = {
          name: part,
          path: parts.slice(0, index + 1).join("/"),
          type: isFile ? "file" : "folder",
          ...(isFile ? {} : { children: [] }),
        };
        currentLevel.push(node);
      }
      if (!isFile && node.children) {
        currentLevel = node.children;
      }
    });
  }
  return root;
}

const Sidebar: React.FC = (props) => {
  usePerformanceMonitor({
    id: 'Sidebar',
    props,
  });

  const { isSidebarOpen } = useSidebar();
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  
  const { setFilePath } = useFilePath(); 
  const setSelectedComponentId = usePerformanceStore((state) => state.setSelectedComponentId);
  const currentlySelectedId = usePerformanceStore((state) => state.selectedComponentId);

  const toggleFolder = (path: string) => {
    setOpenFolders((prev) => {
      const newSet = new Set(prev);
      newSet.has(path) ? newSet.delete(path) : newSet.add(path);
      return newSet;
    });
  };

  const renderTree = (nodes: TreeNode[]) => {
    const sortedNodes = [...nodes].sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return sortedNodes.map((node) => {
      const isOpen = openFolders.has(node.path);
      const isFolder = node.type === "folder";
      const componentId = isFolder ? null : getComponentIdFromPath(node.path);
      const isSelected = componentId === currentlySelectedId && componentId !== null;

      return (
        <div key={node.path} className="pl-2">
          <div
            className={`flex items-center space-x-2 py-1.5 px-2 cursor-pointer rounded-md transition-colors text-sm ${
              isSelected
                ? "bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark font-semibold"
                : "hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-text-secondary-light dark:text-text-secondary-dark"
            }`}
            onClick={() => {
              if (isFolder) {
                toggleFolder(node.path);
              } else {
                setFilePath(node.path);
                setSelectedComponentId(componentId);
              }
            }}
          >
            {isFolder ? (
              isOpen ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />
            ) : (
              <div className="w-4" /> // Placeholder for alignment
            )}
            {isFolder ? <Folder size={16} className="flex-shrink-0" /> : <FileText size={16} className="flex-shrink-0" />}
            <span className="truncate">{node.name}</span>
          </div>

          {isFolder && isOpen && node.children && (
            <div className="pl-4 border-l border-border-light dark:border-border-dark ml-4">{renderTree(node.children)}</div>
          )}
        </div>
      );
    });
  };

  useEffect(() => {
    fetch("http://localhost:5001/list-files")
      .then((res) => res.json())
      .then((filePaths: string[]) => {
        const tree = buildTree(filePaths);
        setTreeData(tree);
      })
      .catch((err) => console.error("Failed to fetch file list:", err));
  }, []);

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-full
        w-64 transform transition-transform duration-300 ease-in-out
        bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-lg
        border-r border-border-light dark:border-border-dark
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border-light dark:border-border-dark">
        <BarChart3 className="text-primary-light dark:text-primary-dark" />
        <span className="text-lg font-bold">React Metrics</span>
      </div>

      <div className="px-2 py-4 space-y-1">{renderTree(treeData)}</div>
    </aside>
  );
};

export default Sidebar;