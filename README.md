# 🍯 HoneyChain by TrueTag

## Smart India Hackathon (SIH) 2026 — Problem Statement: SIH26021

### Sovereign Blockchain Honey Traceability, Physicochemical AI Quality Verification & Apiculture Platform

[![SIH 2026](https://img.shields.io/badge/SIH-2026-orange.svg?style=for-the-badge)](https://sih.gov.in)
[![PS ID SIH26021](https://img.shields.io/badge/PS_ID-SIH26021-blue.svg?style=for-the-badge)](https://sih.gov.in)
[![Ministry](https://img.shields.io/badge/Ministry-MSME%20--%20KVIC%20%26%20National%20Bee%20Board-green.svg?style=for-the-badge)](https://www.kvic.gov.in)
[![Live App](https://img.shields.io/badge/Live%20App-honeychain--truetag.vercel.app-gold.svg?style=for-the-badge)](https://honeychain-truetag.vercel.app)
[![Blockchain](https://img.shields.io/badge/Blockchain-Polygon%20Amoy%20(80002)-8247E5.svg?style=for-the-badge)](https://polygon.technology)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2016.3.4%20(TypeScript)-000000.svg?style=for-the-badge)](https://nextjs.org)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-FastAPI%20%2B%20Scikit--Learn%201.4-009688.svg?style=for-the-badge)](https://fastapi.tiangolo.com)
[![Hardhat Tests](https://img.shields.io/badge/Tests-73%20Passing-brightgreen.svg?style=for-the-badge)](./contracts/test)

---

**Team:** **Crimson Syndicate (CS Syndicate)**  
**Lead Contributor:** [Shivam Gawade](https://github.com/ShivamGawade-XS) ([@ShivamGawade-XS](https://github.com/ShivamGawade-XS))  
**Members:** Shivam Gawade · Rahul Rathod · Rehan Harmalkar · Avneesh Walwalkar · Sunehri Sonar · Shaunak Pai  

---

## 📌 Executive Summary

**HoneyChain** (developed by **Team Crimson Syndicate** under the **TrueTag** product framework) is a decentralized honey traceability, quality assurance, and rural apiculture platform built for the **Khadi and Village Industries Commission (KVIC)** and the **National Bee Board (Ministry of MSME & Ministry of Agriculture)**.

The platform bridges smallholder beekeepers with consumers by linking physical honey packaging to immutable Polygon PoS blockchain records (Amoy Testnet), Scikit-Learn physicochemical grading models (FSSAI IS 4941:2020), and real-time geo-velocity clone scan detection.

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  Beekeeper &    │  ───> │  IoT Telemetry  │  ───> │  Polygon PoS    │  ───> │  Consumer Scan  │
│  Registration   │       │  (Simulated)    │       │  Batch Minting  │       │  & Clone Check  │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

## ⚖️ Built vs Planned Features

| Feature / Subsystem | Status | Details & Implementation |
| :--- | :---: | :--- |
| **OpenZeppelin RBAC Smart Contract** | **BUILT** | `HoneyChain.sol` with `DEFAULT_ADMIN_ROLE`, `FIELD_OFFICER_ROLE`, `BEEKEEPER_ROLE`, `DISTRICT_SUPERVISOR_ROLE`. |
| **Field Officer Batch Minting** | **BUILT** | Restricted `mintBatch()` & `approveHarvestAndMint()`, duplicate ID blocking, registered farmer checks. |
| **Hardhat Automated Test Suite** | **BUILT** | **73 passing automated tests** across 4 test suites verifying all security controls and reverts. |
| **Adversarial Attack Demo Script** | **BUILT** | `contracts/scripts/attack-demo.js` testing 4 distinct attack vectors blocked on-chain. |
| **Consumer Verification Page** | **BUILT** | Next.js dynamic verification (`/verify/[batchId]`), Polygonscan transaction link, prominent red NOT FOUND state. |
| **Clone-Scan & Geo-Velocity Detection** | **BUILT** | Haversine distance engine flagging scans >500 km within 5 min, orange warning banner, demo location override (`?demoCity=`). |
| **FSSAI Physicochemical ML Quality** | **BUILT** | Scikit-Learn Random Forest regressor & classifier (`ai_service/train.py`) scoring moisture, Brix, HMF, diastase. |
| **Simulated IoT Hive Telemetry** | **BUILT (SIMULATED)** | Live SSE and local telemetry loop (`components/LiveTelemetryStream.tsx` & `iot_simulator/simulator.py`). |
| **Indic Multilingual Localization** | **BUILT** | UI localized across 5 Indic languages (English, Hindi, Bengali, Tamil, Kannada). |
| **ESP32 Physical Hive Hardware Kit** | **PLANNED** | Hardware blueprint with HX711 load cells, DHT22 sensors, and LoRaWAN field transmission. |
| **On-Chain Single-Use Scratch PIN Burn** | **PLANNED** | Physical under-cap scratch foil with on-chain cryptographic burn on first opening. |
| **2-of-3 Multi-Stakeholder Dispute Quorum** | **PLANNED** | Multi-sig smart contract consensus across KVIC, NABL lab, and beekeeper cooperative. |
| **Automated WhatsApp / SMS / USSD Gateway**| **PLANNED** | Full integration with telecom aggregators for feature-phone beekeeper submissions. |
| **Automated NABL Lab Spectrometer Pipeline**| **PLANNED** | Direct API hookups to commercial NMR / IRMS testing lab instruments. |
| **Polygon Mainnet Production Deployment** | **PLANNED** | Deployment to Polygon PoS mainnet (Chain ID 137) with subsidized enterprise relayer. |

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Blockchain** | Polygon PoS (Amoy Testnet — Chain ID: 80002) | EVM-compatible testnet for low-cost verifiable minting |
| **Smart Contracts** | Solidity 0.8.24 + Hardhat + OpenZeppelin v5.6.1 | Role-based access control, batch minting, custody tracking |
| **Frontend Framework**| Next.js 16.3.4 (TypeScript) + React 18 | Responsive mobile-first verification portal & dashboard |
| **Styling & Icons** | Vanilla CSS / Tailwind CSS + Lucide Icons | Minimalist UI with clear security indicators |
| **Machine Learning** | Python FastAPI + Scikit-Learn 1.4.0 (Random Forest) | Physicochemical quality scoring & adulterant classification |
| **Clone Detection** | Haversine Geo-Velocity Engine (TypeScript API) | Real-time multi-location clone replication detection |
| **Simulators** | Python 3 + React Component Loop | Simulated hive telemetry & LoRaWAN packet generation |

---

## 🚀 Run the Demo

### 1. Smart Contract Tests & Live Attack Simulation

```bash
cd contracts
npm install

# Run complete Hardhat test suite (73 passing tests)
npx hardhat test

# Run live on-chain attack simulation (demonstrates 4 blocked attack vectors)
npx hardhat run scripts/attack-demo.js
```

### 2. Clone-Detection Unit Tests

```bash
cd frontend
npm install

# Run unit tests for Haversine distance and 500km/5min velocity anomaly engine
npx tsx src/lib/clone-detection.test.ts
```

### 3. Start Frontend Local Web App

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Verified Demo Batch #1**: [http://localhost:3000/verify/1](http://localhost:3000/verify/1)
- **Verified Demo Batch #2**: [http://localhost:3000/verify/2](http://localhost:3000/verify/2)
- **Clone Detection Demo**: [http://localhost:3000/verify/1?demoCity=Delhi](http://localhost:3000/verify/1?demoCity=Delhi), followed by [http://localhost:3000/verify/1?demoCity=Mumbai](http://localhost:3000/verify/1?demoCity=Mumbai)
- **Not Found State Demo**: [http://localhost:3000/verify/999](http://localhost:3000/verify/999)

### 4. Deploying & Seeding to Polygon Amoy Testnet (Optional)

```bash
cd contracts

# Set your PRIVATE_KEY in contracts/.env
npx hardhat run scripts/deploy.js --network amoy

# Seed 2 demo beekeepers and 2 demo batches on-chain
npx hardhat run scripts/seed.js --network amoy
```

---

## 👥 Authors & Contributors — Team Crimson Syndicate

* **Shivam Gawade** — Team Lead · Full-Stack Web3, Smart Contracts & System Architecture
* **Rahul Rathod** — Backend Architecture & Database Models
* **Rehan Harmalkar** — Smart Contract Access Control & Hardhat Test Engineering
* **Avneesh Walwalkar** — Machine Learning Pipeline & FSSAI Dataset Training
* **Sunehri Sonar** — UI/UX Design & Indic Multilingual Localization
* **Shaunak Pai** — IoT Telemetry Architecture & Sensor Simulation

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
