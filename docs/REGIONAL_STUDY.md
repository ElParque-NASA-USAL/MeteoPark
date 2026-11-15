# Regional rainfall–vegetation study

## Question and design

Does rainfall precede higher vegetation greenness, and does the association remain after accounting for the seasonal cycle? This descriptive study uses the five supplied regional CSV records: 307 consecutive calendar months per region, February 2000 through August 2025. The study boxes represent selected areas, not entire countries. No original observations were removed or modified.

Precipitation is the GPM IMERG Final V07 mean rain rate in mm/h. Seasonal and example plots estimate monthly rainfall depth by multiplying the rate by 24 and the actual number of days in each month. Correlations retain the original mean rain rate for consistency with the original analysis. MOD13A3 NDVI and EVI are dimensionless regional greenness summaries.

We compare rainfall in month t−L with vegetation in month t for L=0,1,2,3. Monthly anomalies subtract each variable's mean for its calendar month. A sensitivity check removes separate fitted linear trends from the valid paired anomaly series. This helps distinguish seasonal and long-term patterns from the remaining association, but does not eliminate all temporal dependence or environmental confounding. EVI is a complementary index from the same MODIS instrument, not an independent experiment.

## Full-record comparison: rainfall leading by one month

| Region | NDVI raw r | NDVI anomaly r | NDVI detrended anomaly r | EVI anomaly r | Paired months |
|---|---:|---:|---:|---:|---:|
| Sahel, Niger | 0.924 | 0.418 | 0.410 | 0.426 | 306 |
| Cerrado, Brazil | 0.798 | 0.360 | 0.393 | 0.377 | 306 |
| Serengeti, Tanzania | 0.825 | 0.666 | 0.667 | 0.698 | 306 |
| Northern Australia | 0.726 | 0.400 | 0.417 | 0.378 | 306 |
| Western Amazon, Peru | -0.335 | -0.030 | -0.024 | -0.038 | 306 |

The four savanna and semi-arid study areas retain positive delayed anomaly associations. The western Amazon comparison is near zero after removing seasonality. This regional contrast prevents a uniform causal claim that rainfall always produces higher greenness the following month.

## Regional findings

### Sahel, Niger

**A delayed greening signal in the Sahel.** The regional monthly averages show a pronounced wet-season greening cycle. Rainfall peaks in August and average NDVI peaks in September. This seasonal timing is consistent with vegetation greening after the rains, but it is not a causal estimate.

**What remains after removing the seasons?.** NDVI's same-month Pearson r is 0.674; comparing rainfall with NDVI one month later gives 0.924. After subtracting each calendar month's usual values, the one-month correlation is 0.418 over 306 paired months. The smaller anomaly correlation shows that the seasonal cycle explains part, but not all, of the raw association.

**Cross-check with a second vegetation index.** EVI's one-month anomaly correlation is 0.426. NDVI and EVI provide complementary greenness measures from the same MODIS product; agreement is useful, but it is not an independent satellite experiment or a measurement of vegetation area.

**Sensitivity to long-term trends.** Removing a fitted linear trend from the paired seasonal anomalies gives one-month correlations of 0.410 for NDVI and 0.418 for EVI. This descriptive sensitivity check does not remove all temporal dependence or control for other environmental drivers.

**Dated comparison: 2015-07 → 2015-08.** The dates are selected by rainfall onset rather than by choosing the largest vegetation increase.

| Observation | Rainfall-onset month | Following month |
|---|---:|---:|
| Estimated rainfall (mm) | 169.1 | 221.5 |
| NDVI | 0.300 | 0.439 |
| EVI | 0.222 | 0.315 |

Both months can receive rain. The comparison cannot attribute the vegetation change specifically to the first month's precipitation.

