from app.schemas.variable import VariableId, VariableSummary


def list_variables() -> list[VariableSummary]:
    return [
        VariableSummary(id=VariableId.TEMPERATURE, label="Average temperature"),
        VariableSummary(id=VariableId.PRECIPITATION, label="Precipitation"),
        VariableSummary(id=VariableId.HUMIDITY, label="Relative humidity"),
    ]