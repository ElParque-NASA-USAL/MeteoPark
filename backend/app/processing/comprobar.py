import pandas as pd
import glob
import os

# Automatically find the five generated files.
files = glob.glob('datos_*.csv')

for file in files:
    df = pd.read_csv(file)

    # Find columns whose names contain 'Count'.
    count_columns = [col for col in df.columns if 'Count' in col]

    print(f"\n========================================")
    print(f"FILE: {os.path.basename(file)}")
    print(f"========================================")

    for col in count_columns:
        # Summarize the minimum, maximum and mean over the long time series.
        # A very low minimum may indicate a month with extensive cloud cover.
        min_count = df[col].min()
        max_count = df[col].max()
        mean_count = df[col].mean()

        print(f"Variable: {col}")
        print(f"  -> Historical maximum: {max_count:,.0f} pixels (total clear area)")
        print(f"  -> Typical mean:       {mean_count:,.0f} pixels")
        print(f"  -> Critical minimum:   {min_count:,.0f} pixels")

        # Raise an alert if the minimum is below 20% of the maximum area count.
        if min_count < (max_count * 0.2):
            print(f"  ⚠️ WARNING: Some months had almost no valid pixels because of clouds.")
        else:
            print(f"  ✅ OK: Pixel counts remain consistently high.")
