"""Readable light-theme PNG evidence plots generated with the Agg renderer."""

import calendar
from io import BytesIO
from threading import Lock

import matplotlib.dates as mdates
import numpy as np
import pandas as pd
from matplotlib.backends.backend_agg import FigureCanvasAgg
from matplotlib.figure import Figure

from app.services.analysis_service import monthly_anomalies, pearson_pair, precipitation_amount, study_region
from app.services.data_service import REGIONS, load_region, validate_variables
from app.services.variable_service import variable_catalog

_RENDER_LOCK = Lock()
_BACKGROUND = "#ffffff"
_TEXT = "#203449"
_MUTED = "#627387"
_RAIN = "#418bc4"
_NDVI = "#278364"
_EVI = "#9463a6"
_COLORS = [_RAIN, _NDVI, _EVI, "#bf7b32", "#6578b7"]


def _axis_style(ax):
    ax.set_facecolor(_BACKGROUND)
    ax.tick_params(colors=_MUTED, labelsize=9)
    ax.xaxis.label.set_color(_TEXT)
    ax.yaxis.label.set_color(_TEXT)
    ax.title.set_color(_TEXT)
    for spine in ax.spines.values():
        spine.set_color("#d9e2e8")
    ax.spines["top"].set_visible(False)
    ax.grid(True, alpha=0.8, color="#e8eef2", linewidth=0.7)
    ax.set_axisbelow(True)


def _legend(ax, **kwargs):
    return ax.legend(frameon=False, fontsize=8, labelcolor=_TEXT, **kwargs)


def _png(figure: Figure) -> bytes:
    output = BytesIO()
    FigureCanvasAgg(figure).print_png(output)
    figure.clear()
    return output.getvalue()


def time_series_png(region: str, variables: list[str]) -> bytes:
    """Keep original units and add a running mean without hiding monthly data."""
    validate_variables(variables)
    frame = load_region(region)
    catalog = variable_catalog()
    with _RENDER_LOCK:
        figure = Figure(figsize=(10, 1.1 + 2.2 * len(variables)), dpi=150, facecolor=_BACKGROUND, layout="constrained")
        axes = figure.subplots(nrows=len(variables), ncols=1, sharex=True, squeeze=False)
        for index, identifier in enumerate(variables):
            variable = catalog[identifier]
            ax = axes[index, 0]
            color = _COLORS[index]
            ax.plot(frame.index, frame[identifier], color=color, linewidth=0.65, alpha=0.38, label="Monthly observation")
            ax.plot(frame.index, frame[identifier].rolling(12, min_periods=12, center=True).mean(), color=color, linewidth=1.7, label="12-month running mean")
            ax.set_title(variable.label, loc="left", fontsize=11, pad=8, color=_TEXT, fontweight="bold")
            ax.set_ylabel(variable.unit, fontsize=10)
            _axis_style(ax)
            if index == 0:
                _legend(ax, loc="upper left", ncol=2)
        axes[-1, 0].xaxis.set_major_locator(mdates.YearLocator(5))
        axes[-1, 0].xaxis.set_major_formatter(mdates.DateFormatter("%Y"))
        axes[-1, 0].set_xlabel("Year · original units on separate axes")
        figure.suptitle(f"{REGIONS[region][0]} · monthly observations and long-term context", color=_TEXT, fontsize=13)
        return _png(figure)


def _seasonal_panel(ax, study):
    season = study["seasonal"]
    months = np.array(season["months"])
    _axis_style(ax)
    bars = ax.bar(months, season["precipitation_mm"], color=_RAIN, alpha=0.6, width=0.7)
    ax.set_ylabel("Estimated rainfall (mm/month)", color=_RAIN, fontsize=9)
    ax.set_xticks(months, [calendar.month_abbr[month][0] for month in months])
    ax.set_xlabel("Calendar month · average over the full record", fontsize=9)
    ax.set_title("A · When does the region green up?", loc="left", color=_TEXT, fontsize=11, pad=12, fontweight="bold")
    vegetation = ax.twinx()
    _axis_style(vegetation)
    vegetation.grid(False)
    ndvi, = vegetation.plot(months, season["ndvi"], color=_NDVI, linewidth=2, marker="o", markersize=3)
    evi, = vegetation.plot(months, season["evi"], color=_EVI, linewidth=1.6, marker="s", markersize=2.5)
    vegetation.set_ylabel("Vegetation index (unitless)", fontsize=9)
    vegetation.set_ylim(0, min(1.05, max(max(season["ndvi"]), max(season["evi"])) * 1.2))
    ax.legend([bars, ndvi, evi], ["Rainfall", "NDVI", "EVI"], frameon=False, fontsize=8, labelcolor=_TEXT, loc="upper left", ncol=3)


