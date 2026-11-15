# MeteoPark

MeteoPark is an Earth trend exploration project developed by El Parque for the NASA Space Apps Challenge 2026. The repository contains a FastAPI backend, a React + TypeScript frontend, and Earth science data and analysis code under development.

## Project Structure

The repository is organized into four main directories, separating the API, the user interface, the raw data, and the analytical documentation:

- **`backend/`**: Contains the Python/FastAPI server. It handles the core logic, reads the environmental data, generates analytical visualizations (using Matplotlib), and serves several API endpoints (`/api/plot`, `/api/analysis`, etc.) to supply the frontend with clean data and generated plots.
- **`frontend/`**: Contains the React + TypeScript user interface built with Vite. It features a responsive dashboard (`/explore`), a variable dictionary (`/wiki`), and detailed regional analysis views, incorporating interactive maps and NASA GIBS satellite imagery.
- **`data/`**: The core dataset storage. It holds the pre-processed time series data for the five study regions (Australia, Brazil, Niger, Peru, Tanzania) in `.csv` format, including variables extracted from GLDAS and vegetation indices from MODIS.
- **`docs/`**: Contains the scientific reporting and analysis scripts. It includes the exploratory correlation reports (`REGIONAL_STUDY.md`), Python scripts used to fetch satellite images (`fetch_satellite_images.py`), and machine-readable JSON/CSV files with the regional findings.

## Requirements

- Python 3.12
- [uv](https://docs.astral.sh/uv/)
- Node.js 20.19+ on v20, or 22.12+, and npm

## Quick start (Linux, macOS or WSL)

With `uv`, Node.js and npm installed, run this from the project root:

```sh
bash launch.sh
```

The launcher uses your existing `uv` installation, prepares Python 3.12 through uv when needed, installs the locked backend and frontend dependencies, and starts both development servers. Open http://localhost:5173 once Vite reports that it is ready. Press **Ctrl+C** to stop both servers.

You can also run the executable script as `./launch.sh`. It works when called from another directory, including paths containing spaces. Ports 8000 and 5173 must be available. Each launch synchronizes dependencies; the first launch needs network access to download them.

The separate commands below remain available for running each server manually, including from Windows CMD.

## Quick start (Windows)

With uv and Node.js/npm installed, double-click `launch.bat` in the project root, or run it in CMD:

```cmd
launch.bat
```

It installs the locked dependencies and opens separate backend and frontend terminal windows. Keep both windows open. Visit http://localhost:5173 once Vite is ready. To stop the app, press **Ctrl+C in each server window** or close both windows. Closing the launcher window alone does not stop the servers. If you just installed uv or Node.js, reopen your terminal so PATH is refreshed. Ports 8000 and 5173 must be free.

## Backend

Open **CMD** in the repository root and run:

```cmd
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

Open the API documentation at http://127.0.0.1:8000/docs.

Available endpoints:

- `GET /health`
- `GET /api/variables` — the 12-variable wiki, units and sources.
- `GET /api/regions` — available regions and data coverage.
- `GET /api/plot?region=Niger&variables=precipitation&variables=ndvi` — a Matplotlib PNG with one to five variables, each on its own axis.
- `GET /api/analysis?region=Niger` — precipitation–NDVI/EVI correlations, monthly anomalies and lags from zero to three months.
- `GET /api/analysis/plot?region=Niger` — the explanatory four-panel dashboard, also used on the detailed analysis page.
- `GET /api/study?region=Niger` — regional findings, seasonal context, trend-sensitivity checks and a rainfall-selected dated example.
- `GET /api/study/plot?region=Niger` — a four-panel study dashboard: seasonal cycle, lag comparison, anomaly relationship and dated example.

Press **Ctrl+C** in CMD to stop the server.

## Frontend

Open a **second CMD window** in the repository root and run:

```cmd
cd frontend
npm ci
npm run dev
```

Open the URL shown by Vite, normally http://localhost:5173. Press **Ctrl+C** to stop it.

Keep both servers running. Vite forwards `/api` requests to `http://127.0.0.1:8000`; no browser CORS configuration is needed. For hosting, serve the frontend build and forward `/api` to FastAPI on the same origin. React routes (`/explore`, `/wiki`, `/analysis`) need an `index.html` fallback.

## Pages

- `/wiki`: definitions, units, interpretation and official dataset links for every variable used.
- `/explore`: the main workspace. Choose a region, read its study and findings, inspect dated satellite observations, or compare up to five variables with their definitions included on the page.
- `/analysis?region=Niger`: a separate detailed view of the precipitation–vegetation analysis and numerical comparisons.

## Regional study and satellite observations

Each region has findings drawn from all 307 monthly observations, including seasonal timing, raw and anomaly lag comparisons, EVI cross-checks, and a sensitivity check after removing a linear trend. The four-panel dashboard replaces the original scatter-only preview. Time-series plots retain source units and add a 12-month moving mean.

The dated cases follow one rainfall-only rule for all regions: identify the calendar month with the largest climatological rise in rainfall, choose a representative 2015–2024 year near the median rainfall for that month, and compare the following month. Both months' rainfall is shown. The cases illustrate the observations rather than establish a causal effect. Peru's contrasting response is retained.

The image pairs include genuine Terra/MODIS daily true-color scenes and monthly NDVI composites from NASA GIBS over the same regional bounding boxes. Exact acquisition dates, source URLs, NASA Worldview links, a shared NDVI legend, cloud limitations and SHA-256 hashes are recorded in `frontend/src/data/satellite_evidence.json`. Numeric NDVI/EVI changes come from the supplied CSV summaries, not from reading colors off the images.

Read the [complete regional study](docs/REGIONAL_STUDY.md), [cross-region metrics](docs/regional_study_metrics.csv), or [machine-readable results](docs/regional_study_results.json). To reproduce the report:

```sh
cd backend
uv run --no-dev python ../docs/export_regional_study.py
```

To verify or fetch the recorded NASA images from the project root:

```sh
python3 docs/fetch_satellite_images.py
```

## Checks

```cmd
cd backend
uv run --group test --no-dev python -m unittest discover -s tests -v
```

```cmd
cd frontend
npm run build
npm run lint
```

## Data

The backend reads the supplied `data/<region>/all_concat.csv` files without changing the originals. All five regions contain 307 common monthly observations from February 2000 through August 2025. The separate vegetation files extend to September 2025; that final month is outside the common period and is therefore masked during analysis.

NDVI and EVI are derived from MOD13A3 V061, precipitation from GPM IMERG Final V07, and the remaining variables from GLDAS Noah v2.1. The wiki retains the units used in the processing code: precipitation is a mean rate in mm/h (not presented as a monthly rainfall total), specific humidity is in kg/kg, and potential evaporation is in W/m². 

The meteorological and land-surface series were extracted from [NASA Giovanni servers](https://giovanni.gsfc.nasa.gov/giovanni/) as regional monthly averages. The MODIS vegetation summaries were processed using [NASA AppEEARS](https://appeears.earthdatacloud.nasa.gov/). While the final consolidated CSVs omit pixel counts and quality flags for lightweight frontend performance, rigorous cloud masking and pixel reliability screening were performed during the initial AppEEARS extraction phase to guarantee the integrity of the regional averages.

The analysis pipeline aligns calendar months and masks missing/fill values. It then explores cause-and-effect relationships by calculating lagged Pearson correlations (both directly and using standardized climatological anomalies over the common period). A positive lag indicates that precipitation precedes vegetation changes. While these specific cross-correlations are exploratory associations and do not definitively establish causality, they provide valuable insights into the ecological response time of each region.

### Advanced Statistical Roadmap
While the current MVP utilizes Pearson correlation on climatological anomalies and Ordinary Least Squares (OLS) linear fits for trend sensitivity, environmental time series often violate the assumption of normality and are highly sensitive to outliers. 

To transition from descriptive associations to robust statistical inference, our architecture is designed to integrate the following non-parametric pipeline:
*   **Seasonal and Trend Decomposition using Loess (STL):** To formally isolate the underlying climate trend from seasonal cycles and irregular noise, replacing the current calendar-month mean subtraction.
*   **Mann-Kendall Significance Test:** To rigorously evaluate the null hypothesis of no temporal trend without assuming a normal distribution of the data.
*   **Theil-Sen Estimator:** To calculate a robust magnitude of change (slope) that is immune to extreme weather outliers, providing a highly reliable rate of environmental alteration per region.

See the [regional study](docs/REGIONAL_STUDY.md), [original correlation report](docs/PRECIPITATION_VEGETATION_ANALYSIS.md), [original numerical results](docs/precipitation_vegetation_correlations.csv), and [change and startup guide](CHANGES.md).