"""Reproduce the regional study report and tables from the supplied CSV files.

From backend/: uv run --no-dev python ../docs/export_regional_study.py
"""

import csv
import json
import sys
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_DIR / "backend"))

from app.services.analysis_service import analyse_frame, study_region
from app.services.data_service import load_region


def main():
    studies = [study_region(region) for region in ("Niger", "Brazil", "Tanzania", "Australia", "Peru")]
    output = PROJECT_DIR / "docs"
    (output / "regional_study_results.json").write_text(json.dumps(studies, indent=2, allow_nan=False) + "\n")
    columns = ["region", "ndvi_lag1_raw_r", "ndvi_lag1_anomaly_r", "ndvi_lag1_detrended_anomaly_r", "evi_lag1_anomaly_r", "evi_lag1_detrended_anomaly_r", "paired_months"]
    with (output / "regional_study_metrics.csv").open("w", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=columns)
        writer.writeheader()
        for study in studies:
            metrics = study["metrics"]
            writer.writerow({
                "region": study["region"],
                "ndvi_lag1_raw_r": metrics["ndvi_lag1_r"],
                "ndvi_lag1_anomaly_r": metrics["ndvi_lag1_anomaly_r"],
                "ndvi_lag1_detrended_anomaly_r": metrics["ndvi_lag1_detrended_anomaly_r"],
                "evi_lag1_anomaly_r": metrics["evi_lag1_anomaly_r"],
                "evi_lag1_detrended_anomaly_r": metrics["evi_lag1_detrended_anomaly_r"],
                "paired_months": study["results"][0]["lags"][1]["observations"],
            })

    report = [
        "# Regional rainfall–vegetation study", "",
        "## Question and design", "",
        "Does rainfall precede higher vegetation greenness, and does the association remain after accounting for the seasonal cycle? This descriptive study uses the five supplied regional CSV records: 307 consecutive calendar months per region, February 2000 through August 2025. The study boxes represent selected areas, not entire countries. No original observations were removed or modified.", "",
        "Precipitation is the GPM IMERG Final V07 mean rain rate in mm/h. Seasonal and example plots estimate monthly rainfall depth by multiplying the rate by 24 and the actual number of days in each month. Correlations retain the original mean rain rate for consistency with the original analysis. MOD13A3 NDVI and EVI are dimensionless regional greenness summaries.", "",
        "We compare rainfall in month t−L with vegetation in month t for L=0,1,2,3. Monthly anomalies subtract each variable's mean for its calendar month. A sensitivity check removes separate fitted linear trends from the valid paired anomaly series. This helps distinguish seasonal and long-term patterns from the remaining association, but does not eliminate all temporal dependence or environmental confounding. EVI is a complementary index from the same MODIS instrument, not an independent experiment.", "",
        "## Full-record comparison: rainfall leading by one month", "",
        "| Region | NDVI raw r | NDVI anomaly r | NDVI detrended anomaly r | EVI anomaly r | Paired months |",
        "|---|---:|---:|---:|---:|---:|",
    ]
    for study in studies:
        m = study["metrics"]
        count = study["results"][0]["lags"][1]["observations"]
        report.append(f"| {study['label']} | {m['ndvi_lag1_r']:.3f} | {m['ndvi_lag1_anomaly_r']:.3f} | {m['ndvi_lag1_detrended_anomaly_r']:.3f} | {m['evi_lag1_anomaly_r']:.3f} | {count} |")
    report += ["", "The four savanna and semi-arid study areas retain positive delayed anomaly associations. The western Amazon comparison is near zero after removing seasonality. This regional contrast prevents a uniform causal claim that rainfall always produces higher greenness the following month.", "", "## Regional findings", ""]

    manifest = json.loads((PROJECT_DIR / "frontend/src/data/satellite_evidence.json").read_text())
    for study in studies:
        report += [f"### {study['label']}", ""]
        for finding in study["findings"]:
            report += [f"**{finding['title']}.** {finding['text']}", ""]
        e = study["example"]
        report += [
            f"**Dated comparison: {e['before'][:7]} → {e['after'][:7]}.** The dates are selected by rainfall onset rather than by choosing the largest vegetation increase.", "",
            "| Observation | Rainfall-onset month | Following month |", "|---|---:|---:|",
            f"| Estimated rainfall (mm) | {e['rain_mm']:.1f} | {e['rain_after_mm']:.1f} |",
            f"| NDVI | {e['ndvi_before']:.3f} | {e['ndvi_after']:.3f} |",
            f"| EVI | {e['evi_before']:.3f} | {e['evi_after']:.3f} |", "",
            "Both months can receive rain. The comparison cannot attribute the vegetation change specifically to the first month's precipitation.", "",
        ]
        imagery = manifest["regions"].get(study["region"])
        if imagery:
            report += [f"NASA Worldview: [first month's NDVI map]({imagery['before']['ndvi']['worldview_url']}) and [following month's NDVI map]({imagery['after']['ndvi']['worldview_url']}). {imagery.get('visual_note', '')}", ""]

    report += [
        "## Reproducible example and image selection", "",
        studies[0]["example"]["selection_note"], "",
        "The matching monthly MODIS NDVI composites use identical bounding boxes and the same unmodified NASA color scale. Genuine daily Terra/MODIS true-color scenes provide landscape context. Their exact acquisition dates are printed; scenes were selected for visibility from fixed candidate days within each selected month. Clouds, haze and viewing conditions affect photographs, so apparent photo color is not used as a quantitative greenness measurement.", "",
        "Numeric NDVI/EVI differences come from the supplied CSV summaries, not from reading colors off browse images. All source URLs, acquisition dates, geographic extents and SHA-256 hashes are recorded in `frontend/src/data/satellite_evidence.json`. Run `python docs/fetch_satellite_images.py` to verify or retrieve the stored NASA assets. A photographed example is an illustration, while the full-period comparisons provide the broader quantitative context.", "",
        "## Quality and sensitivity", "",
        "The common CSVs have no missing months, but do not include pixel-quality flags or valid-pixel counts. Unusually low initial NDVI observations occur in February 2000 in Peru and Australia. Their cause cannot be established from these summaries. As a sensitivity check, remove only that first month, recompute monthly anomalies, and compare the one-month NDVI association:", "",
        "| Region | All months: lag-1 anomaly r | Excluding February 2000 |", "|---|---:|---:|",
    ]
    for region in ("Peru", "Australia"):
        frame = load_region(region)
        full = analyse_frame(frame)[0]["lags"][1]["anomaly_r"]
        sensitivity = analyse_frame(frame.iloc[1:])[0]["lags"][1]["anomaly_r"]
        report.append(f"| {region} | {full:.3f} | {sensitivity:.3f} |")
    report += [
        "", "The regional interpretation remains the same in this sensitivity check; the published main study retains all original observations. Other outliers, cloud effects, mixed land cover and differences in spatial resolution remain limitations. Monthly spatial averages cannot describe every pixel. Dense-canopy NDVI saturation, radiation, water availability, land use and temperature are plausible influences to investigate, not established explanations for a particular finding.", "",
        "These are exploratory associations, without causal identification or statistical-significance claims. Several lags are compared; selecting the largest correlation does not confirm a response time. Temporal autocorrelation and multiple comparisons have not been corrected by a confirmatory inference procedure.", "",
        "## Sources and reproduction", "",
        "- [NASA Giovanni](https://giovanni.gsfc.nasa.gov/giovanni/): supplied meteorological and land-surface exports.",
        "- [NASA GPM IMERG](https://gpm.nasa.gov/data/imerg): precipitation product.",
        "- [NASA MOD13A3 V061](https://lpdaac.usgs.gov/products/mod13a3v061/) and [AppEEARS](https://appeears.earthdatacloud.nasa.gov/): vegetation summaries.",
        "- [NASA GIBS API documentation](https://nasa-gibs.github.io/gibs-api-docs/): authentic imagery retrieval.",
        "- [NASA: Measuring Vegetation](https://science.nasa.gov/earth/earth-observatory/measuring-vegetation-ndvi-evi/): index interpretation and cloud limitations.", "",
        "Reproduce this report, JSON results and cross-region CSV from the project sources:", "", "```sh", "cd backend", "uv run --no-dev python ../docs/export_regional_study.py", "```", "",
        "The website presents these findings directly in Explore. The separate analysis and wiki routes remain available for detailed reading.", "",
    ]
    (output / "REGIONAL_STUDY.md").write_text("\n".join(report))
    print("Exported five regional studies, metrics, dated examples and the report.")


if __name__ == "__main__":
    main()
