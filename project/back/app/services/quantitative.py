import pandas as pd
import numpy as np
from scipy import stats
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor, export_text
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, confusion_matrix
from sklearn import metrics
from textblob import TextBlob
import re
from collections import Counter


def descriptivo_resumen(df, columnas):
    # Seleccionar solo columnas numéricas
    datos = df[columnas].select_dtypes(include=[np.number])
    
    if datos.empty:
        return {"error": "Las columnas seleccionadas no son numéricas."}
    
    # Pandas describe() base
    resumen = datos.describe().to_dict()
    
    # Agregar métricas adicionales (Varianza, Asimetría, Curtosis)
    extra_stats = {}
    for col in datos.columns:
        series = datos[col].dropna()
        extra_stats[col] = {
            "varianza": series.var(),
            "moda": series.mode()[0] if not series.mode().empty else None,
            "asimetria": series.skew(),  # >0 cola derecha, <0 cola izquierda
            "curtosis": series.kurt()    # Que tan "picuda" es la curva
        }
    
    # Fusionar resultados
    for col in resumen:
        if col in extra_stats:
            resumen[col].update(extra_stats[col])

    # Convertir todos los valores NumPy a tipos nativos de Python
    def _to_native(v):
        if isinstance(v, (np.integer,)):
            return int(v)
        if isinstance(v, (np.floating,)):
            return float(v)
        return v

    resumen_nativo = {}
    for col, stats_dict in resumen.items():
        resumen_nativo[col] = {k: _to_native(v) for k, v in stats_dict.items()}

    # También convertir extra_stats (por si se usa separado en el futuro)
    for col, stats_dict in extra_stats.items():
        extra_stats[col] = {k: _to_native(v) for k, v in stats_dict.items()}

    # Mezclar nuevamente extra_stats ya convertido
    for col in resumen_nativo:
        if col in extra_stats:
            resumen_nativo[col].update(extra_stats[col])

    return resumen_nativo


def descriptivo_frecuencias(df, columna, bins=10):
    series = df[columna].dropna()
    
    # Si es numérica, hacemos un histograma (bins)
    if np.issubdtype(series.dtype, np.number):
        hist, bin_edges = np.histogram(series, bins=bins)
        # Formatear para gráficas: "10-20", "20-30"
        etiquetas = [f"{int(bin_edges[i])}-{int(bin_edges[i+1])}" for i in range(len(bin_edges)-1)]
        valores = hist.tolist()
        tipo = "numerico"
        
    # Si es categórica, contamos valores únicos
    else:
        conteo = series.value_counts().head(20) # Limitamos a top 20
        etiquetas = conteo.index.astype(str).tolist()
        valores = conteo.values.tolist()
        tipo = "categorico"
        
    return {
        "tipo": tipo,
        "etiquetas": etiquetas,
        "valores": valores
    }

def descriptivo_correlacion(df):
    # Solo numéricas
    df_num = df.select_dtypes(include=[np.number])
    
    # Matriz de Pearson (-1 a 1)
    matriz = df_num.corr(method='pearson').fillna(0)
    
    # Formato 'heatmap' para el frontend: [{x: col1, y: col2, value: 0.8}, ...]
    heatmap_data = []
    for x in matriz.columns:
        for y in matriz.columns:
            heatmap_data.append({
                "x": x, 
                "y": y, 
                "value": float(matriz.loc[x, y])
            })
            
    return {
        "variables": list(matriz.columns),
        "matriz": heatmap_data
    }

def inferencial_ttest(df, col_grupo, col_valor):
    # Limpiar nulos
    data = df[[col_grupo, col_valor]].dropna()
    
    # Obtener los grupos únicos
    grupos = data[col_grupo].unique()
    if len(grupos) != 2:
        return {"error": f"La variable '{col_grupo}' debe tener exactamente 2 categorías. Encontradas: {len(grupos)}"}
    
    grupo_a = data[data[col_grupo] == grupos[0]][col_valor]
    grupo_b = data[data[col_grupo] == grupos[1]][col_valor]
    
    # Ejecutar test
    t_stat, p_val = stats.ttest_ind(grupo_a, grupo_b)
    
    return {
        "prueba": "T-Test de Muestras Independientes",
        "grupos_comparados": [str(grupos[0]), str(grupos[1])],
        "medias": {str(grupos[0]): grupo_a.mean(), str(grupos[1]): grupo_b.mean()},
        "p_valor": p_val,
        "es_significativo": bool(p_val < 0.05), # True si hay diferencia real
        "conclusion": "Existe una diferencia significativa entre los grupos." if p_val < 0.05 else "No hay evidencia suficiente para decir que son diferentes."
    }

def inferencial_anova(df, col_grupo, col_valor):
    data = df[[col_grupo, col_valor]].dropna()
    
    # Crear lista de arrays para cada grupo
    grupos_data = [frame[col_valor].values for label, frame in data.groupby(col_grupo)]
    
    if len(grupos_data) < 3:
         return {"error": "ANOVA requiere al menos 3 grupos. Use T-Test para 2."}

    f_stat, p_val = stats.f_oneway(*grupos_data)
    
    return {
        "prueba": "ANOVA de un factor",
        "estadistico_f": f_stat,
        "p_valor": p_val,
        "es_significativo": bool(p_val < 0.05),
        "conclusion": "Al menos un grupo es estadísticamente diferente a los demás." if p_val < 0.05 else "Todos los grupos tienen comportamientos similares."
    }

