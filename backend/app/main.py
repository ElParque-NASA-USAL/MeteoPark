from fastapi import FastAPI

from app.routers import exploration, health, variables

app = FastAPI(title="MeteoPark", description="Regional Earth data, variable wiki and exploratory rainfall–vegetation analysis")

app.include_router(health.router)
app.include_router(variables.router)
app.include_router(exploration.router)
