import pandas as pd

# 1. Cargar tus datos largos de AppEEARS
df_vegetacion = pd.read_csv('MOD13A3-061-Statistics.csv')

# Diccionario de mapeo (La Piedra Rosetta de tu GeoJSON)
mapeo_regiones = {
    'aid0001': 'Niger',
    'aid0002': 'Brasil',
    'aid0003': 'Tanzania',
    'aid0004': 'Australia',
    'aid0005': 'Peru'
}

def procesar_variable(df_largo, palabra_clave_var):
    """
    Filtra por variable (NDVI, EVI), mapea las regiones y pivota a Wide.
    """
    # Filtrar la variable buscando en el File Name
    df_var = df_largo[df_largo['File Name'].str.contains(palabra_clave_var)].copy()
    
    # Traducir los aid000X al nombre real del país
    df_var['Region'] = df_var['aid'].map(mapeo_regiones)
    
    # Quedarse solo con lo útil (Fecha, Región, Media y Count para QA)
    df_util = df_var[['Date', 'Region', 'Mean']].copy()

    
    # Renombrar columnas para que sean específicas de la variable
    df_util.rename(columns={'Mean': f'{palabra_clave_var}_Mean'}, inplace=True)
    
    # Convertir Date a datetime
    df_util['Date'] = pd.to_datetime(df_util['Date'], format='%Y-%m-%d')
    
    return df_util

# 2. Extraer NDVI y EVI por separado
df_ndvi = procesar_variable(df_vegetacion, 'NDVI')
df_evi = procesar_variable(df_vegetacion, 'EVI')

# 3. Unirlos en un solo DataFrame maestro de Vegetación
# Usamos merge por Date y Region
df_vegetacion_maestro = pd.merge(df_ndvi, df_evi, on=['Date', 'Region'], how='outer')

# 4. 
# En lugar de un archivo de 70 trozos, generamos 5 archivos perfectos.
for region in mapeo_regiones.values():
    # Filtrar los datos de ese país
    df_pais = df_vegetacion_maestro[df_vegetacion_maestro['Region'] == region].copy()
    
    # Borrar la columna Region (ya está en el nombre del archivo)
    df_pais.drop(columns=['Region'], inplace=True)
    
    # Ordenar por fecha y exportar
    df_pais = df_pais.sort_values('Date').set_index('Date')
    
    # El archivo final: datos_Brasil.csv, datos_Niger.csv...
    nombre_archivo = f"datos_{region}.csv"
    df_pais.to_csv(nombre_archivo)
    print(f"Exportado {nombre_archivo} con formato Wide.")