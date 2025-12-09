import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FileMetadata, AnalysisResult, ParetoResult } from '../types/analysis';

interface AnalysisContextType {
  metadata: FileMetadata | null;
  setMetadata: (data: FileMetadata) => void;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (data: AnalysisResult) => void;
  paretoResult: ParetoResult | null;
  setParetoResult: (data: ParetoResult) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [paretoResult, setParetoResult] = useState<ParetoResult | null>(null);

  return (
    <AnalysisContext.Provider value={{ 
      metadata, setMetadata, 
      analysisResult, setAnalysisResult, 
      paretoResult, setParetoResult 
    }}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysisContext = () => {
  const context = useContext(AnalysisContext);
  if (!context) throw new Error("useAnalysisContext must be used within an AnalysisProvider");
  return context;
};