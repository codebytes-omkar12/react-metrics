// context/HookAnalysisContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { type HookDetail } from '../types/performance';

interface HookAnalysisContextType {
  hookDetails: HookDetail[];
  setHookDetails: (details: HookDetail[]) => void;
  hookReady: boolean;
  setHookReady: (ready: boolean) => void;
}

const HookAnalysisContext = createContext<HookAnalysisContextType | undefined>(undefined);

export const HookAnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hookDetails, setHookDetails] = useState<HookDetail[]>([]);
  const [hookReady, setHookReady] = useState(false);

  return (
    <HookAnalysisContext.Provider value={{ hookDetails, setHookDetails, hookReady, setHookReady }}>
      {children}
    </HookAnalysisContext.Provider>
  );
};

export const useHookAnalysis = (): HookAnalysisContextType => {
  const context = useContext(HookAnalysisContext);
  if (!context) {
    throw new Error('useHookAnalysis must be used within HookAnalysisProvider');
  }
  return context;
};
