from fastapi import APIRouter, HTTPException, UploadFile, File, Body
from app.services import ingestion, statistics, quantitative
from app.schemas.analysis import ParetoResponse, AnalisisRequest
import pandas as pd
import numpy as np
import os
import csv

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "ok", "sistema": "listo para analizar"}

@router.post("/upload")
async def upload_data(file: UploadFile = File(...)):
    """
    Recibe un archivo (CSV/Excel), lo guarda y retorna un resumen básico.
    """
    # Llamamos a la capa de servicio (la lógica real)
    summary = await ingestion.process_upload(file)
    return summary  

@router.post("/analizar/pareto", response_model=ParetoResponse)
async def ejecutar_pareto(
    filename: str = Body(..., embed=True), 
    columna: str = Body(..., embed=True)
):
    """
    Carga un archivo previamente subido y ejecuta el análisis de Pareto
    sobre la columna especificada.
    """
    file_path = f"data/{filename}"
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado. Súbelo primero.")

    try:
        # 1. Cargar datos (reutilizando lógica básica)
        if filename.endswith('.csv'):
            # Detectar el delimitador automáticamente como en process_upload
            with open(file_path, 'r', encoding='utf-8') as f:
                sample = f.read(4096)  # Leer primeros 4KB
                sniffer = csv.Sniffer()
                delimiter = sniffer.sniff(sample).delimiter
            df = pd.read_csv(file_path, sep=delimiter, encoding='utf-8')
        elif filename.endswith('.xlsx'):
            df = pd.read_excel(file_path)
        else:
            raise HTTPException(status_code=400, detail="Formato no soportado")

        # Limpiar valores numéricos con formato ($, B, M, K)
        df = ingestion.limpiar_dataframe(df)

        # 2. Ejecutar lógica de Pareto
        resultados = statistics.calcular_pareto(df, columna)

        # 3. Retornar respuesta estructurada
        return {
            "columna_analizada": columna,
            "total_registros": len(df),
            "items": resultados
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


@router.post("/analizar/cuantitativo")
async def ejecutar_analisis_cuantitativo(request: AnalisisRequest):
    """
    Endpoint maestro para todas las herramientas de análisis (Descriptivo, Inferencial, ML, NLP).
    """
    file_path = f"data/{request.filename}"
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado. Sube el archivo primero.")

    try:
        # 1. Cargar el DataFrame
        if request.filename.endswith('.csv'):
            with open(file_path, 'r', encoding='utf-8') as f:
                sample = f.read(4096)  # Leer primeros 4KB
                sniffer = csv.Sniffer()
                delimiter = sniffer.sniff(sample).delimiter
            df = pd.read_csv(file_path, sep=delimiter, encoding='utf-8')
        elif request.filename.endswith('.xlsx'):
            df = pd.read_excel(file_path)

        # Limpiar valores numéricos con formato ($, B, M, K)
        df = ingestion.limpiar_dataframe(df)

        # 2. Router de lógica (Switch-Case según herramienta)
        tool = request.tipo_analisis
        
        # --- A. ESTADÍSTICA DESCRIPTIVA ---
        if tool == "resumen":
            # Requiere lista de columnas numéricas (columnas_x)
            return quantitative.descriptivo_resumen(df, request.columnas_x)
            
        elif tool == "frecuencias":
            # Requiere una columna (usaremos la primera de x)
            if not request.columnas_x: raise ValueError("Seleccione una variable.")
            return quantitative.descriptivo_frecuencias(df, request.columnas_x[0])
            
        elif tool == "correlacion":
            # Usa todas las numéricas del DF, no requiere inputs
            return quantitative.descriptivo_correlacion(df)
            
        elif tool == "outliers":
            # Requiere una columna numérica
            if not request.columnas_x: raise ValueError("Seleccione una variable numérica.")
            return quantitative.descriptivo_outliers(df, request.columnas_x[0])

        # --- B. ESTADÍSTICA INFERENCIAL ---
        elif tool == "ttest":
            # Compara 2 grupos. Y = Columna Grupo (Cat), X[0] = Columna Valor (Num)
            if not request.columna_y or not request.columnas_x: 
                raise ValueError("Se requiere una variable de grupo (Y) y una numérica (X).")
            return quantitative.inferencial_ttest(df, request.columna_y, request.columnas_x[0])
            
        elif tool == "anova":
            # Compara 3+ grupos. Mismos inputs que T-Test
            return quantitative.inferencial_anova(df, request.columna_y, request.columnas_x[0])

        # --- C. MODELOS PREDICTIVOS ---
        elif tool == "regresion_lineal":
            # Y = Target (Num), X = Features (Lista Num)
            return quantitative.predictivo_regresion_lineal(df, request.columna_y, request.columnas_x)
            
        elif tool == "regresion_logistica":
            # Y = Target (Cat/Binario), X = Features (Lista Num)
            return quantitative.predictivo_regresion_logistica(df, request.columna_y, request.columnas_x)
            
        elif tool == "arbol_decision":
            # Y = Target, X = Features
            return quantitative.predictivo_arbol_decision(df, request.columna_y, request.columnas_x)

        # --- D. NO SUPERVISADO ---
        elif tool == "kmeans":
            # X = Features (Lista Num). Parametros opcionales n_clusters
            n_clusters = int(request.parametros.get("n_clusters", 3))
            return quantitative.unsupervised_kmeans(df, request.columnas_x, n_clusters)

        # --- E. NLP (TEXTO) ---
        elif tool == "nube_palabras":
            # Y = Columna de texto
            if not request.columna_y: raise ValueError("Seleccione la columna de texto.")
            return quantitative.nlp_frecuencia_palabras(df, request.columna_y)
            
        elif tool == "sentimiento":
            # Y = Columna de texto
            if not request.columna_y: raise ValueError("Seleccione la columna de texto.")
            return quantitative.nlp_sentimiento(df, request.columna_y)

        # ... dentro del if/else ...

        # --- F. RANDOM FOREST ---
        elif tool == "random_forest":
            # Detectar regresión o clasificación basado en Target
            if np.issubdtype(df[request.columna_y].dtype, np.number):
                tipo = "regresion"
            else:
                tipo = "clasificacion"
            return quantitative.predictivo_random_forest(df, request.columna_y, request.columnas_x, tipo)

        # --- G. SERIES DE TIEMPO (DESCOMPOSICIÓN) ---
        elif tool == "descomposicion_serie":
            # X = Columna Fecha, Y = Columna Valor
            # Parametros opcionales: periodo (ej. 12 meses)
            periodo = int(request.parametros.get("periodo", 12))
            return quantitative.series_tiempo_descomposicion(df, request.columnas_x[0], request.columna_y, periodo)

        # --- H. TABLA DINÁMICA ---
        elif tool == "pivot_table":
            # Requiere parametros específicos en el request o mapearlos
            # Usaremos: Y = Index, X[0] = Columns, X[1] = Values
            if len(request.columnas_x) < 2: 
                raise ValueError("Para Pivot Table se requieren 2 columnas en X: [Columnas, Valores]")
            
            index_col = request.columna_y
            columns_col = request.columnas_x[0]
            values_col = request.columnas_x[1]
            agg = request.parametros.get("aggfunc", "sum") # sum, mean, count
            
            return quantitative.wrangling_pivot_table(df, index_col, columns_col, values_col, agg)
        

        else:
            raise HTTPException(status_code=400, detail=f"Herramienta '{tool}' no reconocida.")

    except ValueError as ve:
        # Errores de validación de datos (ej. faltan columnas)
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Errores internos (código, librerías)
        print(f"Error procesando {request.tipo_analisis}: {str(e)}") # Log en consola
        raise HTTPException(status_code=500, detail=f"Error interno en el análisis: {str(e)}")