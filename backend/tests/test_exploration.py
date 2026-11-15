import unittest
from io import BytesIO

import numpy as np
import pandas as pd
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.services.analysis_service import analyse_frame, monthly_anomalies, pearson_pair
from app.services.data_service import load_region, monthly_frame
from app.services.variable_service import variable_catalog


class ScientificProcessingTests(unittest.TestCase):
    def test_missing_month_is_kept_before_lag(self):
        dates = pd.date_range("2018-01-01", periods=48, freq="MS")
        rain = np.random.default_rng(42).uniform(size=48)
        vegetation = np.roll(rain, 1)
        vegetation[0] = np.nan
        original = pd.DataFrame({
            "time": dates, "precipitation": rain, "ndvi": vegetation, "evi": vegetation,
        }).drop(index=20)
        frame = monthly_frame(original)
        self.assertEqual(len(frame), 48)
        self.assertTrue(frame.loc[dates[20]].isna().all())
        result = analyse_frame(frame)[0]
        self.assertAlmostEqual(result["lags"][1]["pearson_r"], 1.0)
        self.assertEqual(result["lags"][1]["observations"], 45)
        self.assertLess(abs(result["lags"][0]["pearson_r"]), 0.5)

    def test_fill_values_and_infinities_are_missing_not_interpolated(self):
        frame = monthly_frame(pd.DataFrame({
            "time": ["2020-01-01", "2020-03-01", "2020-04-01", "2020-05-01"],
            "precipitation": [0.2, -9999.9, np.inf, -9999],
            "ndvi": [0.3, 0.5, 0.6, 0.7],
        }))
        self.assertEqual(len(frame), 5)
        self.assertTrue(frame.loc["2020-02-01"].isna().all())
        self.assertTrue(frame.loc["2020-03-01":, "precipitation"].isna().all())
        r, count = pearson_pair(frame["precipitation"], frame["ndvi"])
        self.assertIsNone(r)
        self.assertEqual(count, 1)

    def test_duplicate_calendar_month_rejected(self):
        with self.assertRaises(ValueError):
            monthly_frame(pd.DataFrame({"time": ["2020-01-01", "2020-01-30"], "ndvi": [0.2, 0.3]}))

    def test_monthly_anomalies_remove_pure_annual_cycle(self):
        months = np.tile(np.arange(1, 13), 3)
        frame = pd.DataFrame({
            "precipitation": months, "ndvi": months * 0.03, "evi": months * 0.02,
        }, index=pd.date_range("2019-01-01", periods=36, freq="MS"))
        self.assertLess(monthly_anomalies(frame).abs().to_numpy().max(), 1e-12)
        self.assertAlmostEqual(analyse_frame(frame)[0]["pearson_r"], 1.0)
        self.assertIsNone(analyse_frame(frame)[0]["anomaly_r"])

    def test_constant_series_returns_null(self):
        r, count = pearson_pair(pd.Series([1.0] * 4), pd.Series([1, 2, 3, 4]))
        self.assertIsNone(r)
        self.assertEqual(count, 4)

    def test_real_regional_data_matches_independent_check(self):
        expected = {
            "Australia": (0.4148, 0.1724, 0.3995),
            "Brazil": (0.5497, 0.2195, 0.3600),
            "Niger": (0.6743, 0.3150, 0.4181),
            "Peru": (-0.4309, -0.2123, -0.0295),
            "Tanzania": (0.5724, 0.4425, 0.6665),
        }
        for region, (raw, anomaly, lag1) in expected.items():
            with self.subTest(region=region):
                frame = load_region(region)
                self.assertEqual(len(frame), 307)
                self.assertFalse(frame.isna().any().any())
                self.assertEqual(frame.index[0].date().isoformat(), "2000-02-01")
                self.assertEqual(frame.index[-1].date().isoformat(), "2025-08-01")
                result = analyse_frame(frame)[0]
                self.assertAlmostEqual(result["pearson_r"], raw, delta=0.0001)
                self.assertAlmostEqual(result["anomaly_r"], anomaly, delta=0.0001)
                self.assertAlmostEqual(result["lags"][1]["anomaly_r"], lag1, delta=0.0001)
                self.assertEqual([lag["observations"] for lag in result["lags"]], [307, 306, 305, 304])


class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_catalog_has_all_real_variables_and_units(self):
        response = self.client.get("/api/variables")
        self.assertEqual(response.status_code, 200)
        catalog = {item["id"]: item for item in response.json()}
        self.assertEqual(len(catalog), 12)
        self.assertEqual(catalog["precipitation"]["unit"], "mm/h")
        self.assertEqual(catalog["specific_humidity"]["unit"], "kg/kg")
        self.assertEqual(catalog["potential_evaporation"]["unit"], "W/m²")
        self.assertTrue(all(item["description"] and item["source_url"].startswith("https://") for item in catalog.values()))

    def test_regions_report_common_period(self):
        response = self.client.get("/api/regions")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 5)
        self.assertTrue(all(region["observations"] == 307 for region in response.json()))

    def test_plot_allows_five_independent_axes(self):
        identifiers = list(variable_catalog())[:5]
        response = self.client.get("/api/plot", params=[("region", "Niger"), *[("variables", item) for item in identifiers]])
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "image/png")
        image = Image.open(BytesIO(response.content))
        image.verify()
        self.assertEqual(image.width, 1500)
        self.assertGreater(image.height, 1500)

    def test_plot_rejects_invalid_inputs(self):
        cases = [
            [("region", "Niger")],
            [("region", "Niger"), ("variables", "unlisted")],
            [("region", "Niger"), ("variables", "ndvi"), ("variables", "ndvi")],
            [("region", "../Australia"), ("variables", "ndvi")],
            [("region", "Niger"), *[("variables", item) for item in list(variable_catalog())[:6]]],
        ]
        for params in cases:
            with self.subTest(params=params):
                self.assertEqual(self.client.get("/api/plot", params=params).status_code, 422)

    def test_analysis_structure_and_scatter_png(self):
        response = self.client.get("/api/analysis", params={"region": "Niger"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["observations"], 307)
        self.assertEqual([item["variable"] for item in data["results"]], ["ndvi", "evi"])
        self.assertEqual(len(data["results"][0]["lags"]), 4)
        self.assertTrue(data["methodology"] and data["limitations"])
        png = self.client.get("/api/analysis/plot", params={"region": "Niger"})
        self.assertEqual(png.status_code, 200)
        Image.open(BytesIO(png.content)).verify()
        self.assertEqual(self.client.get("/api/analysis", params={"region": "../Niger"}).status_code, 422)


if __name__ == "__main__":
    unittest.main()
