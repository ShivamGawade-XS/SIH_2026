# 📄 Product Requirements Document (PRD)
## HoneyChain by TrueTag — Blockchain-Based Honey Traceability & Smart Beekeeping
### Smart India Hackathon (SIH) 2026 | Problem Statement: SIH26021
**Ministry**: Ministry of Micro, Small and Medium Enterprises (MSME) — KVIC & National Bee Board  
**Category**: Software  
**Lead Contributor**: [Shivam Gawade](https://github.com/ShivamGawade-XS) ([@ShivamGawade-XS](https://github.com/ShivamGawade-XS))  
**Version**: 1.0.0 (SIH 2026 Official Specification)

---

## 1. Executive Summary & Vision

### 1.1 Product Vision
**HoneyChain** (powered by the **TrueTag** authentication platform) is an end-to-end decentralized honey provenance, AI quality grading, and IoT hive intelligence ecosystem designed for the Khadi and Village Industries Commission (KVIC) and the National Bee Board.

### 1.2 The One-Line Pitch
> *"HoneyChain makes every jar of Indian honey scannable, blockchain-verified, and farmer-attributable — empowering beekeepers to prove authenticity, eliminate counterfeit sugar syrup, and earn premium GI-level pricing."*

### 1.3 Key Objectives (SIH 2026 Target)
1. **Zero-Friction Consumer Verification**: Scan a physical honey jar QR code and render complete tamper-proof blockchain provenance in **under 3 seconds** on any mobile browser (no app install required).
2. **Economic Upliftment for Beekeepers**: Enable smallholder beekeepers to increase income by **2x to 3x** per kg through verifiable origin attribution.
3. **Automated FSSAI Quality Grading**: Implement AI-driven scoring (0–100) based on moisture %, Brix index, HMF, and diastase parameters.
4. **Smart Apiary Monitoring**: Simulate real-time IoT hive telemetry (weight, temperature, humidity) to detect swarming risks and colony collapse.

---

## 2. Target Personas & User Journeys

| Persona | Role | Key Pain Points | Goals with HoneyChain |
|---|---|---|---|
| **Ramesh (Rural Beekeeper)** | Smallholder honey farmer (Sundarbans / Kashmir) | Sells at commodity rates (₹80–120/kg); cannot prove honey is genuine. | Direct digital identity; transparent batch logs; higher price realization. |
| **Pooja (KVIC Field Officer)** | Government cooperative inspector | Paper-based inspections; slow quality reporting; fraud in reporting. | Fast digital onboarding of apiaries; mobile batch minting on Polygon. |
| **Dr. Verma (Lab Quality Officer)** | FSSAI / NABL honey testing lab | Data tampering during transit; disconnected test reports. | Direct cryptographic anchoring of test parameters into batch tokens. |
| **Ananya (Urban Consumer)** | Health-conscious organic food buyer | Distrusts commercial honey brands due to 70–80% sugar adulteration reports. | Instant transparency: scan QR to see farmer photo, hive map, and purity score. |
| **KVIC Leadership** | MSME Policy & Mission Director | Counterfeit products damaging Indian GI brand value globally. | Scalable B2B traceability platform expanding to all 700+ Indian GI products. |

---

## 3. Core Functional Requirements (FR)

### Module 1: Farmer & Apiary Digital Identity
- **FR-1.1**: The system shall register beekeepers with Aadhaar-linked IDs, cooperative ID, name, photo, and geolocation coordinates.
- **FR-1.2**: KVIC field officers shall verify and approve registered beekeepers before harvest minting privileges are granted.
- **FR-1.3**: Farmer profile metadata shall be stored on IPFS and indexed via smart contract mapping.

### Module 2: IoT Hive Telemetry & Early Warning Engine
- **FR-2.1**: The system shall ingest live/simulated telemetry: Hive Weight (kg), Internal Temperature (°C), and Ambient Humidity (%).
- **FR-2.2**: The telemetry engine shall detect sudden weight drops (>1.5 kg in <2 hours) and flag an immediate **Bee Swarming Risk**.
- **FR-2.3**: Temperature anomalies (<30°C or >38°C) shall trigger an automated **Colony Stress Alert**.

### Module 3: Blockchain Batch Minting (Polygon PoS)
- **FR-3.1**: During harvest, authorized field officers shall create a new batch recording: Yield (kg), Harvest Date, Geolocation, Brix Index, and Moisture %.
- **FR-3.2**: Metadata JSON containing harvest logs and IoT summary shall be pinned to IPFS (via Pinata).
- **FR-3.3**: The smart contract (`HoneyChain.sol`) shall mint an immutable **Batch Token** storing the IPFS hash and quality score.

### Module 4: AI Honey Quality & Purity Scoring Engine
- **FR-4.1**: The FastAPI microservice shall evaluate input lab metrics against FSSAI honey standards:
  - Moisture Content (Max 20%)
  - Brix Refractometer Index (Optimal ≥ 80)
  - HMF - Hydroxymethylfurfural (Max 40 mg/kg)
  - Diastase Activity (Min 8.0 Schade units)
- **FR-4.2**: The engine shall output a normalized **Purity Score (0–100)** and assign quality tiers:
  - `Grade A+` (≥85): Premium Raw Organic
  - `Grade A` (70–84): Standard Pure Honey
  - `Grade B` (50–69): Commercial Processing Required
  - `Substandard` (<50): Suspected Adulteration
- **FR-4.3**: Scores shall be permanently linked to the blockchain batch record.

### Module 5: Dynamic QR Code & Jar Label Generator
- **FR-5.1**: For each minted batch, the system shall generate cryptographically unique QR codes mapping directly to the consumer verification URL.
- **FR-5.2**: The dashboard shall provide a one-click printable PDF label template formatted for standard honey packaging.

### Module 6: 3-Second Mobile Consumer Verification PWA
- **FR-6.1**: Mobile web page accessible via direct camera QR scan without app download.
- **FR-6.2**: The verification screen shall display:
  1. Producer Card: Farmer name, photo, cooperative badge, and interactive Leaflet map pin.
  2. Provenance Timeline: Hive harvest timestamp, processing date, bottling date.
  3. AI Quality Badge: Purity score (0–100), FSSAI compliance check, moisture & Brix readings.
  4. Blockchain Proof: Polygon transaction hash with direct link to Polygonscan explorer.
  5. Official KVIC / National Bee Board authenticity seal.

### Module 7: Supply Chain Custody Tracking
- **FR-7.1**: Supply chain participants (Processing Unit, Quality Lab, Distributor, Retailer) can append signed custody events (e.g., *Received*, *Pasteurized*, *Dispatched*).
- **FR-7.2**: All custody events are stored immutably on the smart contract timeline.

---

## 4. Non-Functional Requirements (NFR)

| Metric | Requirement | Target Metric |
|---|---|---|
| **Performance** | Consumer verification page load & render time | `< 2.0 seconds` |
| **Transaction Cost** | Gas cost per batch minted on Polygon PoS | `< ₹0.05 per tx` |
| **Security** | Zero exposed private keys; strict access control on minting functions | 100% environment-isolated secrets |
| **Usability** | Field officer mobile responsiveness on low-end smartphones | Works on 3G/4G networks |
| **Data Integrity** | Immutability of harvest history and lab quality data | 100% tamper-evident via Polygon & IPFS |
| **Compliance** | Standards alignment | FSSAI Honey Standards (2020), KVIC NBHM Guidelines |

---

## 5. SIH 2026 Evaluation Alignment (5 Judging Pillars)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SIH 2026 EVALUATION MATRIX                            │
├──────────────────────┬──────────────────────────────────────────────────────┤
│ 1. Innovation        │ Triple Convergence: Polygon Blockchain + AI ML + IoT │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ 2. Feasibility       │ Working EVM smart contracts + Next.js PWA + FastAPI  │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ 3. Social Impact     │ Direct rural beekeeper income upliftment (2x–3x)     │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ 4. Business Model    │ Scalable B2B SaaS for 700+ KVIC GI product lines     │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ 5. Demo Impact       │ Live on-stage physical QR scan verified in 3 seconds │
└──────────────────────┴──────────────────────────────────────────────────────┘
```

---

## 6. Release Milestones & Scope

- **Phase 1 (Foundation - Completed)**: Repository architecture, README, MIT License, Hardhat setup, and smart contract compilation.
- **Phase 2 (Core Development)**: Next.js frontend UI (Dashboard & Verify PWA), AI FastAPI scoring model, and IoT telemetry simulator.
- **Phase 3 (Integration & Verification)**: Smart contract deployment to Polygon Sepolia testnet, IPFS Pinata integration, and live QR verification testing.
- **Phase 4 (Demo Polish & Pitch Preparation)**: Physical jar QR demo kit, pitch deck alignment, and hackathon presentation delivery.
