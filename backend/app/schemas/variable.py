from enum import Enum

from pydantic import BaseModel


class VariableId(str, Enum):
    TEMPERATURE = "temperature"
    PRECIPITATION = "precipitation"
    HUMIDITY = "humidity"


class VariableSummary(BaseModel):
    id: VariableId
    label: str