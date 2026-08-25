import time
import random
import json
import requests

AI_SERVICE_URL = "http://localhost:8000/api/anomaly/hive"

HIVEDATA = [
    {"hive_id": "HIVE-RJ-101", "location": "Jaipur, Rajasthan", "base_weight": 45.0},
    {"hive_id": "HIVE-WB-202", "location": "Sundarbans, West Bengal", "base_weight": 38.5},
    {"hive_id": "HIVE-JK-303", "location": "Anantnag, Kashmir", "base_weight": 52.0},
]

def generate_telemetry(hive):
    weight_variance = random.uniform(-0.3, 0.4)
    if random.random() < 0.05: # 5% chance of swarming event simulation
        weight_variance = -2.2

    temp = round(34.5 + random.uniform(-2.0, 4.5), 1)
    humidity = round(65.0 + random.uniform(-10.0, 22.0), 1)
    current_weight = round(hive["base_weight"] + weight_variance, 2)
    previous_weight = round(hive["base_weight"], 2)
    hive["base_weight"] = current_weight

    return {
        "hive_id": hive["hive_id"],
        "weight_kg": current_weight,
        "previous_weight_kg": previous_weight,
        "internal_temp_c": temp,
        "humidity_percent": humidity
    }

def main():
    print("🐝 Starting HoneyChain IoT Hive Telemetry Simulator...")
    print(f"📡 Target Endpoint: {AI_SERVICE_URL}")
    print("---------------------------------------------------------")

    while True:
        for hive in HIVEDATA:
            telemetry = generate_telemetry(hive)
            print(f"[SEND] Hive: {telemetry['hive_id']} | Weight: {telemetry['weight_kg']}kg | Temp: {telemetry['internal_temp_c']}°C | Humid: {telemetry['humidity_percent']}%")
            
            try:
                res = requests.post(AI_SERVICE_URL, json=telemetry, timeout=3)
                if res.status_code == 200:
                    data = res.json()
                    status = data.get("status")
                    if status != "Normal":
                        print(f"   🚨 ALERT from AI Service: {data.get('anomalies_detected')}")
            except Exception as e:
                print(f"   ⚠️ Could not reach AI service at {AI_SERVICE_URL} (Is FastAPI running?)")

            time.sleep(2)
        print("---------------------------------------------------------")
        time.sleep(5)

if __name__ == "__main__":
    main()
