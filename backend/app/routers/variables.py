from fastapi import APIRouter

from app.schemas.variable import VariableSummary
from app.services.variable_service import list_variables

router = APIRouter(prefix="/api", tags=["variables"])


@router.get("/variables", response_model=list[VariableSummary])
def get_variables() -> list[VariableSummary]:
    return list_variables()