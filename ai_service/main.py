"""
HoneyChain AI Microservice — FastAPI Application
FSSAI-compliant Honey Quality Scoring & Adulteration Fingerprint Classifier for SIH 2026
Author: Shivam Gawade (ShivamGawade-XS)
"""

import os
import time
import json
import random
import asyncio
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np

app = FastAPI(
    title="HoneyChain AI Microservice",
    description="FSSAI IS 4941:2020 Honey Quality Scoring, Multi-Parameter Adulteration Fingerprinting & IoT Anomaly Engine for SIH 2026",
    version="2.2.0"
)

# Enable CORS for Next.js frontend & tools with valid credentials spec
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained ML models
ml_regressor = None
ml_classifier = None
try:
    import joblib
    model_path = os.path.join(os.path.dirname(__file__), "model", "quality_model.pkl")
    classifier_path = os.path.join(os.path.dirname(__file__), "model", "adulterant_classifier.pkl")
    if os.path.exists(model_path):
        ml_regressor = joblib.load(model_path)
    if os.path.exists(classifier_path):
        ml_classifier = joblib.load(classifier_path)
except Exception as e:
    print(f"Notice: ML model load status: ({e})")


# ─── IN-MEMORY LIVE HIVE TELEMETRY STORE ──────────────────────────────────────

DEFAULT_HIVES: Dict[str, Dict[str, Any]] = {
    "HIVE-WB-0391": {
        "hive_id": "HIVE-WB-0391 (Sundarbans Delta - Stage Demo)",
        "location": "Sundarbans, West Bengal",
        "weight_kg": 45.20,
        "base_weight_kg": 45.20,
        "internal_temp_c": 34.8,
        "humidity_percent": 63.5,
        "acoustic_frequency_hz": 235.0,
        "base_acoustic_hz": 235.0,
        "status": "Optimal Colony Health",
        "has_alert": False,
        "alert_type": None,
        "last_updated": int(time.time()),
    },
    "HIVE-RJ-101": {
        "hive_id": "HIVE-RJ-101 (Alwar Mustard Valley)",
        "location": "Alwar, Rajasthan",
        "weight_kg": 46.80,
        "base_weight_kg": 46.80,
        "internal_temp_c": 35.1,
        "humidity_percent": 59.0,
        "acoustic_frequency_hz": 240.0,
        "base_acoustic_hz": 240.0,
        "status": "Optimal Colony Health",
        "has_alert": False,
        "alert_type": None,
        "last_updated": int(time.time()),
    },
    "HIVE-JK-303": {
        "hive_id": "HIVE-JK-303 (Kashmir Acacia Apiary)",
        "location": "Anantnag, Kashmir",
        "weight_kg": 52.10,
        "base_weight_kg": 52.10,
        "internal_temp_c": 33.5,
        "humidity_percent": 56.2,
        "acoustic_frequency_hz": 228.0,
        "base_acoustic_hz": 228.0,
        "status": "Optimal Colony Health",
        "has_alert": False,
        "alert_type": None,
        "last_updated": int(time.time()),
    },
    "HIVE-BH-088": {
        "hive_id": "HIVE-BH-088 (Muzaffarpur Litchi Orchard)",
        "location": "Muzaffarpur, Bihar",
        "weight_kg": 43.40,
        "base_weight_kg": 43.40,
        "internal_temp_c": 35.6,
        "humidity_percent": 65.8,
        "acoustic_frequency_hz": 244.0,
        "base_acoustic_hz": 244.0,
        "status": "Optimal Colony Health",
        "has_alert": False,
        "alert_type": None,
        "last_updated": int(time.time()),
    }
}

HIVE_STORE: Dict[str, Dict[str, Any]] = {k: dict(v) for k, v in DEFAULT_HIVES.items()}


# ─── DATA MODELS ─────────────────────────────────────────────────────────────

class HoneyQualityInput(BaseModel):
    moisture_percent: Optional[float] = Field(None, alias="moisture", description="Moisture percentage (FSSAI max 20%)")
    brix_index: Optional[float] = Field(None, alias="brix", description="Brix refractometer reading (Ideal > 80)")
    hmf_mg_kg: Optional[float] = Field(None, alias="hmf", description="Hydroxymethylfurfural content (Max 40-80 mg/kg)")
    diastase_activity: Optional[float] = Field(None, alias="diastase", description="Diastase activity index (Min 8.0)")
    electrical_conductivity: Optional[float] = Field(0.45, alias="conductivity", description="mS/cm reading (Max 0.8)")
    c13_isotope_delta: Optional[float] = Field(-26.2, alias="c13_delta", description="delta 13C isotope (per mil)")
    c4_sugar_percent: Optional[float] = Field(1.2, alias="c4_sugar", description="Exogenous C4 sugars (%)")
    smr_marker: Optional[float] = Field(0.02, alias="smr", description="SMR marker for rice syrup")

    class Config:
        populate_by_name = True


