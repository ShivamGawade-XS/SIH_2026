import time
import secrets
import json
import requests

AI_BASE_URL = "http://localhost:8000"
ANOMALY_URL = f"{AI_BASE_URL}/api/anomaly/hive"
TELEMETRY_URL = f"{AI_BASE_URL}/api/iot/push-telemetry"

def secure_uniform(a: float, b: float) -> float:
    """Cryptographically secure uniform float in range [a, b]"""
    rnd = secrets.randbelow(10000) / 10000.0
    return a + (b - a) * rnd

HIVEDATA = [
    {
        "hive_id": "HIVE-WB-0391",
        "full_name": "HIVE-WB-0391 (Sundarbans Delta - Stage Demo)",
        "location": "Sundarbans, West Bengal",
        "base_weight": 45.2,
        "base_acoustic": 235.0
    },
    {
        "hive_id": "HIVE-RJ-101",
        "full_name": "HIVE-RJ-101 (Alwar Mustard Valley)",
        "location": "Alwar, Rajasthan",
        "base_weight": 46.8,
        "base_acoustic": 240.0
    },
    {
        "hive_id": "HIVE-JK-303",
        "full_name": "HIVE-JK-303 (Kashmir Acacia Apiary)",
        "location": "Anantnag, Kashmir",
        "base_weight": 52.1,
        "base_acoustic": 228.0
    },
    {
        "hive_id": "HIVE-BH-088",
        "full_name": "HIVE-BH-088 (Muzaffarpur Litchi Orchard)",
        "location": "Muzaffarpur, Bihar",
        "base_weight": 43.4,
        "base_acoustic": 244.0
    },
]

def generate_telemetry(hive):
    weight_variance = secure_uniform(-0.15, 0.2)
    # Rare swarming/stress event simulation (2% chance) using cryptographically secure RNG
    if secrets.randbelow(100) < 2:
        weight_variance = -1.8

    temp = round(34.5 + secure_uniform(-0.8, 1.2), 1)
    humidity = round(62.0 + secure_uniform(-4.0, 5.0), 1)
    acoustic = round(hive["base_acoustic"] + secure_uniform(-2.0, 3.0), 1)
    current_weight = round(hive["base_weight"] + weight_variance, 2)
    previous_weight = round(hive["base_weight"], 2)

    return {
        "hive_id": hive["full_name"],
        "weight_kg": current_weight,
        "previous_weight_kg": previous_weight,
        "internal_temp_c": temp,
        "humidity_percent": humidity,
        "acoustic_frequency_hz": acoustic
    }

def main():
    print("🐝 Starting HoneyChain IoT Hive Telemetry Simulator...")
    print(f"📡 Target Endpoints: {TELEMETRY_URL} & {ANOMALY_URL}")
    print("------------------------------------------------------------------------")

    while True:
        for hive in HIVEDATA:
            telemetry = generate_telemetry(hive)
            print(f"[SEND] Hive: {hive['hive_id']} | Weight: {telemetry['weight_kg']}kg | Temp: {telemetry['internal_temp_c']}°C | Humid: {telemetry['humidity_percent']}% | Acoustic: {telemetry['acoustic_frequency_hz']}Hz")
            
            try:
                # 1. Push directly to shared in-memory telemetry store
                requests.post(TELEMETRY_URL, json=telemetry, timeout=3)
                
                # 2. Query anomaly engine
                res_anom = requests.post(ANOMALY_URL, json=telemetry, timeout=3)
                if res_anom.status_code == 200:
                    data = res_anom.json()
                    status = data.get("status")
                    if status != "Normal":
                        print(f"   🚨 ALERT from Anomaly Engine: {data.get('anomalies_detected')}")
            except Exception as e:
                print(f"   ⚠️ Could not reach AI service at {AI_BASE_URL} (Is FastAPI running on :8000?)")

            time.sleep(2)
        print("------------------------------------------------------------------------")
        time.sleep(4)

if __name__ == "__main__":
    main()
