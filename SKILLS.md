# 🧠 Skills & Open-Source Engineering Blueprint
## HoneyChain by TrueTag — SIH 2026 (Problem Statement: SIH26021)
**Ministry**: Ministry of MSME (KVIC) & National Bee Board  
**Platform**: TrueTag Universal Authentication Engine  
**Lead Contributor**: [Shivam Gawade](https://github.com/ShivamGawade-XS) ([@ShivamGawade-XS](https://github.com/ShivamGawade-XS))  
**Document Version**: 1.0.0

---

## 📌 Executive Summary

Building an award-winning, production-grade hackathon solution for **HoneyChain by TrueTag** requires a multidisciplinary engineering skill set spanning **Web3 smart contracts, full-stack React/Next.js, machine learning for food quality analytics, IoT telemetry simulation, and decentralized storage**.

This document serves as the **definitive engineering skills guide, open-source reference analysis, and technical cheat-sheet** required to develop, deploy, and demonstrate HoneyChain during SIH 2026.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              HONEYCHAIN SKILLS TAXONOMY                                 │
├──────────────────────────────┬─────────────────────────────┬────────────────────────────┤
│ 1. EVM Smart Contracts       │ 2. Web3 & Next.js 14 PWA    │ 3. AI / ML Food Science    │
│ (Solidity, Hardhat, Polygon) │ (Ethers.js, Tailwind, QR)   │ (FastAPI, Scikit, FSSAI)   │
├──────────────────────────────┼─────────────────────────────┼────────────────────────────┤
│ 4. IoT Telemetry Simulation  │ 5. Decentralized Storage    │ 6. Demo Engineering        │
│ (MQTT, Anomaly Algorithms)   │ (IPFS, Pinata, Metadata)    │ (Fail-safes, 3-sec verify) │
└──────────────────────────────┴─────────────────────────────┴────────────────────────────┘
```

---

## 1. Domain 1: EVM Smart Contract Engineering & Supply Chain Provenance

### 1.1 Core Competencies Needed
- **Solidity 0.8+ Security Patterns**: Reentrancy guards, custom errors, gas optimization, explicit visibility.
- **Role-Based Access Control (RBAC)**: Segregating permissions between KVIC Admin, Field Officers, Lab Analysts, and Beekeepers.
- **Supply Chain State Machine**: Modeling immutable custody state transitions (`Harvested` $\to$ `Tested` $\to$ `Processed` $\to$ `Dispatched` $\to$ `Retail`).
- **Batch Tokenization**: Mapping unique batch IDs to IPFS metadata CIDs and cryptographic QR tokens.

### 1.2 Open-Source Ecosystem & Reference Repositories
| Open-Source Project | Key Functionality to Leverage | Reference Link |
|---|---|---|
| **OpenZeppelin Contracts** | `AccessControl.sol`, `ReentrancyGuard.sol`, `Counters.sol` | [github.com/OpenZeppelin/openzeppelin-contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) |
| **Hardhat Framework** | Local test environment, script-based deployment to Polygon Sepolia | [github.com/NomicFoundation/hardhat](https://github.com/NomicFoundation/hardhat) |
| **EIP-712 Standard** | Gasless meta-transactions / typed structured data signing for field officers | [eips.ethereum.org/EIPS/eip-712](https://eips.ethereum.org/EIPS/eip-712) |

### 1.3 Practical Implementation Code Blueprint
```solidity
// Role-based custody logging snippet
import "@openzeppelin/contracts/access/AccessControl.sol";

contract HoneyChainCore is AccessControl {
    bytes32 public constant FIELD_OFFICER_ROLE = keccak256("FIELD_OFFICER_ROLE");
    bytes32 public constant LAB_ANALYST_ROLE = keccak256("LAB_ANALYST_ROLE");

    struct CustodyRecord {
        address actor;
        string facilityName;
        uint256 timestamp;
        string actionTaken;
    }

    mapping(uint256 => CustodyRecord[]) public batchCustody;

    function addCustodyEvent(
        uint256 batchId,
        string calldata facility,
        string calldata action
    ) external onlyRole(FIELD_OFFICER_ROLE) {
        batchCustody[batchId].push(CustodyRecord(msg.sender, facility, block.timestamp, action));
    }
}
```

---

## 2. Domain 2: Fullstack Next.js 14 & Mobile-First Web3 Frontend

### 2.1 Core Competencies Needed
- **Next.js 14 App Router**: Server Components (RSC) for instantaneous mobile consumer rendering; Client Components (`"use client"`) for interactive Web3 & camera access.
- **Web3 Integration (Ethers.js v6 / Viem)**: Reading contract state without requiring consumers to install MetaMask.
- **Client-Side QR Scanning & Generation**: Zero-latency in-browser camera scanning (`html5-qrcode`) with fallback file upload.
- **GIS Mapping (Leaflet.js)**: Rendering interactive map pins for apiary harvest locations without external paid API keys.
- **Mobile-First Glassmorphic Design**: Tailored Tailwind CSS tokens for responsive, high-contrast dark/light mode interfaces.

### 2.2 Open-Source Ecosystem & Libraries
| Library | Purpose | Reference Link |
|---|---|---|
| **Ethers.js (v6)** | Lightweight RPC queries for public consumer verification | [github.com/ethers-io/ethers.js](https://github.com/ethers-io/ethers.js) |
| **html5-qrcode** | Cross-platform HTML5 camera QR code scanner | [github.com/mebjas/html5-qrcode](https://github.com/mebjas/html5-qrcode) |
| **Leaflet.js + React-Leaflet** | Open-source mobile-responsive map visualization | [github.com/Leaflet/Leaflet](https://github.com/Leaflet/Leaflet) |
| **Lucide Icons** | Modern SVG icons for sensor telemetry, purity badges, and supply chain | [github.com/lucide-icons/lucide](https://github.com/lucide-icons/lucide) |
| **shadcn/ui** | Accessible, headless UI component primitives | [github.com/shadcn-ui/ui](https://github.com/shadcn-ui/ui) |

### 2.3 Instant Consumer Verification Flow (Zero-Wallet UX)
```typescript
// Read-only public provider: No MetaMask popup required for consumers
import { ethers } from "ethers";
import HoneyChainABI from "@/lib/HoneyChainABI.json";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-sepolia.polygon.technology";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

export async function getBatchPublicData(batchId: number) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, HoneyChainABI, provider);
  const batch = await contract.batches(batchId);
  const farmer = await contract.farmers(batch.farmerId);
  return { batch, farmer };
}
```

---

## 3. Domain 3: Machine Learning & Food Science Quality Analytics

### 3.1 Core Competencies Needed
- **FSSAI Food Safety Standards (Honey 2020)**: Understanding official regulatory thresholds:
  - Moisture Content: $\le 20.0\%$ (prevents fermentation by osmophilic yeasts).
  - Brix Refractometer Index: $\ge 80.0^\circ \text{Bx}$ (sugar density indicator).
  - Hydroxymethylfurfural (HMF): $\le 40.0\text{ mg/kg}$ (identifies artificial heating or old/degraded honey).
  - Diastase Activity: $\ge 8.0\text{ Schade units}$ (active natural enzymes).
  - Specific C4 Sugar Isotope testing detection logic.
- **Scikit-Learn ML Modeling**: Multi-variable random forest classifier and regression grading algorithm.
- **FastAPI Asynchronous Microservice**: Pydantic v2 data validation schemas and sub-50ms inference response times.

### 3.2 Open-Source Ecosystem & ML Tooling
| Library | Purpose | Reference Link |
|---|---|---|
| **FastAPI** | High-concurrency async REST API for real-time inference | [github.com/tiangolo/fastapi](https://github.com/tiangolo/fastapi) |
| **Scikit-Learn** | Food quality grading models & synthetic dataset generation | [github.com/scikit-learn/scikit-learn](https://github.com/scikit-learn/scikit-learn) |
| **Pydantic (v2)** | Strict typing & validation for lab sensor parameters | [github.com/pydantic/pydantic](https://github.com/pydantic/pydantic) |

### 3.3 Quality Scoring Mathematical Formulation
$$\text{Score} = 100 - \Delta_{\text{Moisture}} - \Delta_{\text{Brix}} - \Delta_{\text{HMF}} - \Delta_{\text{Diastase}}$$
Where:
- $\Delta_{\text{Moisture}} = \max(0, (\text{Moisture} - 20.0) \times 15.0)$
- $\Delta_{\text{Brix}} = \max(0, (80.0 - \text{Brix}) \times 4.0)$
- $\Delta_{\text{HMF}} = \max(0, (\text{HMF} - 40.0) \times 2.5)$
- $\Delta_{\text{Diastase}} = \max(0, (8.0 - \text{Diastase}) \times 6.0)$

---

## 4. Domain 4: IoT Edge Hive Telemetry & Anomaly Detection

### 4.1 Core Competencies Needed
- **Time-Series Telemetry Simulation**: Modeling weight variations (forage gain vs. honey extraction vs. swarm exodus), diurnal temperature swings, and humidity levels.
- **Heuristic Anomaly Detection**:
  - **Swarm Detection**: Sudden drop of $\ge 1.5\text{ kg}$ in $< 2\text{ hours}$.
  - **Colony Heat Stress**: Internal temperature $> 38.0^\circ\text{C}$ or $< 30.0^\circ\text{C}$.
  - **Humidity & Mold Risk**: Internal relative humidity $> 85.0\%$.
- **MQTT / Webhook Protocols**: Lightweight edge-to-cloud telemetry transmission.

### 4.2 Open-Source Ecosystem
| Project | Purpose | Reference Link |
|---|---|---|
| **Eclipse Paho MQTT** | Python client for lightweight telemetry messaging | [github.com/eclipse/paho.mqtt.python](https://github.com/eclipse/paho.mqtt.python) |
| **Node-RED** | Visual low-code IoT flow simulation and wire protocol testing | [github.com/node-red/node-red](https://github.com/node-red/node-red) |

---

## 5. Domain 5: Decentralized Storage & Cryptographic Hashing

### 5.1 Core Competencies Needed
- **IPFS CIDv1 Addressing**: Content-addressed permanent storage for farmer identities, lab reports, and high-resolution media.
- **Metadata Canonicalization**: Structuring JSON metadata following ERC-721 / TrueTag schema standard.
- **Pinata Cloud SDK / IPFS Gateways**: Managing reliable pinning and low-latency gateway resolution.

### 5.2 Open-Source Ecosystem
| Project | Purpose | Reference Link |
|---|---|---|
| **Pinata SDK** | Node.js and REST pinning client for decentralized IPFS | [github.com/PinataCloud/Pinata-SDK](https://github.com/PinataCloud/Pinata-SDK) |
| **Multiformats / multihash** | Self-describing cryptographic hashing and CID generation | [github.com/multiformats/multihash](https://github.com/multiformats/multihash) |

---

## 6. Domain 6: SIH 2026 Live Demo & Hackathon Presentation Engineering

### 6.1 Critical Demo Fail-Safes
1. **Public RPC Fallbacks**: Configure redundant Polygon RPC endpoints (`polygon-rpc.com`, `rpc-sepolia.polygon.technology`, `ankr.com/polygon_sepolia`) in frontend provider setup.
2. **Local Mock Mode Toggle**: Implement an offline preview mode in the Next.js verification page to guarantee a flawless 3-second demo even if hackathon Wi-Fi is congested.
3. **Physical QR Demo Cards**: Print laminated jar label cards with real batch QR codes linked to live deployments for on-stage judge interaction.

---

## 7. Open-Source Implementation Roadmap

```
Week 1: Core Smart Contracts & Hardhat Test Suite (100% test coverage)
Week 2: FastAPI Purity Scoring Microservice & Synthetic Dataset Calibration
Week 3: Next.js 14 Dashboard & Mobile Consumer PWA with Leaflet & QR Scanner
Week 4: Polygon Sepolia Testnet Deployment, IPFS Pinning & End-to-End Demo Kit
```
