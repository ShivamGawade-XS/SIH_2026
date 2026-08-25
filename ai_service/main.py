from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import time

app = FastAPI(
    title="HoneyChain AI Microservice",
    description="FSSAI-compliant Honey Quality Scoring & Hive Anomaly Detection Model for SIH 2026",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HoneyQualityInput(BaseModel):
    moisture_percent: float = Field(..., example=17.5, description="Moisture percentage (FSSAI max 20%)")
    brix_index: float = Field(..., example=81.2, description="Brix refractometer reading (Ideal > 80)")
    hmf_mg_kg: float = Field(..., example=12.4, description="Hydroxymethylfurfural content (Max 40 mg/kg)")
    diastase_activity: float = Field(..., example=14.0, description="Diastase activity index (Min 8.0)")
    electrical_conductivity: float = Field(..., example=0.45, description="mS/cm reading")

class HiveTelemetryInput(BaseModel):
    hive_id: str = Field(..., example="HIVE-RJ-102")
    weight_kg: float = Field(..., example=42.5)
    previous_weight_kg: float = Field(..., example=45.0)
    internal_temp_c: float = Field(..., example=35.2)
    humidity_percent: float = Field(..., example=62.0)

@app.get("/")
def health_check():
    return {
        "service": "HoneyChain AI Microservice",
        "status": "Online",
        "timestamp": int(time.time()),
        "ps_id": "SIH26021"
    }

@app.post("/api/quality/predict")
def predict_honey_quality(data: HoneyQualityInput):
    """
    Calculate FSSAI-aligned Honey Quality Score (0-100) and grade assignment.
    """
    score = 100.0

    # Moisture Penalty (>20% fails FSSAI standard)
    if data.moisture_percent > 20.0:
        score -= (data.moisture_percent - 20.0) * 15.0
    elif data.moisture_percent < 16.0:
        score -= 5.0 # Extremely low moisture penalty

    # Brix Index (<80 penalized)
    if data.brix_index < 80.0:
        score -= (80.0 - data.brix_index) * 4.0

    # HMF Content (>40 indicates heat damage / adulteration)
    if data.hmf_mg_kg > 40.0:
        score -= (data.hmf_mg_kg - 40.0) * 2.5

    # Diastase activity (<8 indicates excessive heating/adulteration)
    if data.diastase_activity < 8.0:
        score -= (8.0 - data.diastase_activity) * 6.0

    final_score = max(0, min(100, int(round(score))))

    # Grading
    if final_score >= 85:
        grade = "Grade A+ (Premium Raw Organic)"
        is_authentic = True
    elif final_score >= 70:
        grade = "Grade A (Standard Pure Honey)"
        is_authentic = True
    elif final_score >= 50:
        grade = "Grade B (Commercial Processing Required)"
        is_authentic = True
    else:
        grade = "Substandard / Suspected Adulteration"
        is_authentic = False

    return {
        "quality_score": final_score,
        "grade": grade,
        "is_authentic": is_authentic,
        "fssai_compliance": final_score >= 70,
        "breakdown": {
            "moisture_status": "Optimal" if data.moisture_percent <= 20.0 else "High (Risk of Fermentation)",
            "brix_status": "Optimal" if data.brix_index >= 80.0 else "Low Sugar Density",
            "hmf_status": "Optimal" if data.hmf_mg_kg <= 40.0 else "Elevated (Heat Exposure)",
            "diastase_status": "Active" if data.diastase_activity >= 8.0 else "Depleted"
        }
    }

@app.post("/api/anomaly/hive")
def detect_hive_anomaly(telemetry: HiveTelemetryInput):
    """
    Detect hive swarming, colony collapse, or temperature stress from sensor telemetry.
    """
    weight_delta = telemetry.weight_kg - telemetry.previous_weight_kg
    anomalies = []

    # Sudden weight drop (>1.5 kg in short duration) = Swarming Event
    if weight_delta < -1.5:
        anomalies.append("CRITICAL: Sudden weight drop detected. High probability of bee swarming.")

    # High internal temp (>38°C) = Hive Overheating / Stress
    if telemetry.internal_temp_c > 38.0:
        anomalies.append("WARNING: Internal hive temperature elevated (>38°C). Fan cooling needed.")
    elif telemetry.internal_temp_c < 30.0:
        anomalies.append("WARNING: Internal hive temperature low (<30°C). Colony heat loss risk.")

    # High humidity (>85%) = Mold / Varroa mite environment
    if telemetry.humidity_percent > 85.0:
        anomalies.append("NOTICE: High internal humidity (>85%). Moisture management required.")

    status = "Normal" if not anomalies else ("Alert" if any("CRITICAL" in a for a in anomalies) else "Warning")

    return {
        "hive_id": telemetry.hive_id,
        "status": status,
        "weight_change_kg": round(weight_delta, 2),
        "anomalies_detected": anomalies,
        "recommendation": "Inspect brood box immediately" if status == "Alert" else "Routine maintenance"
    }
