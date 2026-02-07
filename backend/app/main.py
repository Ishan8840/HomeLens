from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import time

from .models import IdentifyResponse, BuildingOut, LatLon, Meta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_RADIUS_M = 150
DEFAULT_CONE_DEG = 60


@app.get("/identify", response_model=IdentifyResponse)
def identify(
    lat: float = Query(...),
    lon: float = Query(...),
    heading: float = Query(..., ge=0.0, lt=360.0),
    radius_m: int = Query(DEFAULT_RADIUS_M, ge=10, le=500),
):
    now_ms = int(time.time() * 1000)

    # Stub single-building result
    building = BuildingOut(
        building_id="MOCK_1",
        label="Mock building",
        confidence=0.84,
        bearing_deg=(heading + 12) % 360,
        delta_deg=12.0,
        distance_m=38.0,
        centroid=LatLon(lat=lat + 0.0002, lon=lon + 0.0001),
        estimate=720000,
        forecast_12m=741600,
        range_low=700000,
        range_high=780000,
    )

    meta = Meta(
        radius_m=radius_m,
        cone_deg=DEFAULT_CONE_DEG,
        heading_deg=heading,
        timestamp_ms=now_ms,
    )

    return IdentifyResponse(building=building, meta=meta)


@app.get("/health")
def health():
    return {"ok": True}
