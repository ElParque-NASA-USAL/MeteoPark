import pandas as pd

# 1. Load the AppEEARS data in long format.
vegetation_df = pd.read_csv('MOD13A3-061-Statistics.csv')

# Map AppEEARS area IDs to the names used in the original data filenames.
region_mapping = {
    'aid0001': 'Niger',
    'aid0002': 'Brasil',
    'aid0003': 'Tanzania',
    'aid0004': 'Australia',
    'aid0005': 'Peru'
}

def process_variable(long_df, variable_keyword):
    """Filter a vegetation variable and map regions for wide-format export."""
    # Match the variable in the File Name column.
    variable_df = long_df[long_df['File Name'].str.contains(variable_keyword)].copy()

    # Map each aid000X identifier to its region name.
    variable_df['Region'] = variable_df['aid'].map(region_mapping)

    # Keep the date, region and mean value.
    selected_df = variable_df[['Date', 'Region', 'Mean']].copy()

    # Give the mean column a variable-specific name.
    selected_df.rename(columns={'Mean': f'{variable_keyword}_Mean'}, inplace=True)

    # Convert Date to a datetime value.
    selected_df['Date'] = pd.to_datetime(selected_df['Date'], format='%Y-%m-%d')

    return selected_df

# 2. Extract NDVI and EVI separately.
ndvi_df = process_variable(vegetation_df, 'NDVI')
evi_df = process_variable(vegetation_df, 'EVI')

# 3. Merge both indices into one vegetation table by date and region.
combined_vegetation_df = pd.merge(ndvi_df, evi_df, on=['Date', 'Region'], how='outer')

# 4. Export one wide-format file for each of the five regions.
for region in region_mapping.values():
    # Select this region's observations.
    region_df = combined_vegetation_df[combined_vegetation_df['Region'] == region].copy()

    # Remove Region because the filename already identifies it.
    region_df.drop(columns=['Region'], inplace=True)

    # Sort by date before exporting.
    region_df = region_df.sort_values('Date').set_index('Date')

    # Retain the original data filenames for compatibility.
    filename = f"datos_{region}.csv"
    region_df.to_csv(filename)
    print(f"Exported {filename} in wide format.")
