from pydantic import BaseModel
from typing import List, Optional, Dict

class ParetoItem(BaseModel):
    etiqueta: str            # Ej: "Fallo de Motor", "Retraso Logístico"
    frecuencia: int          # Cuántas veces pasó
    porcentaje: float        # % individual
    acumulado: float         # % acumulado
    clase: str               # "A", "B", o "C"

class ParetoResponse(BaseModel):
    columna_analizada: str
    total_registros: int
    items: List[ParetoItem]  # Lista de filas procesadas

class AnalisisRequest(BaseModel):
    filename: str
    tipo_analisis: str  # "descriptivo", "correlacion", "ttest", "regresion_lineal"
    columnas_x: List[str] = [] # Para Regresiones o Descriptivo
    columna_y: str = "" # Para Regresiones o T-Test
    parametros: Dict[str, int] = {}