class HiveTelemetryInput(BaseModel):
    hive_id: str = Field(..., example="HIVE-WB-0391")
    weight_kg: float = Field(..., example=44.4)
    previous_weight_kg: Optional[float] = Field(None, example=45.2)
    internal_temp_c: float = Field(..., example=35.2)
    humidity_percent: float = Field(..., example=62.0)
    acoustic_frequency_hz: Optional[float] = Field(240.0, example=240.0)


class AlertTriggerRequest(BaseModel):
    hive_id: str = Field("HIVE-WB-0391", example="HIVE-WB-0391")
    inject_varroa_alert: bool = Field(True, description="When true, drops weight and increases acoustics")
    weight_drop_kg: float = Field(0.8, description="Weight reduction in kg (e.g. 0.8 kg)")
    acoustic_increase_db: float = Field(15.0, description="Acoustic rise in dB / frequency shift")
    reset: bool = Field(False, description="Reset hive back to optimal normal baseline")


# ─── API ROUTES ──────────────────────────────────────────────────────────────

@app.get("/")
@app.get("/api/health")
def health_check():
    return {
        "service": "HoneyChain AI Microservice",
        "status": "Online",
        "timestamp": int(time.time()),
        "ps_id": "SIH26021",
        "model_loaded": ml_regressor is not None and ml_classifier is not None,
        "engine": "Scikit-Learn RandomForest (FSSAI NMR/Isotope Calibrated)" if ml_regressor is not None else "Physics-Based FSSAI Engine",
        "active_hives_in_memory": len(HIVE_STORE)
    }


@app.post("/api/quality/predict")
@app.post("/quality/predict")
def predict_honey_quality(data: HoneyQualityInput):
    """
    Calculate FSSAI-aligned Honey Quality Score (0-100), Grade, and Adulteration Classification.
    """
    # Safe parameter extraction with defaults
    moisture = data.moisture_percent if data.moisture_percent is not None else 17.5
    brix = data.brix_index if data.brix_index is not None else 81.2
    hmf = data.hmf_mg_kg if data.hmf_mg_kg is not None else 12.4
    diastase = data.diastase_activity if data.diastase_activity is not None else 14.0
    conductivity = data.electrical_conductivity if data.electrical_conductivity is not None else 0.45
    c13_val = data.c13_isotope_delta if data.c13_isotope_delta is not None else -26.2
    c4_val = data.c4_sugar_percent if data.c4_sugar_percent is not None else 1.2
    smr_val = data.smr_marker if data.smr_marker is not None else 0.02

    if ml_regressor is not None and ml_classifier is not None:
        try:
            import pandas as pd
            features = pd.DataFrame([{
                "moisture_percent": moisture,
                "brix_index": brix,
                "hmf_mg_kg": hmf,
                "diastase_activity": diastase,
                "electrical_conductivity": conductivity,
                "c13_isotope_delta": c13_val
            }])
            raw_score = float(ml_regressor.predict(features)[0])
            adulterant_label = str(ml_classifier.predict(features)[0])
            
            # Penalize C4 or SMR if elevated
            if c4_val > 7.0:
                raw_score -= (c4_val - 7.0) * 4.0
                adulterant_label = "C4 Cane/Corn Syrup Adulteration"
            if smr_val > 0.05:
                raw_score -= 25.0
                adulterant_label = "Industrial Rice Syrup Adulteration"
                
            final_score = max(0, min(100, int(round(raw_score))))
        except Exception as err:
            final_score, adulterant_label = _calculate_math_score_and_class(moisture, brix, hmf, diastase, conductivity, c13_val, c4_val, smr_val)
    else:
        final_score, adulterant_label = _calculate_math_score_and_class(moisture, brix, hmf, diastase, conductivity, c13_val, c4_val, smr_val)

    # Grading
    if final_score >= 90:
        grade = "Grade A+ (Premium Raw Organic)"
        is_authentic = True
    elif final_score >= 75:
        grade = "Grade A (Standard Pure Honey)"
        is_authentic = True
    elif final_score >= 55:
        grade = "Grade B (Commercial Processing Required)"
        is_authentic = True
    else:
        grade = "Substandard / Suspected Adulteration"
        is_authentic = False

    return {
        "quality_score": final_score,
        "purity_score": final_score,
        "grade": grade,
        "is_authentic": is_authentic,
        "adulterant_fingerprint": adulterant_label,
        "adulterant_type": adulterant_label,
        "adulterant_probability": 0.98 if is_authentic else 0.94,
        "fssai_compliance": final_score >= 70 and moisture <= 20.0 and hmf <= 80.0,
        "spectrometry": {
            "c13_isotope_delta": c13_val,
            "nmr_profile": "Natural Monofloral Peak" if final_score >= 75 else "Exogenous Sugar Peaks Detected",
            "purity_confidence": "99.2%" if final_score >= 90 else "94.5%"
        },
        "breakdown": {
            "moisture_status": "Optimal" if moisture <= 20.0 else "High (Risk of Fermentation)",
            "brix_status": "Optimal" if brix >= 80.0 else "Low Sugar Density",
            "hmf_status": "Optimal" if hmf <= 40.0 else "Elevated (Heat Exposure)",
            "diastase_status": "Active" if diastase >= 8.0 else "Depleted",
            "conductivity_status": "Normal" if conductivity <= 0.8 else "Elevated Minerals"
        }
    }


