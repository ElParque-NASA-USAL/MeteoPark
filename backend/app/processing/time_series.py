from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt


DATA_DIR = Path(__file__).resolve().parents[3] / "data"

UNITS = {
    "precipitation": "mm/hr",
    "SoilMoi0_10cm_inst": "kg/m²",
    "RootMoist_inst": "kg/m²",
    "Tair_f_inst": "K",
    "Qair_f_inst": "kg/kg",
    "SWdown_f_tavg": "W/m²",
    "Evap_tavg": "kg/m²/s",
    "PotEvap_tavg": "W/m²",
    "Qs_acc": "kg/m²",
    "Wind_f_inst": "m/s",
    "NDVI": "unitless",
    "EVI": "unitless",
}

def get_countries():
    return [
        folder.name for folder in DATA_DIR.iterdir()
        if folder.is_dir() and (folder / "all_concat.csv").exists()
    ]


def load_country(country: str):
    if country not in get_countries():
        raise ValueError("Invalid country")

    path = DATA_DIR / country / "all_concat.csv"
    return pd.read_csv(path, parse_dates=["time"])


def get_variables(country: str):
    df = load_country(country)
    return [col for col in df.columns if col != "time"]



def plot_time_series(country: str, variable: str):
    df = load_country(country)

    if variable not in df.columns:
        raise ValueError("Invalid variable")

    df = df.sort_values("time")

    unit = next(
        (u for name, u in UNITS.items() if name in variable),
        "Unknown unit"
    )

    fig, ax = plt.subplots(figsize=(12, 5))

    ax.plot(df["time"], df[variable], color="royalblue")

    ax.set_title(f"{country} - {variable}")
    ax.set_xlabel("Date")
    ax.set_ylabel(f"Value ({unit})")
    ax.grid(True, alpha=0.3)

    fig.tight_layout()

    return fig

if __name__ == "__main__":
    country = get_countries()[0]
    variable = get_variables(country)[10]

    fig = plot_time_series(country, variable)
    plt.show()
