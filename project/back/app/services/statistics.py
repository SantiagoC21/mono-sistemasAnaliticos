import pandas as pd
import numpy as np

def calcular_pareto(df: pd.DataFrame, columna: str):
    """
    Realiza el análisis de Pareto sobre una columna categórica.
    Retorna una lista de diccionarios con la clasificación ABC.
    """
    # 1. Validar que la columna existe
    if columna not in df.columns:
        raise ValueError(f"La columna '{columna}' no existe en el archivo.")

    # 2. Calcular Frecuencias (Value Counts)
    # Esto agrupa y cuenta las ocurrencias (Ej. "Fallo Motor": 500 veces)
    pareto_df = df[columna].value_counts().reset_index()
    pareto_df.columns = ['etiqueta', 'frecuencia']

    # 3. Calcular Porcentajes
    total = pareto_df['frecuencia'].sum()
    pareto_df['porcentaje'] = (pareto_df['frecuencia'] / total) * 100

    # 4. Calcular Acumulado (La clave del Pareto)
    pareto_df['acumulado'] = pareto_df['porcentaje'].cumsum()

    # 5. Clasificación ABC (Regla de negocio estándar)
    # A: Vitales (0 - 80%)
    # B: Importantes (80% - 95%)
    # C: Triviales (95% - 100%)
    def clasificar(valor_acumulado):
        if valor_acumulado <= 80:
            return 'A'
        elif valor_acumulado <= 95:
            return 'B'
        else:
            return 'C'

    pareto_df['clase'] = pareto_df['acumulado'].apply(clasificar)

    # 6. Convertir a diccionario para la API
    resultados = pareto_df.to_dict(orient='records')
    
    return resultados