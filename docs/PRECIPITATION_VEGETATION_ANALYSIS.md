# Relationship between precipitation and vegetation

Exploratory analysis of the files supplied for MeteoPark. No simulated data have been added and no new observations have been downloaded.

## Data and period

The analysis uses the five `data/<region>/all_concat.csv` series: Niger (Sahel), Brazil (Cerrado), Tanzania (Serengeti), Northern Australia, and Peru (Western Amazon). Each contains **307 months, from February 2000 to August 2025**. Vegetation observations for September 2025 are excluded because the common dataset has no precipitation observations for that month.

The meteorological and land-surface series were extracted from [NASA Giovanni servers](https://giovanni.gsfc.nasa.gov/giovanni/) as regional monthly averages. The MODIS vegetation summaries were prepared with [NASA AppEEARS](https://appeears.earthdatacloud.nasa.gov/), as recorded in the supplied processing scripts.

Precipitation is the monthly mean rate from GPM IMERG Final V07, expressed in **mm/h**, rather than a monthly total. NDVI and EVI are dimensionless indices from MOD13A3 V061. The decimal scale in the supplied CSV files is preserved; the original product's scale factor is not applied a second time.

## Method

1. Align observations by calendar month and retain missing months as missing before shifting the series. The five supplied common-period CSV files contain no missing values.
2. Calculate the Pearson correlation between precipitation and each vegetation index in the same month.
3. Subtract each series' mean for each calendar month, using the climatology calculated over the common period, then repeat the correlation on these anomalies. This removes the mean seasonal cycle, but does not remove trends or all temporal autocorrelation.
4. Repeat for lags of 1, 2, and 3 months: `corr(rainfall[t-k], vegetation[t])`. A positive lag therefore compares earlier rainfall with later vegetation. Use valid pairs without filling missing months or replacing them with zero. The resulting pair counts are 307, 306, 305, and 304 respectively.

The accompanying CSV contains all 40 results: five regions × two indices × four lags. Values in the tables below are rounded to three decimal places.

## Same-month results

| Region | NDVI: r | NDVI: anomaly r | EVI: r | EVI: anomaly r |
|---|---:|---:|---:|---:|
| Sahel, Niger | 0.674 | 0.315 | 0.714 | 0.295 |
| Cerrado, Brazil | 0.550 | 0.220 | 0.682 | 0.229 |
| Serengeti, Tanzania | 0.572 | 0.443 | 0.557 | 0.411 |
| Northern Australia | 0.415 | 0.172 | 0.460 | 0.153 |
| Western Amazon, Peru | -0.431 | -0.212 | -0.132 | -0.143 |

## Previous-month rainfall and current vegetation

| Region | NDVI: r | NDVI: anomaly r | EVI: r | EVI: anomaly r |
|---|---:|---:|---:|---:|
| Sahel, Niger | 0.924 | 0.418 | 0.937 | 0.426 |
| Cerrado, Brazil | 0.798 | 0.360 | 0.846 | 0.377 |
| Serengeti, Tanzania | 0.825 | 0.666 | 0.831 | 0.698 |
| Northern Australia | 0.726 | 0.400 | 0.753 | 0.378 |
| Western Amazon, Peru | -0.335 | -0.030 | -0.279 | -0.038 |

## Interpretation

- **Sahel, Cerrado, and Northern Australia:** positive correlations are higher with a one-month lag than with no lag. Removing mean seasonality reduces the relationship, showing that a substantial part of the raw pattern coincides with the seasons. Anomalies retain a positive association, which is consistent with vegetation responding later to water availability, but does not establish that this is the cause.
- **Serengeti:** the one-month anomaly association is the highest among the five regions: NDVI ≈ 0.667 and EVI ≈ 0.698. Monthly climatology alone does not explain this pattern, although other factors and autocorrelation may contribute.
- **Western Amazon:** the pattern differs: the same-month correlation is negative, and the one-month anomaly association is close to zero. These data do not support a uniformly positive rainfall–vegetation relationship across all regions. Cloud cover, radiation, NDVI saturation, or water availability are hypotheses to investigate; this analysis cannot attribute the result to those factors.

## Limitations

These correlations are descriptive, without a causal test or a claim of statistical significance. Comparing several lags is exploratory: selecting the highest correlation is not independent confirmation. Temporal autocorrelation and multiple comparisons have not been corrected for, and removing monthly climatology does not remove long-term trends.

The vegetation summary CSV files do not include pixel counts or quality flags. Cloud filtering and original observation quality cannot be verified. Regional means do not represent every pixel, and the products have different spatial resolutions. Vegetation masks, land-use changes, and confounding factors have not been examined. These summaries do not allow uncertainty to be fully quantified.

Giovanni GIFs showing yearly evolution will be added when the team supplies them. Demo images have not been used to derive scientific results.

## Sources

- [NASA GPM IMERG](https://gpm.nasa.gov/data/imerg)
- [NASA MOD13A3 V061](https://lpdaac.usgs.gov/products/mod13a3v061/)
- [NASA GLDAS](https://ldas.gsfc.nasa.gov/gldas)
- [NASA Giovanni](https://giovanni.gsfc.nasa.gov/giovanni/)
- [NASA AppEEARS](https://appeears.earthdatacloud.nasa.gov/)
