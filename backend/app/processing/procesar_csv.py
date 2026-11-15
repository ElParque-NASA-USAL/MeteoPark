import pandas as pd

def print_rows(row_count, df):
    print(f"First {row_count} rows")
    print(df.iloc[0:row_count])


# 1. Load the statistics CSV.
csv_path = 'MOD13A3-061-Statistics.csv'
df = pd.read_csv(csv_path)

print_rows(1, df)

# 2. Keep the relevant columns, including each region's date and mean.
series_df = df[['File Name', 'aid', 'Date', 'Mean', 'Count']].copy()

print_rows(5, series_df)

# 3. Convert the dates to pandas datetime values.
series_df['Date'] = pd.to_datetime(series_df['Date'], format='%Y-%m-%d')
series_df = series_df.sort_values('Date').set_index('Date')

n1 = (df['aid'] == 'aid0001').sum()
n2 = (df['aid'] == 'aid0002').sum()
n3 = (df['aid'] == 'aid0003').sum()
n4 = (df['aid'] == 'aid0004').sum()
n5 = (df['aid'] == 'aid0005').sum()

print('Counts')
print(n1, n2, n3, n4, n5)

print_rows(5, series_df)

# --- EXPLORATION ---
print("--- CSV DATA (Aggregated Time Series) ---")
print(f"Total number of months: {len(series_df)}")

# Display the first row, corresponding to the earliest month.
print("\nFirst row of the time series:")
print(series_df.iloc[0])
