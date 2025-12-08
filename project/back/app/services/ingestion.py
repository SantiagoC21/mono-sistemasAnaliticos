import pandas as pd
import shutil
import os
import csv

UPLOAD_DIR = "data/"

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

    # 3. Retornar metadatos básicos (Columnas, filas)
    return {
        "filename": file.filename,
        "rows": df.shape[0],
        "columns": list(df.columns),
        "preview": df.head(5).fillna("null").to_dict()
    }