import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useAnalysisContext } from '../context/AnalysisContext';
import { useAnalysis } from '../hooks/useAnalysis';
import { api } from '../api/endpoints';
import ParetoChart from '../components/charts/ParetoCharts';
import SummaryTool from './tools/SummaryTool';
import FrequencyTool from './tools/FrequencyTool';
import CorrelationTool from './tools/CorrelationTool';
import TTestTool from './tools/TTestTool';
import AnovaTool from './tools/AnovaTool';
import RegressionTool from './tools/RegressionTool';
import LogisticTool from './tools/LogisticTool';
// Lista de Herramientas
import DecisionTreeTool from './tools/DecisionTreeTool';
import KMeansTool from './tools/KMeansTool';
import WordCloudTool from './tools/WordCloudTool';
import SentimentTool from './tools/SentimentTool';

const TOOLS = [
  // DESCRIPTIVA
  { id: "resumen", name: "Estadística Descriptiva (Resumen)", category: "EDA" },
  { id: "frecuencias", name: "Distribución de Frecuencias", category: "EDA" },
  { id: "correlacion", name: "Matriz de Correlación", category: "EDA" },
  //{ id: "outliers", name: "Detección de Outliers", category: "EDA" },
  //{ id: "pivot_table", name: "Tabla Dinámica", category: "EDA" },

  // INFERENCIAL
  { id: "ttest", name: "Prueba T (2 Grupos)", category: "Inferencial" },
  { id: "anova", name: "ANOVA (+3 Grupos)", category: "Inferencial" },
  //{ id: "chi2", name: "Chi-Cuadrado", category: "Inferencial" },

  // PREDICTIVA
  { id: "regresion_lineal", name: "Regresión Lineal Simple/Múltiple", category: "Predictiva" },
  { id: "regresion_logistica", name: "Regresión Logística (Clasificación)", category: "Predictiva" },
  { id: "arbol_decision", name: "Árbol de Decisión (Reglas)", category: "Predictiva" },
  { id: "random_forest", name: "Random Forest (Alta Precisión)", category: "Predictiva" },

  // MACHINE LEARNING / NLP
  { id: "kmeans", name: "Clustering K-Means (Segmentación)", category: "ML" },
  { id: "pca", name: "Reducción Dimensionalidad (PCA)", category: "ML" },
  { id: "nube_palabras", name: "Minería de Texto (Nube Palabras)", category: "NLP" },
  { id: "sentimiento", name: "Análisis de Sentimiento", category: "NLP" },
  
  // TIEMPO
  { id: "descomposicion_serie", name: "Series de Tiempo (Tendencia)", category: "Tiempo" }
];