def _lag_panel(ax, study):
    _axis_style(ax)
    ndvi, evi = study["results"]
    leads = [lag["months"] for lag in ndvi["lags"]]
    ax.plot(leads, [lag["pearson_r"] for lag in ndvi["lags"]], color="#8a9baa", linestyle="--", linewidth=1.5, marker="o", markersize=3, label="NDVI · raw")
    ax.plot(leads, [lag["anomaly_r"] for lag in ndvi["lags"]], color=_NDVI, linewidth=2, marker="o", markersize=4, label="NDVI · anomalies")
    ax.plot(leads, [lag["anomaly_r"] for lag in evi["lags"]], color=_EVI, linewidth=1.8, marker="s", markersize=3, label="EVI · anomalies")
    ax.axhline(0, color="#73879a", linewidth=0.8)
    ax.set_ylim(-1, 1)
    ax.set_xticks(leads)
    ax.set_xlabel("Rainfall lead (months before vegetation)", fontsize=9)
    ax.set_ylabel("Pearson correlation r", fontsize=9)
    ax.set_title("B · Is the relationship more than seasonal?", loc="left", color=_TEXT, fontsize=11, pad=12, fontweight="bold")
    _legend(ax, loc="lower right")


def _anomaly_panel(ax, frame):
    _axis_style(ax)
    anomalies = monthly_anomalies(frame)
    pairs = pd.DataFrame({"rain": anomalies["precipitation"].shift(1), "ndvi": anomalies["ndvi"]}).dropna()
    ax.scatter(pairs["rain"], pairs["ndvi"], s=14, alpha=0.45, color=_NDVI, edgecolors="none")
    r, count = pearson_pair(pairs["rain"], pairs["ndvi"])
    if len(pairs) > 2 and pairs["rain"].std() > 0:
        x = np.array([pairs["rain"].min(), pairs["rain"].max()])
        slope, intercept = np.polyfit(pairs["rain"], pairs["ndvi"], 1)
        ax.plot(x, slope * x + intercept, color=_NDVI, linestyle="--", linewidth=1.3)
    ax.axhline(0, color="#899ba8", linewidth=0.7)
    ax.axvline(0, color="#899ba8", linewidth=0.7)
    r_text = "undefined" if r is None else f"{r:.3f}"
    ax.text(0.03, 0.97, f"r = {r_text} · {count} paired months\nDashed line: descriptive linear fit", transform=ax.transAxes, color=_TEXT, fontsize=8, va="top", bbox=dict(facecolor="white", edgecolor="none", alpha=0.85))
    ax.set_xlabel("Previous-month rainfall anomaly (mm/h)", fontsize=9)
    ax.set_ylabel("Current-month NDVI anomaly (unitless)", fontsize=9)
    ax.set_title("C · Unusually wet months, later greenness", loc="left", color=_TEXT, fontsize=11, pad=12, fontweight="bold")


def _example_panel(ax, frame, study):
    _axis_style(ax)
    example = study["example"]
    if example:
        before, after = pd.Timestamp(example["before"]), pd.Timestamp(example["after"])
        window = frame.loc[before - pd.offsets.MonthBegin(5):before + pd.offsets.MonthBegin(6)]
        title = f"D · Dated example: {before:%b %Y} to {after:%b %Y}"
    else:
        full_years = frame.groupby(frame.index.year).size()
        year = int(full_years[full_years == 12].index.max())
        window = frame[frame.index.year == year]
        title = f"D · Recent complete year: {year}"
    x = np.arange(len(window))
    ax.bar(x, precipitation_amount(window), color=_RAIN, alpha=0.55, width=0.65)
    ax.set_ylabel("Estimated rainfall (mm/month)", color=_RAIN, fontsize=9)
    ax.set_xticks(x[::2], [date.strftime("%b\n%Y") for date in window.index[::2]], fontsize=8)
    ax.set_xlabel("Dated illustration · not a causal experiment", fontsize=9)
    vegetation = ax.twinx()
    _axis_style(vegetation)
    vegetation.grid(False)
    vegetation.plot(x, window["ndvi"], color=_NDVI, linewidth=2, marker="o", markersize=3)
    vegetation.set_ylabel("NDVI (unitless)", color=_NDVI, fontsize=9)
    vegetation.set_ylim(0, min(1.05, float(window["ndvi"].max()) * 1.2))
    if example:
        for date, color in ((before, _RAIN), (after, _NDVI)):
            if date in window.index:
                position = window.index.get_loc(date)
                ax.axvspan(position - 0.45, position + 0.45, color=color, alpha=0.1)
    ax.set_title(title, loc="left", color=_TEXT, fontsize=11, pad=12, fontweight="bold")


def study_png(region: str) -> bytes:
    """Four complementary views of the complete regional descriptive study."""
    frame, study = load_region(region), study_region(region)
    with _RENDER_LOCK:
        figure = Figure(figsize=(10, 8.2), dpi=150, facecolor=_BACKGROUND, layout="constrained")
        axes = figure.subplots(2, 2)
        _seasonal_panel(axes[0, 0], study)
        _lag_panel(axes[0, 1], study)
        _anomaly_panel(axes[1, 0], frame)
        _example_panel(axes[1, 1], frame, study)
        figure.suptitle(f"{REGIONS[region][0]} · rainfall and vegetation evidence\nFebruary 2000–August 2025 · descriptive associations, not causation", color=_TEXT, fontsize=13)
        return _png(figure)


def analysis_png(region: str) -> bytes:
    """Retain the original endpoint while improving its evidence visualization."""
    return study_png(region)
