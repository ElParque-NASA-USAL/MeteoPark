"""Load the provided common-period monthly regional data without changing it."""

from functools import lru_cache
from pathlib import Path

import numpy as np
import pandas as pd

from app.services.variable_service import variable_catalog

DATA_DIR = Path(__file__).resolve().parents[3] / "data"
REGIONS = {
    "Niger": ("Sahel, Niger", "Seasonal semi-arid"),
    "Brazil": ("Cerrado, Brazil", "Seasonal tropical savanna"),
    "Tanzania": ("Serengeti, Tanzania", "Seasonal tropical savanna"),
    "Australia": ("Northern Australia", "Monsoon savanna"),
    "Peru": ("Western Amazon, Peru", "Humid tropical forest"),
}


def monthly_frame(frame: pd.DataFrame) -> pd.DataFrame:
    """Keep missing months explicit so a lag always means calendar months."""
    frame = frame.copy()
    dates = pd.to_datetime(frame.pop("time"), errors="raise")
    frame.index = pd.DatetimeIndex(dates).to_period("M").to_timestamp()
    frame.index.name = "time"
    if frame.index.has_duplicates:
        raise ValueError("Regional data contains duplicate calendar months")
    frame = frame.sort_index()
    if frame.empty:
        raise ValueError("Regional data is empty")
    frame = frame.apply(pd.to_numeric, errors="coerce")
    # Giovanni declares -9999 and -9999.9 fill values. No interpolation.
    frame = frame.mask((frame <= -9990) | ~np.isfinite(frame))
    calendar = pd.date_range(frame.index.min(), frame.index.max(), freq="MS", name="time")
    return frame.reindex(calendar)


@lru_cache(maxsize=5)
def _read_region(region: str) -> pd.DataFrame:
    if region not in REGIONS:
        raise ValueError("Unknown region")
    path = DATA_DIR / region / "all_concat.csv"
    frame = pd.read_csv(path)
    columns = {variable.csv_column: identifier for identifier, variable in variable_catalog().items()}
    missing = set(columns).difference(frame.columns)
    if missing:
        raise ValueError("Regional data is missing required variable columns")
    return monthly_frame(frame[["time", *columns]].rename(columns=columns))


def load_region(region: str) -> pd.DataFrame:
    return _read_region(region).copy()


def list_regions() -> list[dict]:
    result = []
    for identifier, (label, climate) in REGIONS.items():
        frame = load_region(identifier)
        result.append(dict(
            id=identifier, label=label, climate=climate,
            start=frame.index.min().date().isoformat(), end=frame.index.max().date().isoformat(),
            observations=int(frame.notna().any(axis=1).sum()),
        ))
    return result


def validate_variables(variables: list[str]) -> list[str]:
    if not 1 <= len(variables) <= 5:
        raise ValueError("Choose between one and five variables")
    if len(variables) != len(set(variables)):
        raise ValueError("Each variable may only be selected once")
    if any(variable not in variable_catalog() for variable in variables):
        raise ValueError("Unknown variable")
    return variables
