"""The variables actually present in the supplied regional CSV files."""

from app.schemas.variable import VariableSummary

GLDAS_URL = "https://hydro1.gesdisc.eosdis.nasa.gov/data/GLDAS/GLDAS_NOAH025_M.2.1/doc/README_GLDAS2.pdf"
MODIS_URL = "https://lpdaac.usgs.gov/products/mod13a3v061/"
GPM_URL = "https://gpm.nasa.gov/data/imerg"


def _gldas(identifier, label, unit, column, description, interpretation):
    return dict(
        id=identifier, label=label, unit=unit, csv_column=column,
        description=description, interpretation=interpretation,
        source="GLDAS Noah 2.1, exported with NASA Giovanni",
        source_url=GLDAS_URL, resolution="Monthly; 0.25° model grid, regional average",
    )


VARIABLES = [
    dict(
        id="ndvi", label="NDVI", unit="unitless", csv_column="NDVI_Mean",
        description="Normalized Difference Vegetation Index: (near infrared − red) / (near infrared + red). The CSV contains the regional mean.",
        source="MODIS Terra MOD13A3 Collection 6.1, processed with AppEEARS",
        source_url=MODIS_URL, resolution="Monthly; 1 km satellite product, regional average",
        interpretation="Higher values generally indicate greener vegetation. Dense canopies can saturate the index. Clouds and pixel quality can affect regional means; this is not a direct biomass measurement.",
    ),
    dict(
        id="evi", label="EVI", unit="unitless", csv_column="EVI_Mean",
        description="Enhanced Vegetation Index, using near infrared, red and blue bands to reduce background and atmospheric effects. The CSV contains the regional mean.",
        source="MODIS Terra MOD13A3 Collection 6.1, processed with AppEEARS",
        source_url=MODIS_URL, resolution="Monthly; 1 km satellite product, regional average",
        interpretation="Higher values generally indicate greener vegetation. EVI is useful alongside NDVI in dense vegetation, but still depends on observation quality and is not a direct biomass measurement.",
    ),
    dict(
        id="precipitation", label="Precipitation", unit="mm/h", csv_column="GPM_3IMERGM_07_precipitation",
        description="Merged satellite and rain-gauge precipitation estimate, IMERG V07 Final Run, averaged over the selected region.",
        source="GPM IMERG V07 Final Run, exported with NASA Giovanni",
        source_url=GPM_URL, resolution="Monthly; 0.1° satellite/gauge product, regional average",
        interpretation="This is the monthly mean precipitation rate, not an accumulated monthly total. A total in mm would require multiplying the rate by the actual number of hours in that month.",
    ),
    _gldas("soil_moisture", "Soil moisture (0–10 cm)", "kg/m²", "mean_GLDAS_NOAH025_M_2_1_SoilMoi0_10cm_inst",
           "Water stored in the upper 10 cm of soil, represented as mass per unit ground area.",
           "Describes near-surface water availability. 1 kg/m² of water is equivalent to a 1 mm water layer; this is not volumetric soil moisture or a percentage."),
    _gldas("root_moisture", "Root-zone soil moisture", "kg/m²", "GLDAS_NOAH025_M_2_1_RootMoist_inst",
           "Modelled water stored in the root zone, represented as mass per unit ground area.",
           "Provides context for water accessible to vegetation below the surface. Model layer depth and vegetation assumptions affect interpretation."),
    _gldas("temperature", "Air temperature", "K", "GLDAS_NOAH025_M_2_1_Tair_f_inst",
           "Near-surface air temperature used by the GLDAS land model.",
           "Values remain in the supplied Kelvin units. Subtract 273.15 to convert to degrees Celsius."),
    _gldas("specific_humidity", "Specific humidity", "kg/kg", "GLDAS_NOAH025_M_2_1_Qair_f_inst",
           "Mass of water vapour per unit mass of moist near-surface air.",
           "This is specific humidity, not relative humidity. Multiply by 1000 for g/kg; it should not be displayed as a percentage of saturation."),
    _gldas("shortwave_radiation", "Downward shortwave radiation", "W/m²", "GLDAS_NOAH025_M_2_1_SWdown_f_tavg",
           "Incoming shortwave solar energy flux at the land surface.",
           "Radiation supplies energy for photosynthesis and evaporation. This is an energy flux, not accumulated energy."),
    _gldas("evapotranspiration", "Evapotranspiration", "kg/m²/s", "GLDAS_NOAH025_M_2_1_Evap_tavg",
           "Modelled evaporation and transpiration water flux from the land surface to the atmosphere.",
           "The supplied values are a water mass flux. They are not monthly water totals; conversion to a depth requires integrating over time."),
    _gldas("potential_evaporation", "Potential evaporation", "W/m²", "GLDAS_NOAH025_M_2_1_PotEvap_tavg",
           "Potential evaporation rate expressed as an energy flux in this GLDAS product.",
           "Represents atmospheric evaporative demand under the model assumptions. Units are W/m² in the supplied workflow; do not treat the values as mm or as the water mass flux Evap_tavg."),
    _gldas("surface_runoff", "Surface runoff", "kg/m²", "GLDAS_NOAH025_M_2_1_Qs_acc",
           "Modelled storm surface runoff, using the accumulated water mass units supplied by GLDAS.",
           "The monthly GLDAS field retains the Qs_acc model accumulation units. It should not be presented as an independently summed monthly runoff total."),
    _gldas("wind_speed", "Wind speed", "m/s", "GLDAS_NOAH025_M_2_1_Wind_f_inst",
           "Near-surface wind speed used by the GLDAS land model.",
           "Wind influences exchanges of heat and water between land and atmosphere. These regional monthly means do not describe gusts or extremes."),
]


def list_variables() -> list[VariableSummary]:
    return [VariableSummary(**variable) for variable in VARIABLES]


def variable_catalog() -> dict[str, VariableSummary]:
    return {variable.id.value: variable for variable in list_variables()}