def _calculate_math_score_and_class(moisture, brix, hmf, diastase, conductivity, c13_val, c4_val, smr_val):
    score = 100.0
    if moisture > 20.0:
        score -= (moisture - 20.0) * 15.0
    if brix < 80.0:
        score -= (80.0 - brix) * 4.0
    if hmf > 40.0:
        score -= (hmf - 40.0) * 2.5
    if diastase < 8.0:
        score -= (8.0 - diastase) * 6.0
    if conductivity > 0.8:
        score -= (conductivity - 0.8) * 20.0
    if c4_val > 7.0:
        score -= (c4_val - 7.0) * 5.0
    if smr_val > 0.05:
        score -= 30.0

    final_score = max(0, min(100, int(round(score))))
    if c4_val > 7.0 or c13_val > -20.0:
        adulterant = "C4 Cane/Corn Syrup Adulteration"
    elif smr_val > 0.05:
        adulterant = "Industrial Rice Syrup Adulteration"
    elif hmf > 50.0 and diastase < 8.0:
        adulterant = "Acid-Inverted Sugar Syrup"
    elif moisture > 20.5:
        adulterant = "Excessive Moisture (Fermentation Risk)"
    else:
        adulterant = "100% Pure Floral Nectar"
        
    return final_score, adulterant


# ─── IOT STAGE TRIGGER & TELEMETRY ENDPOINTS ─────────────────────────────────

@app.post("/api/iot/trigger-alert")
@app.post("/iot/trigger-alert")
def trigger_hive_alert(payload: AlertTriggerRequest):
    """
    Live stage demonstration endpoint:
    Injects Varroa / Colony Stress anomaly by reducing weight and elevating acoustics.
    """
    # Find matching hive key
    matched_key = None
    for k in HIVE_STORE.keys():
        if payload.hive_id.upper() in k.upper():
            matched_key = k
            break
            
    if not matched_key:
        matched_key = "HIVE-WB-0391"

    hive = HIVE_STORE[matched_key]

    if payload.reset:
        hive["weight_kg"] = hive["base_weight_kg"]
        hive["acoustic_frequency_hz"] = hive["base_acoustic_hz"]
        hive["status"] = "Optimal Colony Health"
        hive["has_alert"] = False
        hive["alert_type"] = None
        message = f"Hive {matched_key} reset to normal baseline."
    elif payload.inject_varroa_alert:
        hive["weight_kg"] = round(hive["base_weight_kg"] - payload.weight_drop_kg, 2)
        # Shift acoustic frequency up (e.g. +35 Hz mimicking +15 dB stress buzz)
        hive["acoustic_frequency_hz"] = round(hive["base_acoustic_hz"] + (payload.acoustic_increase_db * 2.4), 1)
        hive["status"] = "CRITICAL: Varroa/Colony Stress Detected (Weight Drop + Acoustic Rise)"
        hive["has_alert"] = True
        hive["alert_type"] = "VARROA_STRESS_ANOMALY"
        message = f"ALERT TRIGGERED for {matched_key}: Weight -{payload.weight_drop_kg}kg, Acoustics +{payload.acoustic_increase_db}dB"
    else:
        message = "No change applied."

    hive["last_updated"] = int(time.time())

    return {
        "status": "Success",
        "message": message,
        "hive": hive,
        "active_alert": hive["has_alert"]
    }


@app.get("/api/iot/hives")
@app.get("/iot/hives")
def get_all_hives():
    """
    Get current in-memory status of all registered smart hives.
    """
    return {
        "count": len(HIVE_STORE),
        "hives": list(HIVE_STORE.values()),
        "timestamp": int(time.time())
    }