def predictivo_regresion_lineal(df, target, features):
    # Preparar datos
    data = df[[target] + features].dropna()
    X = data[features]
    y = data[target]
    
    # Dividir entrenamiento (80%) y prueba (20%)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = LinearRegression()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    # Resultados
    return {
        "metrica_r2": r2_score(y_test, y_pred), # Calidad del modelo (0 a 1)
        "error_mse": mean_squared_error(y_test, y_pred),
        "coeficientes": {feat: coef for feat, coef in zip(features, model.coef_)},
        "intercepto": model.intercept_,
        "grafico_prediccion": {
            "real": y_test.head(20).tolist(),
            "predicho": y_pred[:20].tolist()
        }
    }

def predictivo_regresion_logistica(df, target, features):
    data = df[[target] + features].dropna()
    
    # Codificar Y si es texto (ej. "Compra", "No Compra" -> 1, 0)
    le = LabelEncoder()
    y = le.fit_transform(data[target])
    X = data[features]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = LogisticRegression(max_iter=1000)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    return {
        "accuracy": accuracy_score(y_test, y_pred), # % de aciertos
        "matriz_confusion": confusion_matrix(y_test, y_pred).tolist(),
        "clases_mapeo": {i: label for i, label in enumerate(le.classes_)}
    }


def predictivo_arbol_decision(df, target, features):
    data = df[[target] + features].dropna()
    X = data[features]
    y = data[target]
    
    # Detectar si es Regresión (Numérico) o Clasificación (Texto/Categoría)
    es_numerico = np.issubdtype(y.dtype, np.number)
    
    if es_numerico:
        # Arbol de Regresión
        model = DecisionTreeRegressor(max_depth=3, random_state=42)
        tipo = "Arbol de Regresión"
    else:
        # Arbol de Clasificación
        # Necesitamos convertir texto a números para sklearn, pero guardamos las etiquetas
        le = LabelEncoder()
        y = le.fit_transform(y)
        model = DecisionTreeClassifier(max_depth=3, random_state=42)
        tipo = "Arbol de Clasificación"
        
    model.fit(X, y)
    
    # Exportar las reglas como texto plano
    reglas = export_text(model, feature_names=features)
    importancias = dict(zip(features, model.feature_importances_))
    
    return {
        "tipo_modelo": tipo,
        "importancia_variables": importancias, # Qué variable pesó más
        "reglas_texto": reglas # String largo con las reglas if/else
    }


def unsupervised_kmeans(df, features, n_clusters=3):
    data = df[features].dropna()
    
    if len(data) < n_clusters:
        return {"error": "No hay suficientes datos para crear clusters."}

    # Estandarizar (Obligatorio para K-Means)
    scaler = StandardScaler()
    data_scaled = scaler.fit_transform(data)
    
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    kmeans.fit(data_scaled)
    
    # Asignar etiquetas
    data['cluster'] = kmeans.labels_
    
    # Calcular promedios por cluster para interpretar
    # "El Grupo 0 tiene altos ingresos y baja edad"
    perfil_clusters = data.groupby('cluster').mean().to_dict()
    
    return {
        "num_clusters": n_clusters,
        "distribucion": data['cluster'].value_counts().to_dict(),
        "perfil_promedio": perfil_clusters,
        # Enviamos coordenadas para graficar (solo las 2 primeras variables)
        "plot_data": [
            {"x": row[features[0]], "y": row[features[1]], "c": int(cluster)}
            for row, cluster in zip(data.to_dict('records'), kmeans.labels_)
        ]
    }


def nlp_frecuencia_palabras(df, columna, top_n=50):
    # Unir todo el texto
    texto_series = df[columna].dropna().astype(str)
    texto_completo = " ".join(texto_series.tolist()).lower()
    
    # Limpiar signos de puntuación simple
    texto_limpio = re.sub(r'[^\w\s]', '', texto_completo)
    palabras = texto_limpio.split()
    
    # Stopwords básicas en español (puedes ampliar esta lista)
    stopwords = {'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'se', 'del', 'las', 'un', 'por', 'con', 'no', 'una', 'su', 'para', 'es', 'al', 'lo', 'como', 'mas', 'pero', 'sus', 'le', 'ya', 'o'}
    
    palabras_utiles = [p for p in palabras if p not in stopwords and len(p) > 2]
    
    conteo = Counter(palabras_utiles).most_common(top_n)
    
    # Formato para nube de palabras: [{text: "palabra", value: 20}, ...]
    return [
        {"text": palabra, "value": frecuencia} 
        for palabra, frecuencia in conteo
    ]

def nlp_sentimiento(df, columna):
    # Nota: TextBlob por defecto funciona mejor en Inglés.
    # Para español requiere descargar corpora extra, pero usaremos la base estándar.
    # Si tus datos son en español, la precisión puede variar sin el corpus adecuado.
    
    data = df[[columna]].dropna()
    
    resultados = []
    positivos = 0
    negativos = 0
    neutros = 0
    
    for texto in data[columna].head(100): # Limitamos a 100 para no saturar la respuesta rápida
        blob = TextBlob(str(texto))
        # Si usas datos en español y quieres traducir autom.: blob.translate(to='en')
        # Pero eso es lento. Usaremos polaridad directa asumiendo estructura universal o inglés.
        
        polarity = blob.sentiment.polarity # -1 a 1
        
        if polarity > 0.1: 
            cat = "Positivo"
            positivos += 1
        elif polarity < -0.1: 
            cat = "Negativo"
            negativos += 1
        else: 
            cat = "Neutro"
            neutros += 1
            
        resultados.append({"texto": str(texto)[:50] + "...", "polaridad": polarity, "clasificacion": cat})
        
    return {
        "resumen": {
            "positivos": positivos,
            "negativos": negativos,
            "neutros": neutros
        },
        "muestras": resultados
    }