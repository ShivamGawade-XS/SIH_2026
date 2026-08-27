# 🎬 HoneyChain by TrueTag — SIH 2026 Grand Finale Demo & Pitch Script
**Problem Statement**: SIH26021 | **Ministry**: Ministry of MSME (KVIC) & National Bee Board  
**Platform**: TrueTag Universal Authentication Engine  
**Lead Contributor**: [Shivam Gawade](https://github.com/ShivamGawade-XS) ([@ShivamGawade-XS](https://github.com/ShivamGawade-XS))

---

## ⚡ 60-Second Minister / Evaluator Elevator Pitch
> *"When an Indian beekeeper harvests raw honey, a KVIC field officer mints a tamper-proof certificate on the Polygon blockchain. Every jar gets a unique TrueTag micro-QR seal. Any consumer scans it with their phone camera to instantly see who harvested it, where, when, and what the AI purity score is. Nobody can fake it or alter lab data — it is cryptographically anchored. When fraud or tampering is suspected, supervisors flag and recall batches across India in real-time without erasing audit history. That's HoneyChain."*

---

## 🕒 5-Minute Grand Finale Judge Demonstration Choreography

| Timestamp | Screen / Stage Action | What You Say & Demonstrate | Judge Impact |
|---|---|---|---|
| **00:00–00:30** | **Physical Jar Prop & Camera Scan** | Hand physical honey jar with TrueTag micro-QR to judge. Open `/verify`, click **"Scan Jar With Camera"** (or scan `TT-2026-00001`). Instant redirect to Batch #1. | 🎯 Tangible proof. Eliminates "just another screen demo" bias. |
| **00:30–01:15** | **Consumer Provenance & GI Heritage** | Walk through verified card: Rajesh Kumar Verma (Muzaffarpur Shahi Litchi GI Honey), 94/100 Purity Score, FSSAI IS 4941 compliance, and click **"GI-Tag Heritage Dossier"** badge. | 🛡️ Connects directly to national GI-tagging & rural biodiversity initiatives. |
| **01:15–01:45** | **Direct UPI Beekeeper Micro-Patronage** | Click **"Tip Beekeeper (Direct UPI)"**. Show dynamic UPI QR (0% platform cut) for instant direct farmer remittance to `rajesh.verma@sbi`. | 💰 Proves direct financial inclusion & beekeeper income multiplication. |
| **01:45–02:30** | **Offline Rural SMS / USSD Verification** | Switch to `/verify` ➔ **"Offline SMS / USSD Mode"**. Simulate texting `VERIFY TT-2026-00001` to `56767` in Hindi/English. Instant carrier SMS reply renders on retro Nokia UI! | 📱 Solves the non-smartphone / rural elder access critique 100%. |
| **02:30–03:15** | **Field Minting & AI Lab Spectrometry** | Click **"Field Officer"** ➔ **"Mint Batch"** (`/dashboard/mint`). Then switch to **"Lab Analyst"** (`/dashboard/quality`) to adjust Moisture/HMF/Isotopes & render real-time 400 MHz 1H-NMR resonance curve. | 🔬 Technical depth. Physics-calibrated anti-adulteration engine. |
| **03:15–04:00** | **APEDA & EU Export Consignment Passport** | Click **"APEDA Export Passport"** in `/dashboard/reports` or `/verify/1`. Download official PDF with EA-IRMS carbon isotope matrix & USFDA/EU compliance seals. | 🌍 Proves massive B2B export monetization (80% of India's honey revenue). |
| **04:00–04:35** | **Admin Emergency Recall & Live Cross-Tab Sync** | Switch to **"System Admin"** (`/dashboard/admin`). Open Batch #1 in another tab. Click **"Emergency Revoke"** with custom modal. Batch in consumer tab turns **REVOKED** instantly via BroadcastChannel! | ⚡ Zero-delay food safety enforcement. |
| **04:35–05:00** | **Live IoT Telemetry & Stage Alert Injection** | Point to Live Telemetry Stream card. Send alert POST `/api/iot/trigger-alert` for `HIVE-WB-0391`. Telemetry tile flashes **CRITICAL COLONY STRESS / VARROA ANOMALY** live! | 🐝 Complete hardware-to-consumer loop. |

---

## 🍯 Physical Prop Setup Instructions (50 INR Preparation)
1. **Purchase**: A standard 250g/500g glass honey jar (Dabur, Patanjali, or raw honey).
2. **Label**: Print the TrueTag label sheet from `/dashboard/qr`.
3. **QR Token**: Use `TT-2026-00001` (Muzaffarpur Litchi Honey) or `TT-2026-00002` (Sundarbans Mangrove).
4. **Tape/Stick**: Affix the tamper-evident micro-QR over the lid seal.
5. **Stage Test**: Point phone camera or laptop camera via `/verify` -> immediately opens Rajesh Kumar Verma's provenance profile.

---

## ✈️ "Airplane Mode" Zero-Failure Protocol
If the hackathon venue has slow or dropping WiFi:
- **Local Fallback**: The Next.js client and FastAPI service have in-memory and local registry fallbacks with 4-second timeout protection.
- **Contract Calls**: If Polygon Amoy testnet RPC takes >4s, the frontend automatically serves cached verified batch state without freezing.
- **AI Service**: If port 8000 is unreachable, the Next.js `/api/quality/predict` executes the built-in FSSAI IS 4941 physics-based rule engine.
- **Swagger Docs**: Keep `http://localhost:8000/docs` open in another tab to prove live REST microservice architecture.

---

## 🛠️ How to Run the Entire Suite Locally

### 1. Smart Contracts (Hardhat)
```bash
cd contracts
npm install
npx hardhat test      # Runs all 32 unit tests (100% pass)
```

### 2. Next.js 14 Frontend Portal
```bash
cd frontend
npm install
npm run dev           # Opens on http://localhost:3000
```

### 3. FastAPI AI Quality & IoT Engine
```bash
cd ai_service
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 4. IoT Telemetry Edge Simulator
```bash
cd iot_simulator
python simulator.py
```

---

## 🏆 Key SIH 2026 Differentiators & Judge Defense Points
1. **Zero Consumer Friction**: Consumers scan via standard camera without installing Web3 wallets or paying gas fees.
2. **Non-Destructive Dispute Governance**: District supervisors flag fraud without deleting on-chain history, maintaining immutable audit trails.
3. **FSSAI Gazette Alignment**: Anti-adulteration algorithms conform to Gazette of India IS 4941:2020 and EA-IRMS carbon isotope benchmarks.
4. **B2B / Regulatory Revenue Model**: Private honey brands (Dabur, Apis, Patanjali) pay SaaS compliance fees for KVIC certification; KVIC absorbs beekeeper fees.

