"""Exploratory association between precipitation and vegetation, not causation."""

import numpy as np
import pandas as pd

from app.services.data_service import REGIONS, load_region


def monthly_anomalies(frame: pd.DataFrame) -> pd.DataFrame:
    return frame - frame.groupby(frame.index.month).transform("mean")


def pearson_pair(x: pd.Series, y: pd.Series) -> tuple[float | None, int]:
    pairs = pd.concat([x.rename("x"), y.rename("y")], axis=1).replace([np.inf, -np.inf], np.nan).dropna()
    count = len(pairs)
    if count < 3:
        return None, count
    # Removing climatology can leave machine-rounding noise in an otherwise
    # constant series. Treat that noise as undefined, not a real correlation.
    for column in ("x", "y"):
        values = pairs[column].to_numpy(dtype=float)
        tolerance = np.finfo(float).eps * 16 * max(1.0, float(np.abs(values).max()))
        if float(np.ptp(values)) <= tolerance:
            return None, count
    value = float(pairs["x"].corr(pairs["y"]))
    return (value if np.isfinite(value) else None), count


def analyse_frame(frame: pd.DataFrame) -> list[dict]:
    """Caller supplies an explicit, continuous monthly index (including gaps)."""
    anomaly = monthly_anomalies(frame)
    result = []
    for variable in ("ndvi", "evi"):
        lags = []
        for months in range(4):
            raw_r, count = pearson_pair(frame["precipitation"].shift(months), frame[variable])
            anomaly_r, _ = pearson_pair(anomaly["precipitation"].shift(months), anomaly[variable])
            lags.append(dict(months=months, pearson_r=raw_r, anomaly_r=anomaly_r, observations=count))
        result.append(dict(
            variable=variable, label=variable.upper(),
            pearson_r=lags[0]["pearson_r"], anomaly_r=lags[0]["anomaly_r"],
            lags=lags,
        ))
    return result


def analyse_region(region: str) -> dict:
    frame = load_region(region)
    return dict(
        region=region,
        label=REGIONS[region][0],
        start=frame.index.min().date().isoformat(),
        end=frame.index.max().date().isoformat(),
        observations=int(frame[["precipitation", "ndvi", "evi"]].notna().all(axis=1).sum()),
        results=analyse_frame(frame),
        methodology=[
            "Use the supplied all_concat.csv regional monthly averages over the common period, February 2000 to August 2025; the extra vegetation-only month is excluded.",
            "Precipitation is the supplied monthly mean rate in mm/h. NDVI and EVI are dimensionless regional means. No values are rescaled or interpolated.",
            "Calculate Pearson r on finite paired observations. Missing/fill values are excluded per pair; fewer than three pairs or a constant series gives an undefined correlation (null).",
            "Also remove each variable's calendar-month mean over the common period to calculate seasonal anomalies, then correlate these anomalies.",
            "For lag L = 0, 1, 2 or 3 calendar months, compare rainfall at month t−L with vegetation at month t. Explicit missing calendar months are retained before shifting.",
        ],
        limitations=[
            "Correlation describes association and does not establish that rain caused vegetation changes. Radiation, temperature, soils and land use can also contribute.",
            "Raw correlations can largely reflect the shared annual cycle. Anomaly correlations reduce this effect but do not remove trends or temporal autocorrelation.",
            "This is an exploratory analysis: no significance tests or causal model are fitted. Comparing several lags must not be interpreted as a validated response time.",
            "The supplied vegetation means do not include per-pixel quality flags or valid-pixel counts, so cloud and retrieval quality effects cannot be assessed here. NDVI can saturate over dense forest.",
            "Regional averages combine satellite products and a land model with different grid resolutions. They do not represent individual pixels or prove local changes throughout a region.",
        ],
    )


def precipitation_amount(frame: pd.DataFrame) -> pd.Series:
    """Estimate monthly depth from the supplied monthly mean rate (mm/h)."""
    return frame["precipitation"] * frame.index.days_in_month * 24


def detrended_anomaly_correlation(frame: pd.DataFrame, variable: str, months: int = 1) -> float | None:
    """Sensitivity check: remove a linear trend from the paired seasonal anomalies."""
    anomalies = monthly_anomalies(frame)
    pairs = pd.DataFrame({
        "rain": anomalies["precipitation"].shift(months),
        "vegetation": anomalies[variable],
        "time": np.arange(len(frame), dtype=float),
    }).replace([np.inf, -np.inf], np.nan).dropna()
    if len(pairs) < 4:
        return None
    time = pairs["time"].to_numpy()
    residuals = {}
    for column in ("rain", "vegetation"):
        values = pairs[column].to_numpy()
        residuals[column] = pd.Series(values - np.polyval(np.polyfit(time, values, 1), time))
    return pearson_pair(residuals["rain"], residuals["vegetation"])[0]