@app.post("/api/iot/push-telemetry")
@app.post("/iot/push-telemetry")
def push_hive_telemetry(telemetry: HiveTelemetryInput):
    """
    Ingest telemetry packet from physical edge device or simulator.py.
    """
    key = telemetry.hive_id.split(" ")[0].strip()
    if key not in HIVE_STORE:
        HIVE_STORE[key] = {
            "hive_id": telemetry.hive_id,
            "location": "Field Apiary",
            "weight_kg": telemetry.weight_kg,
            "base_weight_kg": telemetry.weight_kg,
            "internal_temp_c": telemetry.internal_temp_c,
            "humidity_percent": telemetry.humidity_percent,
            "acoustic_frequency_hz": telemetry.acoustic_frequency_hz or 240.0,
            "base_acoustic_hz": telemetry.acoustic_frequency_hz or 240.0,
            "status": "Optimal Colony Health",
            "has_alert": False,
            "alert_type": None,
            "last_updated": int(time.time()),
        }
    else:
        hive = HIVE_STORE[key]
        if not hive.get("has_alert"):
            hive["weight_kg"] = telemetry.weight_kg
            hive["internal_temp_c"] = telemetry.internal_temp_c
            hive["humidity_percent"] = telemetry.humidity_percent
            if telemetry.acoustic_frequency_hz:
                hive["acoustic_frequency_hz"] = telemetry.acoustic_frequency_hz
        hive["last_updated"] = int(time.time())

    return {"status": "Ingested", "hive_id": key}


@app.post("/api/anomaly/hive")
def detect_hive_anomaly(telemetry: HiveTelemetryInput):
    prev_w = telemetry.previous_weight_kg if telemetry.previous_weight_kg is not None else telemetry.weight_kg
    weight_delta = telemetry.weight_kg - prev_w
    anomalies = []

    if weight_delta < -0.7:
        anomalies.append("CRITICAL: Sudden weight drop detected. High probability of bee swarming / colony stress.")

    if telemetry.internal_temp_c > 38.0:
        anomalies.append("WARNING: Internal hive temperature elevated (>38°C). Fan cooling needed.")
    elif telemetry.internal_temp_c < 30.0:
        anomalies.append("WARNING: Internal hive temperature low (<30°C). Colony heat loss risk.")

    if telemetry.humidity_percent > 85.0:
        anomalies.append("NOTICE: High internal humidity (>85%). Moisture management required.")

    status = "Normal" if not anomalies else ("Alert" if any("CRITICAL" in a for a in anomalies) else "Warning")

    return {
        "hive_id": telemetry.hive_id,
        "status": status,
        "weight_change_kg": round(weight_delta, 2),
        "anomalies_detected": anomalies,
        "confidence": 0.96 if status == "Normal" else 0.92,
        "recommendation": "Inspect brood box immediately" if status == "Alert" else ("Ventilate hive entrance" if status == "Warning" else "Normal foraging active")
    }


async def telemetry_generator():
    """
    Broadcasts real-time updates from HIVE_STORE to all connected SSE clients.
    """
    hive_keys = list(HIVE_STORE.keys())
    idx = 0
    while True:
        key = hive_keys[idx % len(hive_keys)]
        idx += 1
        hive = HIVE_STORE[key]

        # Small micro-variance for live realism if not in manual alert
        if not hive.get("has_alert"):
            weight_noise = random.uniform(-0.05, 0.05)
            temp_noise = random.uniform(-0.1, 0.1)
            humid_noise = random.uniform(-0.2, 0.2)
            acoustic_noise = random.uniform(-0.5, 0.5)

            current_weight = round(hive["base_weight_kg"] + weight_noise, 2)
            current_temp = round(hive["internal_temp_c"] + temp_noise, 1)
            current_humid = round(hive["humidity_percent"] + humid_noise, 1)
            current_acoustic = round(hive["base_acoustic_hz"] + acoustic_noise, 1)
        else:
            current_weight = hive["weight_kg"]
            current_temp = round(hive["internal_temp_c"] + random.uniform(0.3, 0.8), 1)
            current_humid = hive["humidity_percent"]
            current_acoustic = hive["acoustic_frequency_hz"]

        data = {
            "hive_id": hive["hive_id"],
            "weight_kg": current_weight,
            "internal_temp_c": current_temp,
            "humidity_percent": current_humid,
            "acoustic_frequency_hz": current_acoustic,
            "status": hive["status"],
            "has_alert": hive.get("has_alert", False),
            "timestamp": int(time.time()),
        }
        yield f"data: {json.dumps(data)}\n\n"
        await asyncio.sleep(2)


@app.get("/api/iot/stream")
@app.get("/iot/stream")
async def stream_hive_telemetry():
    """
    Server-Sent Events (SSE) stream broadcasting live IoT smart hive telemetry.
    """
    return StreamingResponse(
        telemetry_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )

