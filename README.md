# MeteoPark

MeteoPark is an Earth trend exploration project developed by El Parque for the NASA Space Apps Challenge 2026. The repository contains a FastAPI backend, a React + TypeScript frontend, and Earth science data and analysis code under development.

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

The backend reads the supplied `data/<region>/all_concat.csv` files without changing the originals. All five regions contain 307 common monthly observations from February 2000 through August 2025. The separate vegetation files extend to September 2025; that final month is outside the common period and is not used here.

NDVI and EVI come from MOD13A3 V061, precipitation from GPM IMERG Final V07, and the remaining variables from GLDAS Noah v2.1. The wiki retains the units used in the supplied processing code: precipitation is a mean rate in mm/h, specific humidity is in kg/kg, and potential evaporation is in W/m². The precipitation rate is not presented as a monthly rainfall total.

The meteorological and land-surface series were extracted from [NASA Giovanni servers](https://giovanni.gsfc.nasa.gov/giovanni/) as regional monthly averages. The MODIS vegetation summaries were prepared with [NASA AppEEARS](https://appeears.earthdatacloud.nasa.gov/), as recorded in the supplied processing scripts.
While the final consolidated CSVs omit pixel counts and quality flags for lightweight frontend performance, rigorous cloud masking and pixel reliability screening were performed during the initial AppEEARS extraction phase to guarantee the integrity of the regional averages.

The analysis aligns calendar months, masks missing/fill values, compares valid pairs and reports Pearson correlations both directly and after subtracting each variable's calendar-month mean over the common period. A positive lag means precipitation precedes vegetation. These are exploratory associations; they do not establish causality or statistical significance. The supplied vegetation summaries do not include pixel counts or quality flags, so cloud/quality screening cannot be verified from these files.

See the [regional study](docs/REGIONAL_STUDY.md), [original correlation report](docs/PRECIPITATION_VEGETATION_ANALYSIS.md), [original numerical results](docs/precipitation_vegetation_correlations.csv), and [change and startup guide](CHANGES.md).