def _number(value: float | None) -> str:
    return "undefined" if value is None else f"{value:.3f}"


def _study_example(region: str, frame: pd.DataFrame) -> dict | None:
    """Choose examples from rainfall alone, using the same rule for every region."""
    rain = precipitation_amount(frame)
    climatology = rain.groupby(rain.index.month).mean().reindex(range(1, 13))
    previous = climatology.shift(1)
    previous.iloc[0] = climatology.iloc[-1]
    onset = int((climatology - previous).idxmax())
    candidates = rain[(rain.index.year >= 2015) & (rain.index.year <= 2024) & (rain.index.month == onset)].dropna()
    candidates = candidates[[date + pd.offsets.MonthBegin(1) in frame.index for date in candidates.index]]
    if candidates.empty:
        return None
    distance = (candidates - candidates.median()).abs()
    before = distance[distance <= distance.min() + 1e-9].index.min()
    after = before + pd.offsets.MonthBegin(1)
    a, b = frame.loc[before], frame.loc[after]
    values = [a["precipitation"], a["ndvi"], b["ndvi"], a["evi"], b["evi"]]
    if not np.isfinite(values).all():
        return None
    return dict(
        before=before.date().isoformat(), after=after.date().isoformat(),
        rain_mm=float(rain.loc[before]), rain_after_mm=float(rain.loc[after]),
        ndvi_before=float(a["ndvi"]), ndvi_after=float(b["ndvi"]),
        evi_before=float(a["evi"]), evi_after=float(b["evi"]),
        onset_calendar_month=onset,
        selection_note=(
            "Identify the calendar month with the largest climatological increase in monthly rainfall from the preceding month "
            "(including December to January). For that month, select the 2015–2024 year whose rainfall is closest to its median; "
            "ties within 1e-9 mm select the earlier year. Compare that rainfall-onset month with the following month. "
            "Selection uses rainfall, not the vegetation response. Rain can also fall during the following month; "
            "the observed greenness change cannot be attributed solely to the onset-month rainfall."
        ),
    )


