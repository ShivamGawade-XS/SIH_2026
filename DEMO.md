# 🎬 HoneyChain by TrueTag — SIH 2026 Live Demo Script
**Problem Statement**: SIH26021 | **Ministry**: Ministry of MSME (KVIC) & National Bee Board  
**Platform**: TrueTag Universal Authentication Engine  
**Lead Contributor**: [Shivam Gawade](https://github.com/ShivamGawade-XS) ([@ShivamGawade-XS](https://github.com/ShivamGawade-XS))

---

## ⚡ 3-Minute Grand Finale Judge Pitch Flow

```
+────────────────────────+      +────────────────────────+      +────────────────────────+
|      STEP 1 (30s)      |      |      STEP 2 (60s)      |      |      STEP 3 (90s)      |
|  KVIC Officer Onboards | ───▶ |   Lab Spectrometry &   | ───▶ |   Consumer Scans QR    |
|   Farmer & Live Hive   |      |  AI Quality Purity Mint|      |  Verifies 100% Purity  |
+────────────────────────+      +────────────────────────+      +────────────────────────+
```

---

### 🟢 Step 1: KVIC Field Officer Registration (30 seconds)
1. Navigate to `/dashboard/login`.
2. Click the **"FIELD OFFICER — Dr. Ananya Ray"** 1-click login button.
3. Show the **Live Operations Dashboard**:
   - 14,240+ registered beekeepers across 18 states.
   - Real-time IoT hive telemetry cards fluctuating live (weight, temperature, humidity).
4. Click **"Register Beekeeper"** (`/dashboard/register`).
5. Demonstrate adding a new beekeeper (e.g., *Subhash Chander, Kashmir Valley*).
6. Click **"Register on HoneyChain"** — show confetti and immediate on-chain registration!

---

### 🟡 Step 2: AI Spectrometry & Polygon Batch Minting (60 seconds)
1. Click **"Mint Honey Harvest Batch"** (`/dashboard/mint`).
2. Demonstrate changing the lab parameters live:
   - **Moisture**: `17.8%` (FSSAI Max: 20%)
   - **Brix Sugar Index**: `81.2°Bx` (FSSAI Min: 65°Bx)
   - **HMF**: `16.4 mg/kg` (FSSAI Max: 80 mg/kg)
   - **Diastase Activity**: `18.0 DN` (FSSAI Min: 8 DN)
3. Notice the **Real-Time AI Spectrometry Score Card** computing live: **94/100 (Grade A+ Premium Raw Organic)**.
4. Click **"Mint Batch & Generate QR Token"**.
5. Show the generated Batch ID `#003`, QR Token `TT-2026-0000x`, and Polygon transaction hash!
6. Click **"Print QR Label Sheet"** (`/dashboard/qr`) to show printable tamper-evident sticker sheets.

---

### 🔵 Step 3: Consumer Verification Experience (90 seconds)
1. Click **"Open Consumer Verify View"** (or navigate to `/verify/1`).
2. Show the **Luxury/Editorial Consumer PWA**:
   - **Hero**: *"Verified. Pure. Yours."* with gold italic emphasis.
   - **Authenticity Seal**: Large gold checkmark, AI Purity Score **94/100**, FSSAI compliance badge.
   - **The Source (Beekeeper Profile)**: Hover over the beekeeper's portrait to demonstrate the smooth grayscale-to-color transition (1500ms cinematic motion), showing KVIC verification and fair-trade direct compensation.
   - **Harvest Telemetry**: Brix index, harvest date, moisture levels.
   - **AI Spectrometry Scorecard**: 4 interactive progress bars with FSSAI benchmark comparisons.
   - **Chain of Trust**: Polygon transaction hash (copyable), IPFS metadata CID, and step-by-step custody timeline.
   - **W3C Verifiable Credential**: Click **"Download W3C Certificate"** to export the standard JSON-LD certificate generated via the ZeroCert-adapted serialization engine.

---

## 🛠️ How to Run the Entire Suite Locally

### 1. Smart Contracts
```bash
cd contracts
npm install
npx hardhat test      # Runs all 25 unit tests (100% pass)
```

### 2. Next.js 14 Frontend Portal
```bash
cd frontend
npm install
npm run dev           # Opens on http://localhost:3000
```

### 3. FastAPI AI Quality Service
```bash
cd ai_service
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 4. IoT Telemetry Simulator
```bash
cd iot_simulator
python simulator.py
```

---

## 🏆 Key Differentiators for SIH 2026
1. **Zero Consumer Friction**: Consumers scan without needing MetaMask, gas fees, or wallet installation.
2. **Dual Verification**: Physical tamper-evident micro-QR + on-chain cryptographic anchoring.
3. **FSSAI Alignment**: Anti-adulteration AI models calibrated directly against India's food safety standards.
4. **Beekeeper Fair Trade**: Direct provenance links consumer payments to verified village beekeepers.
