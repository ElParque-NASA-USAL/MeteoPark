import unittest
from io import BytesIO

import numpy as np
import pandas as pd
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.services.analysis_service import (
    _study_example, analyse_frame, detrended_anomaly_correlation,
    precipitation_amount, study_region,
)
from app.services.data_service import load_region


class StudyProcessingTests(unittest.TestCase):
    def test_monthly_amount_uses_actual_calendar_days_including_leap_year(self):
        frame = pd.DataFrame({"precipitation": [1.0, 1.0]}, index=pd.to_datetime(["2020-02-01", "2021-02-01"]))
        self.assertEqual(precipitation_amount(frame).tolist(), [696.0, 672.0])

    def test_examples_follow_identical_rainfall_only_rule_across_regions(self):
        expected = {
            "Niger": ("2015-07-01", "2015-08-01", 169.066412688),
            "Brazil": ("2015-11-01", "2015-12-01", 204.00225192),
            "Tanzania": ("2017-11-01", "2017-12-01", 115.9622172),
            "Australia": ("2021-12-01", "2022-01-01", 113.495922552),
            "Peru": ("2016-10-01", "2016-11-01", 234.918667368),
        }
        for region, (before, after, amount) in expected.items():
            with self.subTest(region=region):
                example = study_region(region)["example"]
                self.assertEqual((example["before"], example["after"]), (before, after))
                self.assertAlmostEqual(example["rain_mm"], amount, places=8)
                frame = load_region(region)
                self.assertAlmostEqual(example["rain_after_mm"], precipitation_amount(frame).loc[after])
                changed = frame.copy()
                changed["ndvi"] = np.random.default_rng(10).normal(size=len(frame))
                changed["evi"] = -changed["ndvi"]
                alternative = _study_example(region, changed)
                self.assertEqual((alternative["before"], alternative["after"]), (before, after))
        peru = study_region("Peru")["example"]
        self.assertGreater(peru["ndvi_after"], peru["ndvi_before"])
        self.assertLess(peru["evi_after"], peru["evi_before"])

    def test_detrending_detects_spurious_shared_long_term_trend(self):
        size = 360
        rng = np.random.default_rng(123)
        time = np.arange(size)
        frame = pd.DataFrame({
            "precipitation": time * 0.1 + rng.normal(size=size),
            "ndvi": time * 0.2 + rng.normal(size=size),
            "evi": time * 0.15 + rng.normal(size=size),
        }, index=pd.date_range("1990-01-01", periods=size, freq="MS"))
        self.assertGreater(analyse_frame(frame)[0]["lags"][1]["anomaly_r"], 0.95)
        self.assertLess(abs(detrended_anomaly_correlation(frame, "ndvi")), 0.15)

    def test_study_preserves_original_rate_correlations(self):
        for region in ["Niger", "Brazil", "Tanzania", "Australia", "Peru"]:
            with self.subTest(region=region):
                study = study_region(region)
                original = analyse_frame(load_region(region))
                self.assertEqual(study["results"], original)
                self.assertEqual(len(study["seasonal"]["months"]), 12)
                self.assertEqual(len(study["seasonal"]["counts"]), 12)
                self.assertEqual(sum(study["seasonal"]["counts"]), 307)
                self.assertEqual(len(study["findings"]), 4)
                self.assertIn("not", " ".join(study["limitations"]))


class StudyApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_study_and_light_evidence_dashboard(self):
        response = self.client.get("/api/study", params={"region": "Niger"})
        self.assertEqual(response.status_code, 200)
        study = response.json()
        self.assertEqual(study["label"], "Sahel, Niger")
        self.assertEqual(study["example"]["before"], "2015-07-01")
        self.assertAlmostEqual(study["metrics"]["ndvi_lag1_anomaly_r"], 0.4180614033)
        png = self.client.get("/api/study/plot", params={"region": "Niger"})
        self.assertEqual(png.status_code, 200)
        self.assertEqual(png.headers["content-type"], "image/png")
        image = Image.open(BytesIO(png.content)).convert("RGB")
        self.assertEqual(image.size, (1500, 1230))
        self.assertEqual(image.getpixel((0, 0)), (255, 255, 255))
        self.assertEqual(self.client.get("/api/study", params={"region": "../Niger"}).status_code, 422)
        self.assertEqual(self.client.get("/api/study/plot", params={"region": "unknown"}).status_code, 422)


if __name__ == "__main__":
    unittest.main()
