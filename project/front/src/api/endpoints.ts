import { apiClient } from './client';
import { AnalysisResult, FileMetadata, ParetoResult } from '../types/analysis';

export const api = {
  upload: async (file: File): Promise<FileMetadata> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<FileMetadata>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  analyzeQuantitative: async (payload: any): Promise<AnalysisResult> => {
    const { data } = await apiClient.post<AnalysisResult>('/analizar/cuantitativo', payload);
    return data;
  },

  analyzePareto: async (filename: string, column: string): Promise<ParetoResult> => {
    const { data } = await apiClient.post<ParetoResult>('/analizar/pareto', {
      filename, columna: column
    });
    return data;
  }
};