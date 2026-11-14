import pandas as pd

def print_filas(num_filas, df):
    print(f"primeras {num_filas} filas")
    print(df.iloc[0:num_filas])


# 1. Cargar el CSV de estadísticas (el de tu imagen)
ruta_csv = 'MOD13A3-061-Statistics.csv'
df = pd.read_csv(ruta_csv)

print_filas(1,df)

# 2. Filtrar solo las columnas que nos importan
# (La fecha y la media aritmética de la región)
df_serie = df[['File Name', 'aid', 'Date', 'Mean', 'Count']].copy()

print_filas(5,df_serie)

# 3. Convertir la fecha a formato datetime de Pandas 
df_serie['Date'] = pd.to_datetime(df_serie['Date'], format='%Y-%m-%d')
df_serie = df_serie.sort_values('Date').set_index('Date')

n1 = (df['aid'] == 'aid0001').sum()
n2 = (df['aid'] == 'aid0002').sum()
n3 = (df['aid'] == 'aid0003').sum()
n4 = (df['aid'] == 'aid0004').sum()
n5 = (df['aid'] == 'aid0005').sum()

print('numeros')
print(n1, n2, n3, n4, n5)

print_filas(5,df_serie)

# --- EXPLORACIÓN ---
print("--- DATOS DEL CSV (Serie Temporal Agregada) ---")
print(f"Número total de meses: {len(df_serie)}")

# Ver la primera fila (El mes más antiguo)
print("\nPrimera línea de la serie temporal:")
print(df_serie.iloc[0])
