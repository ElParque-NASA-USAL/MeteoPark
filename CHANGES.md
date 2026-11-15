# Changes made

- Added an explicit study question and explanation of the five observational comparisons, clearer satellite-source attribution, and a time-series reading guide. Removed the yearly-evolution section.

- Explore now contains each region's study, findings, satellite comparisons, and all 12 variable definitions. The separate wiki and analysis pages remain for detailed reading.
- Added authentic dated NASA MODIS true-color photos and monthly NDVI maps for all five regions, with a shared legend, source URLs and image hashes.
- Added rainfall-selected regional examples, trend-sensitivity checks, and four-panel explanatory study charts. Peru's contrasting pattern is explicitly retained.
- Replaced the dark palette with a light theme and the homepage demo previews with genuine satellite observations.
- Added a root-level `launch.sh`: run `bash launch.sh` to install project dependencies using the existing uv and npm installations, then start both servers. Press Ctrl+C to stop them.

- All website labels, region metadata, documentation and console messages are in English.
- NASA Giovanni is credited on the homepage and wiki with an official portal link and an authentic portal screenshot.
- A light blue-white palette with navy text and indigo/teal accents is applied across the website and scientific plots.

The project continues to use React + TypeScript, the existing globe, and FastAPI. The original CSV files are unchanged.

- Wiki at `/wiki`: all 12 variables, with definitions, units, sources, and interpretation guidance.
- Explicit attribution and a link to [NASA Giovanni servers](https://giovanni.gsfc.nasa.gov/giovanni/) for the meteorological and land-surface data, with separate attribution to AppEEARS for the vegetation summaries.
- Analysis at `/analysis`: precipitation versus NDVI and EVI for five regions, with Pearson correlations, anomalies after removing the mean seasonal cycle, and lags of 0–3 months.
- Explorer at `/explore`: region selection and 1–5 variables, Matplotlib graphs with a separate axis for each variable, responsive images, full-size views, and PNG downloads.
- Links from the home page and between pages, plus loading, error, and retry states.

## Getting started

Extract the project and run this from its root folder using Bash on Linux, macOS or WSL:

```sh
bash launch.sh
```

The launcher uses your installed uv, prepares Python 3.12 when needed, installs the locked project dependencies, and starts both servers. Open http://localhost:5173 once Vite is ready. Press Ctrl+C to stop both servers.

Requirements: uv, Node.js 20.19+ on v20 or 22.12+, and npm. Ports 8000 and 5173 must be free. The first launch needs network access to download dependencies. Separate commands for each server, including Windows CMD instructions, are in README.md.

## Validation

- Launcher checks cover fresh dependency installation, paths containing spaces, starting from another working directory, setup and server failures, and Ctrl+C/SIGTERM cleanup of both servers and their child processes.
- 16 API and scientific processing tests, including the rainfall-only case-selection rule, detrending sensitivity and leap-year rainfall conversion.
- TypeScript and Vite build, plus oxlint checks, pass without errors. The globe retains a JavaScript bundle-size warning; it does not prevent the build.
- Chromium checks cover the wiki, selection limits, region changes, PNG downloads, analysis tables and browser back navigation, retry after a backend failure, and layouts at widths of 390 and 1440 pixels without horizontal overflow.

Verification commands are in README.md. The analysis report and 40 correlation results are in `docs/`. The results are exploratory and do not establish causality or statistical significance.