def study_region(region: str) -> dict:
    """Regional descriptive study with seasonal, lag and trend-sensitivity checks."""
    import calendar

    frame = load_region(region)
    study = analyse_region(region)
    monthly = frame[["ndvi", "evi"]].copy()
    monthly["precipitation_mm"] = precipitation_amount(frame)
    seasonal = monthly.groupby(monthly.index.month).mean().reindex(range(1, 13))
    counts = monthly.groupby(monthly.index.month)["precipitation_mm"].count().reindex(range(1, 13), fill_value=0)
    results = {result["variable"]: result for result in study["results"]}
    ndvi, evi = results["ndvi"], results["evi"]
    rain_peak = int(seasonal["precipitation_mm"].idxmax())
    ndvi_peak = int(seasonal["ndvi"].idxmax())
    ndvi_lag = ndvi["lags"][1]
    evi_lag = evi["lags"][1]
    detrended_ndvi = detrended_anomaly_correlation(frame, "ndvi")
    detrended_evi = detrended_anomaly_correlation(frame, "evi")

    context = {
        "Niger": (
            "A delayed greening signal in the Sahel",
            "The regional monthly averages show a pronounced wet-season greening cycle. Rainfall peaks in "
            f"{calendar.month_name[rain_peak]} and average NDVI peaks in {calendar.month_name[ndvi_peak]}. "
            "This seasonal timing is consistent with vegetation greening after the rains, but it is not a causal estimate.",
        ),
        "Brazil": (
            "A wet-season recovery in the Cerrado",
            "The Cerrado study area has a strong dry-to-wet seasonal transition. Rainfall is concentrated in the austral wet season, "
            f"while average NDVI is highest in {calendar.month_name[ndvi_peak]}. Vegetation remains green after the rainfall maximum, "
            "so the two seasonal peaks should not be treated as a single fixed response time.",
        ),
        "Tanzania": (
            "Two rain-season pulses in the Serengeti",
            "The monthly climatology has rainfall pulses in March–April and November–December, rather than one simple annual maximum. "
            "Greenness rises around both wet seasons. A one-month comparison captures an association across the full record, "
            "without implying that every rain event produces the same delay.",
        ),
        "Australia": (
            "Monsoon rain followed by higher greenness",
            f"In northern Australia, average rainfall peaks in {calendar.month_name[rain_peak]} and average NDVI peaks in "
            f"{calendar.month_name[ndvi_peak]}. This regional monsoon-season sequence is consistent with delayed greening "
            "and is supported by the full-record lag comparison, not by a single photograph.",
        ),
        "Peru": (
            "The Amazon does not follow the savanna pattern",
            "The western Amazon study area stays comparatively green throughout the year. Its raw same-month rain–NDVI association "
            "is negative, while the one-month anomaly association is close to zero. These observations do not support a uniform "
            "'more rain, then more greenness' rule across all five regions.",
        ),
    }
    title, interpretation = context[region]
    example = _study_example(region, frame)
    findings = [
        dict(title=title, text=interpretation),
        dict(
            title="What remains after removing the seasons?",
            text=(
                f"NDVI's same-month Pearson r is {_number(ndvi['pearson_r'])}; comparing rainfall with NDVI one month later "
                f"gives {_number(ndvi_lag['pearson_r'])}. After subtracting each calendar month's usual values, the one-month "
                f"correlation is {_number(ndvi_lag['anomaly_r'])} over {ndvi_lag['observations']} paired months. "
                + (
                    "The contrast shows that a large part of the raw association is seasonal, and the delayed anomaly relationship is weak."
                    if region == "Peru" else
                    "The smaller anomaly correlation shows that the seasonal cycle explains part, but not all, of the raw association."
                )
            ),
        ),
        dict(
            title="Cross-check with a second vegetation index",
            text=(
                f"EVI's one-month anomaly correlation is {_number(evi_lag['anomaly_r'])}. "
                "NDVI and EVI provide complementary greenness measures from the same MODIS product; agreement is useful, "
                "but it is not an independent satellite experiment or a measurement of vegetation area."
            ),
        ),
        dict(
            title="Sensitivity to long-term trends",
            text=(
                f"Removing a fitted linear trend from the paired seasonal anomalies gives one-month correlations of "
                f"{_number(detrended_ndvi)} for NDVI and {_number(detrended_evi)} for EVI. "
                "This descriptive sensitivity check does not remove all temporal dependence or control for other environmental drivers."
            ),
        ),
    ]
    study.update(
        findings=findings,
        seasonal=dict(
            months=list(range(1, 13)),
            precipitation_mm=[float(value) if np.isfinite(value) else None for value in seasonal["precipitation_mm"]],
            ndvi=[float(value) if np.isfinite(value) else None for value in seasonal["ndvi"]],
            evi=[float(value) if np.isfinite(value) else None for value in seasonal["evi"]],
            counts=[int(value) for value in counts],
        ),
        metrics=dict(
            ndvi_same_month_r=ndvi["pearson_r"], ndvi_lag1_r=ndvi_lag["pearson_r"],
            ndvi_lag1_anomaly_r=ndvi_lag["anomaly_r"], evi_lag1_anomaly_r=evi_lag["anomaly_r"],
            ndvi_lag1_detrended_anomaly_r=detrended_ndvi,
            evi_lag1_detrended_anomaly_r=detrended_evi,
            rain_peak_month=rain_peak, ndvi_peak_month=ndvi_peak,
        ),
        example=example,
        sources=[
            dict(label="NASA Giovanni · regional meteorological series", url="https://giovanni.gsfc.nasa.gov/giovanni/"),
            dict(label="GPM IMERG precipitation", url="https://gpm.nasa.gov/data/imerg"),
            dict(label="MODIS MOD13A3 Collection 6.1 · NDVI and EVI", url="https://lpdaac.usgs.gov/products/mod13a3v061/"),
        ],
    )
    if region == "Peru" and example:
        findings[2]["text"] += (
            f" In the rainfall-selected {pd.Timestamp(example["before"]).strftime("%B %Y")} example, "
            f"NDVI changes from {example["ndvi_before"]:.3f} to {example["ndvi_after"]:.3f}, "
            f"while EVI falls from {example["evi_before"]:.3f} to {example["evi_after"]:.3f}. "
            "This disagreement is another reason to avoid presenting every region as a greening success story."
        )
    study["methodology"] += [
        "Estimate each month's rainfall depth in mm as the supplied monthly mean rate in mm/h multiplied by 24 and the actual number of days in that month, including leap years. Seasonal plots average these monthly amounts by calendar month; correlation calculations continue to use the original rate.",
        "Use a fixed one-month rain lead as a common cross-region comparison, while displaying all leads from zero to three months; do not select the largest correlation as a confirmed response time.",
        "For a trend-sensitivity check, fit and remove a linear time trend separately from the finite paired rainfall and vegetation seasonal anomalies, then correlate their residuals.",
    ]
    study["limitations"] += [
        "No uncertainty interval or statistical significance claim is reported: temporal autocorrelation, several lag comparisons and data quality need explicit treatment before confirmatory inference.",
        "Satellite photographs provide dated visual context. Cloud cover, atmospheric conditions, viewing geometry and image rendering can change apparent greenness; a selected before/after image pair cannot prove a rainfall effect.",
    ]
    return study
