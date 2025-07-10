import React, { useEffect, useState } from "react";
import { Folder, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { useSidebar } from "../context/SideBarContext";
import { useFileContext } from "../context/FilePathContext";


interface TreeNode {
  name: string;
  path: string;
  children?: TreeNode[];
  type: "file" | "folder";
}

// 📁 Build the folder tree
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

const Sidebar: React.FC = () => {
  const { isSidebarOpen } = useSidebar();
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const { setFilePath } = useFileContext(); // ✅ Using context
  

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

      return (
        <div key={node.path} className="pl-2">
          <div
            className={`flex items-center space-x-2 py-1 px-1 cursor-pointer rounded transition-colors ${
              selectedFilePath === node.path
                ? "bg-blue-700 text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => {
              if (isFolder) {
                toggleFolder(node.path);
              } else {
                setSelectedFilePath(node.path);
                setFilePath(node.path); // ✅ Set globally
              }
            }}
          >
            {isFolder ? (
              <>
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <Folder size={16} />
              </>
            ) : (
              <FileText size={16} />
            )}
            {isSidebarOpen && <span className="truncate">{node.name}</span>}
          </div>

          {isFolder && isOpen && node.children && (
            <div className="pl-4">{renderTree(node.children)}</div>
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
        transition-all duration-300 ease-in-out
        overflow-y-auto
        shadow-lg
        text-black
        border-r border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800 dark:text-white
        ${isSidebarOpen ? "w-64" : "w-16"}
      `}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span
          className={`text-lg font-bold transition-opacity duration-300 ${
            isSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          Explorer
        </span>
      </div>

      <div className="px-2 py-4">{renderTree(treeData)}</div>
    </aside>
  );
};

export default Sidebar;
