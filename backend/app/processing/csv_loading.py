import pandas as pd
from pathlib import Path

# Get the subdirectory conatining the csvs.
# List all the subdirectories.
# Load all csvs within that directory and
# In my case: /mnt/c/Users/Angel/Documents/Proyectos/proyecto-nasa/backend/app
CWD = Path.cwd()
CSV_PATH = CWD.parent.parent / "data"

def read_giovanni_csv(path):
    with open(path, encoding="utf-8-sig") as f:
        skip = next(
            i for i, line in enumerate(f)
            if line.strip().startswith("time,")
        )

    df = pd.read_csv(path, skiprows=skip, skipinitialspace=True)
    df.columns = df.columns.str.strip()
    df["time"] = pd.to_datetime(df["time"])

    return df.set_index("time")


def fuse_csvs():
    earth_region_paths = [entry for entry in CSV_PATH.iterdir() if entry.is_dir()]

    for country in earth_region_paths:
        country_variables = [
            read_giovanni_csv(variable)
            for variable in country.glob("*.csv")
            if variable.name != "all_concat.csv"
        ]

        final_df = pd.concat(country_variables, axis=1, sort=False).reset_index()
        final_df = final_df.dropna()
        final_df.to_csv(country / "all_concat.csv", index=False)


if __name__ == "__main__":
    fuse_csvs()
