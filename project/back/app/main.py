from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints

app = FastAPI(
    title="Motor de Analítica de Datos",
    description="Backend para procesamiento de datos, Pareto y generación de reportes.",
    version="1.0.0"
)

# Configuración CORS (Permite que React en localhost:3000 hable con este backend)
origins = [
    "http://localhost",
    "http://localhost:3000",  # Puerto por defecto de React
    "http://localhost:5173",  # Puerto de Vite
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir las rutas
app.include_router(endpoints.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"mensaje": "API de Analítica funcionando correctamente"}