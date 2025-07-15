import React, { createContext, useContext } from "react";

const ParentMonitorContext = createContext<string | null>(null);

export const useParentId = () => useContext(ParentMonitorContext);

export const ParentMonitorProvider: React.FC<{
  id: string;
  children: React.ReactNode;
}> = ({ id, children }) => {
  return (
    <ParentMonitorContext.Provider value={id}>
      {children}
    </ParentMonitorContext.Provider>
  );
};
