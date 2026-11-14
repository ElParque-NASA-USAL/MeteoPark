from fastapi import FastAPI

from app.routers import health, variables

app = FastAPI(title="El Parque")

app.include_router(health.router)
app.include_router(variables.router)