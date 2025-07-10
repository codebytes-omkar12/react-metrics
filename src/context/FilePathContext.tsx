import { useState, createContext, useContext, type ReactNode } from "react";
import { getComponentIdFromPath } from "../utils/getComponentIdFromPath";

interface FileContextType {
  filePath: string | null;
  componentId: string | null;
  setFilePath: (path: string) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const [filePath, setFilePathState] = useState<string | null>(null);
  const [componentId, setComponentId] = useState<string | null>(null);

  const setFilePath = (path: string) => {
    setFilePathState(path);
    setComponentId(getComponentIdFromPath(path));
  };

  return (
    <FileContext.Provider value={{ filePath, componentId, setFilePath }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFileContext = () => {
  const context = useContext(FileContext);
  if (!context) throw new Error("useFileContext must be used within FileProvider");
  return context;
};
