import { useState } from 'react';
import { api } from '../api/endpoints';
import { useAnalysisContext } from '../context/AnalysisContext';

export const useAnalysis = () => {
  const { metadata, setAnalysisResult, setParetoResult } = useAnalysisContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuantitative = async (tool: string, xCols: string[], yCol: string, params: any) => {
    if (!metadata) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.analyzeQuantitative({
        filename: metadata.filename,
        tipo_analisis: tool,
        columnas_x: xCols,
        columna_y: yCol,
        parametros: params
      });
      setAnalysisResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error en el análisis");
    } finally {
      setLoading(false);
    }
  };

  const executePareto = async (column: string) => {
    if (!metadata) return;
    setLoading(true);
    try {
      const data = await api.analyzePareto(metadata.filename, column);
      setParetoResult(data);
    } catch (err: any) {
      setError("Error ejecutando Pareto");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, executeQuantitative, executePareto };
};