const AnalysisDashboard: React.FC = () => {
  const { metadata, setMetadata, analysisResult, paretoResult } = useAnalysisContext();
  const { loading, error, executeQuantitative, executePareto } = useAnalysis();

  // Estado Local del Formulario
  const [step, setStep] = useState(1);
  const [tool, setTool] = useState("");
  const [_yCol, setYCol] = useState("");
  const [_xCol, setXCols] = useState<string[]>([]);
  const [paretoCol, setParetoCol] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler para seleccionar archivo
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  // Handler para input de archivo
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Handler para drag & drop
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Handler para cargar archivo
  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const data = await api.upload(selectedFile);
      setMetadata(data);
      // No cambiamos step, la vista previa se muestra en step 1
    } catch (e) {
      alert("Error subiendo archivo");
    }
  };

  // Handler para iniciar análisis
  const handleAnalyze = () => {
    if (!tool) return;
    setStep(2);
  };

  return (
    <>
      {/* ERROR BANNER */}
      {error && <div className="error-banner">{error}</div>}

        {/* PASO 1: CARGA */}
        {step === 1 && (
          <>
            <div className="card">
              <h1 className="card-title">Cargar datos</h1>
              <p className="card-subtitle">
                Sube tus archivos de datos para empezar el análisis. Formatos soportados:<br />
                .csv, .xlsx, .xls. Tamaño máximo recomendado: 100 MB por archivo.
              </p>

              <div
                className={`dropzone ${isDragging ? 'dropzone-active' : ''} ${selectedFile ? 'dropzone-success' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="dropzone-file-info">
                    <div className="dropzone-icon">✓</div>
                    <p className="dropzone-text dropzone-filename">{selectedFile.name}</p>
                    <div className="dropzone-actions">
                      <button 
                        type="button" 
                        className="dropzone-btn dropzone-btn-change"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      >
                        Cambiar
                      </button>
                      <button 
                        type="button" 
                        className="dropzone-btn dropzone-btn-remove"
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setMetadata(null as any); }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="dropzone-icon">↑</div>
                    <p className="dropzone-text">
                      Arrastra tu archivo aquí o{' '}
                      <span className="dropzone-link">selecciónalo desde tu equipo</span>
                    </p>
                    <p className="dropzone-formats">Formatos soportados: .csv, .xlsx, .xls</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden-input"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleInputChange}
                />
              </div>

              <p className="info-text">
                {metadata 
                  ? `Archivo seleccionado: ${metadata.filename}. Verifica que los encabezados y separadores sean consistentes.`
                  : 'También puedes cargar varios archivos de forma secuencial. Verifica que los encabezados y separadores sean consistentes.'}
              </p>

              <button
                className={`btn ${selectedFile ? 'btn-active' : ''}`}
                onClick={handleUpload}
                disabled={!selectedFile || loading}
              >
                {loading ? 'Cargando...' : 'Cargar'}
              </button>

              <p className="helper-text">
                {selectedFile 
                  ? `Archivo seleccionado: ${selectedFile.name}` 
                  : 'Selecciona un archivo para habilitar el botón de carga.'}
              </p>
            </div>

            {/* Vista previa después de cargar */}
            {metadata && (
              <>
                {/* Info del archivo */}
                <div className="file-info-bar">
                  <div className="file-info-left">
                    <span className="file-info-name">{metadata.filename}</span>
                    <span className="file-info-separator">Separator: , · Codificación: UTF-8</span>
                  </div>
                  <div className="file-info-right">
                    Filas detectadas: 5 de {metadata.rows.toLocaleString()} · Columnas: {metadata.columns.length}
                  </div>
                </div>

                {/* Tabla de vista previa */}
                <div className="preview-section">
                  <div className="preview-header">
                    <h3 className="preview-title">Vista previa de los datos</h3>
                    <span className="preview-subtitle">Mostrando las primeras 5 filas del archivo cargado</span>
                  </div>
                  
                  <div className="preview-table-container">
                    <table className="preview-table">
                      <thead>
                        <tr>
                          {metadata.columns.map(col => (
                            <th key={col}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {metadata.preview && Object.keys(metadata.preview).length > 0 && 
                          Object.keys(metadata.preview[metadata.columns[0]] || {}).map((rowIndex) => (
                            <tr key={rowIndex}>
                              {metadata.columns.map(col => (
                                <td key={col}>{metadata.preview[col]?.[rowIndex] ?? ''}</td>
                              ))}
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Selector de herramienta */}
                <div className="tool-selector">
                  <div className="tool-selector-left">
                    <h3 className="tool-selector-title">Elija herramienta de análisis</h3>
                    <p className="tool-selector-subtitle">Selecciona cómo quieres explorar los datos cargados.</p>
                  </div>
                  <div className="tool-selector-right">
                    <select 
                      className="tool-select"
                      onChange={(e) => {
                        setTool(e.target.value);
                        setXCols([]);
                        setYCol("");
                      }}
                      value={tool}
                    >
                      <option value="">Seleccione una herramienta...</option>
                      {TOOLS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <button 
                      className="btn btn-active"
                      onClick={handleAnalyze}
                      disabled={!tool || loading}
                    >
                      Analizar
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* RESUMEN: CONFIGURACIÓN Y RESULTADOS */}
        {tool === "resumen" && metadata && step >= 2 && (
          <div className="card">
            <SummaryTool
              step={step}
              metadata={metadata}
              result={analysisResult}
              loading={loading}
              onAnalyze={(xCols) => {
                setXCols(xCols);
                executeQuantitative("resumen", xCols, "", {});
                setStep(3);
              }}
              onBack={() => setStep(2)}
            />
          </div>
        )}


        {tool === 'frecuencias' && step >= 2 && metadata && (
          <FrequencyTool 
            step={step}
            metadata={metadata}
            result={analysisResult}
            loading={loading}
            onAnalyze={async (cols) => {
              await executeQuantitative('frecuencias', cols, "", {});
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}

        {tool === 'correlacion' && step >= 2 && (
          <CorrelationTool 
            step={step}
            result={analysisResult}
            loading={loading}
            onAnalyze={async () => {
              await executeQuantitative('correlacion', [], "", {});
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}

        {tool === 'ttest' && metadata && step >= 2 && (
          <TTestTool 
            step={step}
            metadata={metadata}
            result={analysisResult}
            loading={loading}
            onAnalyze={async (xCols, yCol) => {
              // Nota: TTest usa una columna X y una Y
              await executeQuantitative('ttest', xCols, yCol, {});
              setStep(3);
            }}
            onBack={() => setStep(2)}
          />
        )}

        {tool === 'anova' && metadata && step >= 2 && (
          <AnovaTool 
            step={step}
            metadata={metadata}
            result={analysisResult}
            loading={loading}
            onAnalyze={async (xCols, yCol) => {
              // ANOVA usa X para el valor y Y para el grupo
              await executeQuantitative('anova', xCols, yCol, {});
              setStep(3);
            }}
            onBack={() => setStep(2)}
          />
        )}
        {tool === 'regresion_lineal' && metadata && step >= 2 && (
          <RegressionTool 
            step={step}
            metadata={metadata}
            result={analysisResult}
            loading={loading}
            onAnalyze={async (xCols, yCol) => {
              // Regresión: yCol es Target, xCols es Features
              await executeQuantitative('regresion_lineal', xCols, yCol, {});
              setStep(3);
            }}
            onBack={() => setStep(2)}
          />
        )}
        {tool === 'regresion_logistica' && metadata && step >= 2 && (
          <LogisticTool 
            step={step}
            metadata={metadata}
            result={analysisResult}
            loading={loading}
            onAnalyze={async (xCols, yCol) => {
              // Logística: Y=Clase, X=Features
              await executeQuantitative('regresion_logistica', xCols, yCol, {});
              setStep(3);
            }}
            onBack={() => setStep(2)}
          />
        )}

        {tool === 'arbol_decision' && metadata && step >= 2 && (
          <DecisionTreeTool 
            step={step}
            metadata={metadata}
            result={analysisResult}
            loading={loading}
            onAnalyze={async (xCols, yCol) => {
              await executeQuantitative('arbol_decision', xCols, yCol, {});
              setStep(3);
            }}
            onBack={() => setStep(2)}
          />
        )}

        {tool === 'kmeans' && metadata && step >= 2 && (
          <KMeansTool 
            step={step}
            metadata={metadata}
            result={analysisResult}
            loading={loading}
            onAnalyze={async (xCols, yCol, params) => {
              // Pasamos params para el n_clusters
              await executeQuantitative('kmeans', xCols, "", params);
              setStep(3);
            }}
            onBack={() => setStep(2)}
          />
        )}

        {tool === 'nube_palabras' && metadata && step >= 2 && (
          <WordCloudTool 
            step={step}
            metadata={metadata}
            result={analysisResult}
            loading={loading}
            onAnalyze={async (xCols, yCol) => {
              // NLP usa yCol para la columna de texto
              await executeQuantitative('nube_palabras', [], yCol, {});
              setStep(3);
            }}
            onBack={() => setStep(2)}
          />
        )}

        {tool === 'sentimiento' && metadata && step >= 2 &&  (
          <SentimentTool 
            step={step}
            metadata={metadata}
            result={analysisResult}
            loading={loading}
            onAnalyze={async (xCols, yCol) => {
              // NLP usa yCol para el texto
              await executeQuantitative('sentimiento', [], yCol, {});
              setStep(3);
            }}
            onBack={() => setStep(2)}
          />
        )}

        




        {step === 3 && analysisResult && tool !== "resumen" && tool !== "frecuencias" && tool !== "correlacion" && tool !== "ttest" && (
          <div className="card">
            <h1 className="card-title">Resultados ({tool})</h1>
            <pre style={{background: '#f4f4f4', padding: 15, borderRadius: 5, overflow: 'auto'}}>
              {JSON.stringify(analysisResult, null, 2)}
            </pre>

            <hr style={{margin: '20px 0'}} />
            
            <h3>Identificar Causas (Pareto)</h3>
            <select onChange={(e) => setParetoCol(e.target.value)} style={{marginRight: 10, padding: 8}}>
               <option value="">-- Columna Categórica --</option>
               {metadata?.columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button 
               className="btn btn-active"
               onClick={() => { executePareto(paretoCol); setStep(4); }}
               style={{display: 'inline-block', margin: 0}}
            >
              Ir a Pareto
            </button>
          </div>
        )}

        {/* PASO 4: PARETO */}
        {step === 4 && paretoResult && (
          <div className="card">
            <h1 className="card-title">Principio de Pareto</h1>
            <ParetoChart data={paretoResult.items} />
            
            <button className="btn btn-active" onClick={() => setStep(2)} style={{marginTop: 20}}>
              Volver al inicio
            </button>
          </div>
        )}
    </>
  );
};

export default AnalysisDashboard;