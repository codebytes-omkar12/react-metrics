import React  from "react";
import { useState,createContext,useContext, type ReactNode } from "react";

interface FilePatContextType{
 filePath:string|null;
 setFilePath: React.Dispatch<React.SetStateAction<string | null>>;
}

const FilePathContext=createContext<FilePatContextType|undefined>(undefined);

export const FilePathProvider=({children}:{children:ReactNode})=>{
    const [filePath,setFilePath]=useState<string|null>(null);
    return(
         <FilePathContext.Provider value={{ filePath, setFilePath }}>
      {children}
    </FilePathContext.Provider>
    )
}
export const useFilePath = () => {
  const context = useContext(FilePathContext);
  if (!context) throw new Error("useFilePath must be used within FilePathProvider");
  return context;
};