import pandas as pd
import shutil
import os
import csv
import re

UPLOAD_DIR = "data/"

def extraer_metadata_valor(valor):
    """
    Extrae moneda, sufijo y valor numérico de strings como '$252.9 B'.
    Retorna: (valor_numerico, moneda, sufijo)
    """
    if pd.isna(valor):
        return (valor, None, None)
    
    if isinstance(valor, (int, float)):
        return (valor, None, None)
    
    texto = str(valor).strip()
    texto_upper = texto.upper()
    
    if not texto:
        return (pd.NA, None, None)
    
    # Detectar moneda
    moneda = None
    monedas = {'$': 'USD', '€': 'EUR', '£': 'GBP', '¥': 'JPY'}
    for simbolo, nombre in monedas.items():
        if simbolo in texto:
            moneda = nombre
            break
    
    # Detectar sufijo (B, M, K)
    sufijo = None
    multiplicador = 1
    if texto_upper.endswith('B'):
        sufijo = 'B'
        multiplicador = 1_000_000_000
        texto_upper = texto_upper[:-1]
    elif texto_upper.endswith('M'):
        sufijo = 'M'
        multiplicador = 1_000_000
        texto_upper = texto_upper[:-1]
    elif texto_upper.endswith('K'):
        sufijo = 'K'
        multiplicador = 1_000
        texto_upper = texto_upper[:-1]
    
    # Remover símbolos de moneda, espacios y comas
    texto_limpio = re.sub(r'[$€£¥%\s,]', '', texto_upper)
    
    # Intentar convertir a número
    try:
        valor_numerico = float(texto_limpio)
        return (valor_numerico, moneda, sufijo)
    except ValueError:
        return (valor, None, None)


def limpiar_dataframe(df):
    """
    Aplica limpieza automática a columnas que parecen numéricas pero tienen formato.
    Crea columnas adicionales para moneda y sufijo si se detectan.
    """
    columnas_nuevas = {}
    
    for col in df.columns:
        # Solo procesar columnas tipo object (strings)
        if df[col].dtype == 'object':
            # Tomar muestra para detectar si parece numérica
            muestra = df[col].dropna().head(10).astype(str)
            
            # Patrones que indican valores numéricos formateados
            patron_numerico = r'^[\$€£¥]?\s*[\d,]+\.?\d*\s*[BMK%]?$'
            
            # Si >50% de la muestra coincide, limpiar la columna
            coincidencias = muestra.str.upper().str.match(patron_numerico).sum()
            if len(muestra) > 0 and coincidencias / len(muestra) > 0.5:
                # Extraer metadata de cada valor
                resultados = df[col].apply(extraer_metadata_valor)
                
                # Separar en columnas
                valores = [r[0] for r in resultados]
                monedas = [r[1] for r in resultados]
                sufijos = [r[2] for r in resultados]
                
                # Actualizar columna original con valores numéricos
                df[col] = valores
                
                # Intentar convertir a numérico
                try:
                    df[col] = pd.to_numeric(df[col])
                except (ValueError, TypeError):
                    pass
                
                # Crear columna de moneda si hay al menos una
                if any(m is not None for m in monedas):
                    columnas_nuevas[f"{col}_moneda"] = monedas
                
                # Crear columna de sufijo si hay al menos uno
                if any(s is not None for s in sufijos):
                    columnas_nuevas[f"{col}_escala"] = sufijos
    
    # Agregar las nuevas columnas al DataFrame
    for nombre_col, valores in columnas_nuevas.items():
        df[nombre_col] = valores
    
    return df

# Asegurarse que la carpeta data existe
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def process_upload(file):
    file_location = f"{UPLOAD_DIR}/{file.filename}"
    
    # 1. Guardar el archivo físicamente
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 2. Leer con Pandas según extensión
    if file.filename.endswith('.csv'):
        # Detectar el delimitador automáticamente
        with open(file_location, 'r', encoding='utf-8') as f:
            sample = f.read(4096)  # Leer primeros 4KB
            sniffer = csv.Sniffer()
            delimiter = sniffer.sniff(sample).delimiter
        
        # Leer con el delimitador detectado
        df = pd.read_csv(file_location, sep=delimiter, encoding='utf-8')
    elif file.filename.endswith('.xlsx'):
        df = pd.read_excel(file_location)
    else:
        return {"error": "Formato no soportado"}

    # 3. Limpiar valores numéricos con formato ($, B, M, K)
    df = limpiar_dataframe(df)
    
    # 4. Guardar el archivo limpio (sobrescribir)
    if file.filename.endswith('.csv'):
        df.to_csv(file_location, index=False)
    elif file.filename.endswith('.xlsx'):
        df.to_excel(file_location, index=False)

    # 5. Retornar metadatos básicos (Columnas, filas)
    return {
        "filename": file.filename,
        "rows": df.shape[0],
        "columns": list(df.columns),
        "preview": df.head(5).fillna("null").to_dict()
    }