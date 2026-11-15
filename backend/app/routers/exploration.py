from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Response

from app.services.analysis_service import analyse_region, study_region
from app.services.data_service import REGIONS, list_regions, validate_variables
from app.services.plot_service import analysis_png, study_png, time_series_png

router = APIRouter(prefix="/api", tags=["exploration"])


def _region(region: str) -> str:
    if region not in REGIONS:
        raise HTTPException(status_code=422, detail="Unknown region")
    return region


@router.get("/regions")
def get_regions() -> list[dict]:
    return list_regions()


@router.get("/plot", responses={200: {"content": {"image/png": {}}}}, response_class=Response)
def get_plot(region: str, variables: Annotated[list[str], Query(min_length=1, max_length=5)]) -> Response:
    _region(region)
    try:
        validate_variables(variables)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    return Response(content=time_series_png(region, variables), media_type="image/png")


@router.get("/analysis")
def get_analysis(region: str) -> dict:
    return analyse_region(_region(region))


@router.get("/analysis/plot", responses={200: {"content": {"image/png": {}}}}, response_class=Response)
def get_analysis_plot(region: str) -> Response:
    return Response(content=analysis_png(_region(region)), media_type="image/png")


@router.get("/study")
def get_study(region: str) -> dict:
    return study_region(_region(region))


@router.get("/study/plot", responses={200: {"content": {"image/png": {}}}}, response_class=Response)
def get_study_plot(region: str) -> Response:
    return Response(content=study_png(_region(region)), media_type="image/png")
