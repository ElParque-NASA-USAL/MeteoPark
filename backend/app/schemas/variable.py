from enum import Enum

from pydantic import BaseModel


class VariableId(str, Enum):
    NDVI = "ndvi"
    EVI = "evi"
    PRECIPITATION = "precipitation"
    SOIL_MOISTURE = "soil_moisture"
    ROOT_MOISTURE = "root_moisture"
    TEMPERATURE = "temperature"
    SPECIFIC_HUMIDITY = "specific_humidity"
    SHORTWAVE_RADIATION = "shortwave_radiation"
    EVAPOTRANSPIRATION = "evapotranspiration"
    POTENTIAL_EVAPORATION = "potential_evaporation"
    SURFACE_RUNOFF = "surface_runoff"
    WIND_SPEED = "wind_speed"


class VariableSummary(BaseModel):
    id: VariableId
    label: str
    unit: str
    description: str
    source: str
    source_url: str
    resolution: str
    interpretation: str
    csv_column: str