NASA Worldview: [first month's NDVI map](https://worldview.earthdata.nasa.gov/?v=4%2C12%2C6%2C14&l=MODIS_Terra_L3_NDVI_Monthly&t=2015-07-01-T00%3A00%3A00Z) and [following month's NDVI map](https://worldview.earthdata.nasa.gov/?v=4%2C12%2C6%2C14&l=MODIS_Terra_L3_NDVI_Monthly&t=2015-08-01-T00%3A00%3A00Z). Clouds obscure part of the July photograph. Use the monthly NDVI composites and the regional index values to assess greening rather than comparing photo color alone.

### Cerrado, Brazil

**A wet-season recovery in the Cerrado.** The Cerrado study area has a strong dry-to-wet seasonal transition. Rainfall is concentrated in the austral wet season, while average NDVI is highest in March. Vegetation remains green after the rainfall maximum, so the two seasonal peaks should not be treated as a single fixed response time.

**What remains after removing the seasons?.** NDVI's same-month Pearson r is 0.550; comparing rainfall with NDVI one month later gives 0.798. After subtracting each calendar month's usual values, the one-month correlation is 0.360 over 306 paired months. The smaller anomaly correlation shows that the seasonal cycle explains part, but not all, of the raw association.

**Cross-check with a second vegetation index.** EVI's one-month anomaly correlation is 0.377. NDVI and EVI provide complementary greenness measures from the same MODIS product; agreement is useful, but it is not an independent satellite experiment or a measurement of vegetation area.

**Sensitivity to long-term trends.** Removing a fitted linear trend from the paired seasonal anomalies gives one-month correlations of 0.393 for NDVI and 0.434 for EVI. This descriptive sensitivity check does not remove all temporal dependence or control for other environmental drivers.

**Dated comparison: 2015-11 → 2015-12.** The dates are selected by rainfall onset rather than by choosing the largest vegetation increase.

| Observation | Rainfall-onset month | Following month |
|---|---:|---:|
| Estimated rainfall (mm) | 204.0 | 80.7 |
| NDVI | 0.516 | 0.581 |
| EVI | 0.310 | 0.373 |

Both months can receive rain. The comparison cannot attribute the vegetation change specifically to the first month's precipitation.

NASA Worldview: [first month's NDVI map](https://worldview.earthdata.nasa.gov/?v=-48%2C-15%2C-46%2C-13&l=MODIS_Terra_L3_NDVI_Monthly&t=2015-11-01-T00%3A00%3A00Z) and [following month's NDVI map](https://worldview.earthdata.nasa.gov/?v=-48%2C-15%2C-46%2C-13&l=MODIS_Terra_L3_NDVI_Monthly&t=2015-12-01-T00%3A00%3A00Z). The largely clear photos show a mosaic of vegetation and managed land. Differences in viewing and illumination still prevent a direct quantitative vegetation comparison from true color alone.

### Serengeti, Tanzania

**Two rain-season pulses in the Serengeti.** The monthly climatology has rainfall pulses in March–April and November–December, rather than one simple annual maximum. Greenness rises around both wet seasons. A one-month comparison captures an association across the full record, without implying that every rain event produces the same delay.

**What remains after removing the seasons?.** NDVI's same-month Pearson r is 0.572; comparing rainfall with NDVI one month later gives 0.825. After subtracting each calendar month's usual values, the one-month correlation is 0.666 over 306 paired months. The smaller anomaly correlation shows that the seasonal cycle explains part, but not all, of the raw association.

**Cross-check with a second vegetation index.** EVI's one-month anomaly correlation is 0.698. NDVI and EVI provide complementary greenness measures from the same MODIS product; agreement is useful, but it is not an independent satellite experiment or a measurement of vegetation area.

**Sensitivity to long-term trends.** Removing a fitted linear trend from the paired seasonal anomalies gives one-month correlations of 0.667 for NDVI and 0.703 for EVI. This descriptive sensitivity check does not remove all temporal dependence or control for other environmental drivers.

**Dated comparison: 2017-11 → 2017-12.** The dates are selected by rainfall onset rather than by choosing the largest vegetation increase.

| Observation | Rainfall-onset month | Following month |
|---|---:|---:|
| Estimated rainfall (mm) | 116.0 | 80.4 |
| NDVI | 0.330 | 0.406 |
| EVI | 0.201 | 0.249 |

Both months can receive rain. The comparison cannot attribute the vegetation change specifically to the first month's precipitation.

NASA Worldview: [first month's NDVI map](https://worldview.earthdata.nasa.gov/?v=34.5%2C-3%2C35.5%2C-2&l=MODIS_Terra_L3_NDVI_Monthly&t=2017-11-01-T00%3A00%3A00Z) and [following month's NDVI map](https://worldview.earthdata.nasa.gov/?v=34.5%2C-3%2C35.5%2C-2&l=MODIS_Terra_L3_NDVI_Monthly&t=2017-12-01-T00%3A00%3A00Z). Scattered clouds obscure parts of both daily photographs. The monthly NDVI composites provide the more comparable view of the seasonal vegetation pattern.

### Northern Australia

**Monsoon rain followed by higher greenness.** In northern Australia, average rainfall peaks in February and average NDVI peaks in March. This regional monsoon-season sequence is consistent with delayed greening and is supported by the full-record lag comparison, not by a single photograph.

**What remains after removing the seasons?.** NDVI's same-month Pearson r is 0.415; comparing rainfall with NDVI one month later gives 0.726. After subtracting each calendar month's usual values, the one-month correlation is 0.400 over 306 paired months. The smaller anomaly correlation shows that the seasonal cycle explains part, but not all, of the raw association.

**Cross-check with a second vegetation index.** EVI's one-month anomaly correlation is 0.378. NDVI and EVI provide complementary greenness measures from the same MODIS product; agreement is useful, but it is not an independent satellite experiment or a measurement of vegetation area.

**Sensitivity to long-term trends.** Removing a fitted linear trend from the paired seasonal anomalies gives one-month correlations of 0.417 for NDVI and 0.409 for EVI. This descriptive sensitivity check does not remove all temporal dependence or control for other environmental drivers.

**Dated comparison: 2021-12 → 2022-01.** The dates are selected by rainfall onset rather than by choosing the largest vegetation increase.

| Observation | Rainfall-onset month | Following month |
|---|---:|---:|
| Estimated rainfall (mm) | 113.5 | 129.9 |
| NDVI | 0.381 | 0.480 |
| EVI | 0.212 | 0.248 |

Both months can receive rain. The comparison cannot attribute the vegetation change specifically to the first month's precipitation.

NASA Worldview: [first month's NDVI map](https://worldview.earthdata.nasa.gov/?v=132%2C-17%2C134%2C-15&l=MODIS_Terra_L3_NDVI_Monthly&t=2021-12-01-T00%3A00%3A00Z) and [following month's NDVI map](https://worldview.earthdata.nasa.gov/?v=132%2C-17%2C134%2C-15&l=MODIS_Terra_L3_NDVI_Monthly&t=2022-01-01-T00%3A00%3A00Z). The daily photographs include small clouds and haze. The monthly NDVI composites and regional means provide stronger evidence of the vegetation difference than apparent photo color alone.

### Western Amazon, Peru

**The Amazon does not follow the savanna pattern.** The western Amazon study area stays comparatively green throughout the year. Its raw same-month rain–NDVI association is negative, while the one-month anomaly association is close to zero. These observations do not support a uniform 'more rain, then more greenness' rule across all five regions.

**What remains after removing the seasons?.** NDVI's same-month Pearson r is -0.431; comparing rainfall with NDVI one month later gives -0.335. After subtracting each calendar month's usual values, the one-month correlation is -0.030 over 306 paired months. The contrast shows that a large part of the raw association is seasonal, and the delayed anomaly relationship is weak.

**Cross-check with a second vegetation index.** EVI's one-month anomaly correlation is -0.038. NDVI and EVI provide complementary greenness measures from the same MODIS product; agreement is useful, but it is not an independent satellite experiment or a measurement of vegetation area. In the rainfall-selected October 2016 example, NDVI changes from 0.827 to 0.832, while EVI falls from 0.561 to 0.548. This disagreement is another reason to avoid presenting every region as a greening success story.

**Sensitivity to long-term trends.** Removing a fitted linear trend from the paired seasonal anomalies gives one-month correlations of -0.024 for NDVI and -0.034 for EVI. This descriptive sensitivity check does not remove all temporal dependence or control for other environmental drivers.

**Dated comparison: 2016-10 → 2016-11.** The dates are selected by rainfall onset rather than by choosing the largest vegetation increase.

| Observation | Rainfall-onset month | Following month |
|---|---:|---:|
| Estimated rainfall (mm) | 234.9 | 208.9 |
| NDVI | 0.827 | 0.832 |
| EVI | 0.561 | 0.548 |

Both months can receive rain. The comparison cannot attribute the vegetation change specifically to the first month's precipitation.

NASA Worldview: [first month's NDVI map](https://worldview.earthdata.nasa.gov/?v=-72%2C-6%2C-69%2C-3&l=MODIS_Terra_L3_NDVI_Monthly&t=2016-10-01-T00%3A00%3A00Z) and [following month's NDVI map](https://worldview.earthdata.nasa.gov/?v=-72%2C-6%2C-69%2C-3&l=MODIS_Terra_L3_NDVI_Monthly&t=2016-11-01-T00%3A00%3A00Z). Clouds obscure parts of the dense forest in both photographs. The imagery does not establish a positive rain-to-greening response; consult the regional study and treat dense-canopy NDVI saturation as a limitation.

## Reproducible example and image selection

Identify the calendar month with the largest climatological increase in monthly rainfall from the preceding month (including December to January). For that month, select the 2015–2024 year whose rainfall is closest to its median; ties within 1e-9 mm select the earlier year. Compare that rainfall-onset month with the following month. Selection uses rainfall, not the vegetation response. Rain can also fall during the following month; the observed greenness change cannot be attributed solely to the onset-month rainfall.

The matching monthly MODIS NDVI composites use identical bounding boxes and the same unmodified NASA color scale. Genuine daily Terra/MODIS true-color scenes provide landscape context. Their exact acquisition dates are printed; scenes were selected for visibility from fixed candidate days within each selected month. Clouds, haze and viewing conditions affect photographs, so apparent photo color is not used as a quantitative greenness measurement.

Numeric NDVI/EVI differences come from the supplied CSV summaries, not from reading colors off browse images. All source URLs, acquisition dates, geographic extents and SHA-256 hashes are recorded in `frontend/src/data/satellite_evidence.json`. Run `python docs/fetch_satellite_images.py` to verify or retrieve the stored NASA assets. A photographed example is an illustration, while the full-period comparisons provide the broader quantitative context.

## Quality and sensitivity

The common CSVs have no missing months, but do not include pixel-quality flags or valid-pixel counts. Unusually low initial NDVI observations occur in February 2000 in Peru and Australia. Their cause cannot be established from these summaries. As a sensitivity check, remove only that first month, recompute monthly anomalies, and compare the one-month NDVI association:

| Region | All months: lag-1 anomaly r | Excluding February 2000 |
|---|---:|---:|
| Peru | -0.030 | -0.042 |
| Australia | 0.400 | 0.402 |

The regional interpretation remains the same in this sensitivity check; the published main study retains all original observations. Other outliers, cloud effects, mixed land cover and differences in spatial resolution remain limitations. Monthly spatial averages cannot describe every pixel. Dense-canopy NDVI saturation, radiation, water availability, land use and temperature are plausible influences to investigate, not established explanations for a particular finding.

These are exploratory associations, without causal identification or statistical-significance claims. Several lags are compared; selecting the largest correlation does not confirm a response time. Temporal autocorrelation and multiple comparisons have not been corrected by a confirmatory inference procedure.

## Sources and reproduction

- [NASA Giovanni](https://giovanni.gsfc.nasa.gov/giovanni/): supplied meteorological and land-surface exports.
- [NASA GPM IMERG](https://gpm.nasa.gov/data/imerg): precipitation product.
- [NASA MOD13A3 V061](https://lpdaac.usgs.gov/products/mod13a3v061/) and [AppEEARS](https://appeears.earthdatacloud.nasa.gov/): vegetation summaries.
- [NASA GIBS API documentation](https://nasa-gibs.github.io/gibs-api-docs/): authentic imagery retrieval.
- [NASA: Measuring Vegetation](https://science.nasa.gov/earth/earth-observatory/measuring-vegetation-ndvi-evi/): index interpretation and cloud limitations.

Reproduce this report, JSON results and cross-region CSV from the project sources:

```sh
cd backend
uv run --no-dev python ../docs/export_regional_study.py
```

The website presents these findings directly in Explore. The separate analysis and wiki routes remain available for detailed reading.
