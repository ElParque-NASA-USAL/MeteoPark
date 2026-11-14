import pandas as pd
import glob
import os

# Buscar automáticamente los 5 archivos generados
archivos = glob.glob('datos_*.csv')

for archivo in archivos:
    df = pd.read_csv(archivo)
    
    # Extraer dinámicamente las columnas que contengan la palabra 'Count'
    columnas_count = [col for col in df.columns if 'Count' in col]
    
    print(f"\n========================================")
    print(f"ARCHIVO: {os.path.basename(archivo)}")
    print(f"========================================")
    
    for col in columnas_count:
        # Como es una serie temporal larga, mostramos el mínimo, máximo y media.
        # El mínimo es la métrica clave: si es muy bajo, ese mes hubo nubes masivas.
        min_count = df[col].min()
        max_count = df[col].max()
        mean_count = df[col].mean()
        
        print(f"Variable: {col}")
        print(f"  -> Máximo histórico: {max_count:,.0f} píxeles (Área total despejada)")
        print(f"  -> Media habitual:   {mean_count:,.0f} píxeles")
        print(f"  -> Mínimo crítico:   {min_count:,.0f} píxeles")
        
        # Lógica de alerta: Si el mínimo cae por debajo del 20% del tamaño del área
        if min_count < (max_count * 0.2):
            print(f"  ⚠️ ALERTA: Hubo meses donde casi no hubo píxeles válidos debido a nubes.")
        else:
            print(f"  ✅ OK: El conteo de píxeles se mantiene alto de forma constante.")