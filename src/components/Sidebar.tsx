import React, { useState, useEffect } from "react";
import { Folder, FileText, ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";

interface TreeNode {
  name: string;
  path: string;
  children?: TreeNode[];
  type: "file" | "folder";
}

interface SidebarProps {
  onSelectFile: (filePath: string) => void;
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

const Sidebar: React.FC<SidebarProps> = ({ onSelectFile }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  const toggleFolder = (path: string) => {
    setOpenFolders((prev) => {
      const newSet = new Set(prev);
      newSet.has(path) ? newSet.delete(path) : newSet.add(path);
      return newSet;
    });
  };

  const renderTree = (nodes: TreeNode[]): JSX.Element[] => {
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
            className={`flex items-center space-x-2 py-1 cursor-pointer rounded px-1 ${
              selectedFilePath === node.path ? "bg-blue-700 text-white" : ""
            }`}
            onClick={() => {
              if (isFolder) {
                toggleFolder(node.path);
              } else {
                setSelectedFilePath(node.path);
                onSelectFile(node.path);
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
            <span className="truncate">{node.name}</span>
          </div>

          {isFolder && isOpen && node.children && (
            <div className="pl-4">{renderTree(node.children)}</div>
          )}
        </div>
      );
    });
  };
console.log(selectedFilePath);
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
      className={`transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      } bg-gray-900 text-white h-auto overflow-y-auto shadow-lg`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-lg font-bold">{isOpen ? "Explorer" : "🧩"}</span>
        <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <div className="px-2 py-4">{renderTree(treeData)}</div>
    </aside>
  );
};

export default Sidebar;
