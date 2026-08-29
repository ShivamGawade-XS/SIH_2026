# 📡 HoneyChain IoT Telemetry Simulator & Stage Controller

> **Part of the HoneyChain by TrueTag Ecosystem**  
> **Team:** Crimson Syndicate (CS Syndicate)  
> **Smart India Hackathon (SIH) 2026** | **Problem Statement:** SIH26021  

---

## 🐝 Overview

The **HoneyChain IoT Telemetry Simulator** simulates real-time smart hive sensor streams (weight, temperature, humidity, and acoustic frequency in Hz). It feeds live telemetry into the Next.js dashboard via Server-Sent Events (SSE) and webhook triggers.

---

## 👥 Authors & Contributors — Team Crimson Syndicate (CS Syndicate)

- **Shivam Gawade**
- **Rahul Rathod**
- **Rehan Harmalkar**
- **Avneesh Walwalkar**
- **Sunehri Sonar**
- **Shaunak Pai**

---

## 🎮 Stage Demonstration Controller

The platform includes a 100% software digital twin controller accessible from the floating **"Stage IoT"** button on the dashboard:

```text
  [Stage IoT Controller]
            │
            ├─► "⚡ Trigger Live Varroa Alert"
            │    • Drops hive weight (-0.85 kg)
            │    • Spikes acoustic frequency to 385 Hz
            │    • Sets status to CRITICAL (Red)
            │
            └─► "🔄 Reset Hive to Optimal"
                 • Restores baseline 235 Hz healthy hum
                 • Sets status to OPTIMAL (Green)
```

---

## 🔌 Hardware Integration (ESP32 / LoRaWAN)

For physical deployments post-SIH, any ESP32 with load cell (HX711) and acoustic microphone (INMP441) can POST telemetry payloads directly to the FastAPI `/api/iot/trigger-alert` endpoint with zero changes needed to the frontend.
