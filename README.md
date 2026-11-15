# MeteoPark

MeteoPark is an Earth trend exploration project developed by El Parque for the NASA Space Apps Challenge 2026. The repository contains a FastAPI backend, a React + TypeScript frontend, and Earth science data and analysis code under development.

## Requirements

- Python 3.12
- [uv](https://docs.astral.sh/uv/)
- Node.js and npm

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
- `GET /api/variables`

Press **Ctrl+C** in CMD to stop the server.

## Frontend

Open a **second CMD window** in the repository root and run:

```cmd
cd frontend
npm ci
npm run dev
```

Open the URL shown by Vite, normally http://localhost:5173. Press **Ctrl+C** to stop it.

## Data

The `data/` directory is reserved for dataset preparation and scientific analysis. The backend currently has no real NASA data or trend calculations.
