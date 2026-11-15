#!/usr/bin/env python3
"""Reproduce the archived NASA GIBS image requests from their provenance manifest.

Run from the project root:
    python docs/fetch_satellite_images.py

The imagery is already bundled with the project. This script verifies cached
assets and downloads missing ones without changing NASA's response bytes.
Use --refresh to request every asset again. If NASA's bytes have changed since
the archived snapshot, the script stops instead of silently changing evidence.

Monthly maps: MODIS_Terra_L3_NDVI_Monthly (monthly NDVI composite).
Photos: MODIS_Terra_CorrectedReflectance_TrueColor (individual daily scenes).
The scene dates, bounding boxes, exact GetMap URLs, original SHA-256 hashes,
Worldview links and selection limitations are recorded in the JSON manifest.

NASA GIBS API documentation: https://nasa-gibs.github.io/gibs-api-docs/
"""

import argparse
import hashlib
import json
from pathlib import Path
import struct
from urllib.parse import urlparse
from urllib.request import Request, urlopen


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = PROJECT_ROOT / "frontend" / "public"
DEFAULT_MANIFEST = PROJECT_ROOT / "frontend" / "src" / "data" / "satellite_evidence.json"
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def validate_png(raw: bytes, label: str, expected_hash: str | None) -> None:
    if len(raw) < 24 or not raw.startswith(PNG_SIGNATURE):
        raise ValueError(f"The response is not a PNG image: {label}")
    width, height = struct.unpack(">II", raw[16:24])
    if width < 1 or height < 1:
        raise ValueError(f"The image has invalid dimensions: {label}")
    if expected_hash and hashlib.sha256(raw).hexdigest() != expected_hash:
        raise ValueError(
            f"NASA's image bytes differ from the archived snapshot: {label}. "
            "Inspect the product/version and update provenance explicitly before replacing it."
        )


def records(manifest: dict):
    yield manifest["legend"]
    for region in manifest["regions"].values():
        for period in ("before", "after"):
            for product in ("ndvi", "truecolor"):
                yield region[period][product]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--refresh", action="store_true", help="Request even assets that are already cached.")
    args = parser.parse_args()
    manifest = json.loads(args.manifest.read_text())
    count = 0
    for record in records(manifest):
        target = (PUBLIC_DIR / record["src"].lstrip("/")).resolve()
        if not target.is_relative_to(PUBLIC_DIR.resolve()):
            raise ValueError("Image path leaves the project's public directory")
        source = record["source_url"]
        parsed = urlparse(source)
        if parsed.scheme != "https" or parsed.netloc != "gibs.earthdata.nasa.gov":
            raise ValueError("Expected an HTTPS image from NASA GIBS")
        expected_hash = record.get("sha256")
        if target.exists() and not args.refresh:
            validate_png(target.read_bytes(), source, expected_hash)
            print(f"Verified {record['src']}")
        else:
            request = Request(source, headers={"User-Agent": "MeteoPark educational data visualization"})
            with urlopen(request, timeout=90) as response:
                raw = response.read()
            validate_png(raw, source, expected_hash)
            target.parent.mkdir(parents=True, exist_ok=True)
            temporary = target.with_suffix(".download")
            temporary.write_bytes(raw)
            temporary.replace(target)
            print(f"Downloaded {record['src']}")
        count += 1
    print(f"Verified {count} original NASA GIBS image assets.")


if __name__ == "__main__":
    main()
