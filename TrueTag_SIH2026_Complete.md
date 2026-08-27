# TrueTag — India's Universal Product Authentication Platform
### SIH 2026 | PS: SIH26021 | Ministry of MSME (KVIC)
### Team Document v1.0 — Confidential

---

## 0. Quick Reference

| Field | Detail |
|---|---|
| PS ID | SIH26021 |
| PS Title | Honey Chain — Blockchain-Based Honey Traceability & Smart Beekeeping |
| Our Product | TrueTag — Universal GI-Tagged Product Authentication |
| Ministry | Ministry of MSME (KVIC) |
| Category | Software |
| Tech Domain | Blockchain + AI + IoT Simulation |
| Target Demo | QR scan → live provenance trace on stage |
| Win Probability | High (low competition, high skills match) |

---

## 1. Problem Deconstruction

### 1.1 What the PS Says
Build a blockchain platform to track honey batches from hive to consumer. Include IoT sensor data, QR verification, and AI quality prediction.

### 1.2 What the Real Problem Is
KVIC (Khadi and Village Industries Commission) registers and promotes Indian GI-tagged products. The actual crisis is this:

- India has **700+ GI-tagged products** worth ₹50,000 crore annually
- **40–60% of premium Indian GI products** sold in markets are counterfeit or mislabeled
- A farmer producing authentic Sundarbans honey cannot **prove its origin** to a buyer in Delhi or London
- The farmer therefore gets **commodity pricing** instead of **premium GI pricing**
- Income gap per farmer: ₹15,000–₹40,000 per season, lost to counterfeit undercutting

KVIC gave a honey-specific PS because honey is their flagship KVIC product line. But the underlying want is a **verifiable authenticity system** that works for all KVIC/MSME artisan products.

### 1.3 Who Are the Stakeholders

| Stakeholder | Role | What They Want |
|---|---|---|
| KVIC officials (PS owner) | Decision maker at demo | See a working system they can pitch to leadership |
| Beekeepers / artisans | End user | Fair price, proof of authenticity |
| Consumers | Verification user | Trust that product is genuine |
| Export buyers | B2B buyer | Audit trail for international compliance |
| SIH judges | Evaluators | Innovation + feasibility + demo impact |

### 1.4 What Judges Implicitly Expect
- Working blockchain (not a database labeled blockchain)
- A real QR code that can be scanned live during demo
- AI quality prediction, even if basic
- A story about rural farmer income, not just a technology demo

---

## 2. Our Solution — TrueTag

### 2.1 One-Line Pitch
> "TrueTag turns any MSME artisan's product into a scannable, blockchain-verified identity — so a farmer in Sundarbans can prove their honey is real and charge 3x the price."

### 2.2 What TrueTag Does (Explained Simply)

**Step 1 — Hive Registration**
A beekeeper registers their apiary (hive location, cooperative ID, beekeeper ID) on TrueTag. A unique Farmer ID is minted on the blockchain. This is exactly what CertXchange does for credentials — same pattern, different domain.

**Step 2 — Batch Minting**
When a honey batch is harvested, a field officer or IoT sensor logs:
- Harvest date
- Location (GPS coordinates)
- Weight (kg)
- Temperature and humidity at harvest (IoT mock)
- Beekeeper ID

This data is hashed and a **Batch Token** is minted on the blockchain. Immutable. Cannot be altered retroactively.

**Step 3 — QR Generation**
Each physical honey jar gets a unique QR code linked to its Batch Token. The QR is printable directly from the TrueTag dashboard.

**Step 4 — Consumer Verification**
Consumer scans the QR. They see:
- Farmer name + photo
- Hive location on map
- Harvest date
- Sensor data at harvest
- Authenticity certificate (blockchain hash)
- "KVIC Verified" badge

Takes 3 seconds. Works on any smartphone. No app download needed.

**Step 5 — AI Quality Score**
An ML model (trained on FSSAI honey quality parameters) gives each batch a **Purity Score (0–100)** based on input parameters like moisture content, HMF levels, diastase activity. For SIH: use a mock model with realistic outputs.

---

## 3. Technical Architecture

### 3.1 System Diagram (Text)

```
[IoT Sensors / Manual Input]
        ↓
[TrueTag Dashboard — Next.js]
        ↓
[Smart Contract Layer — Polygon PoS]
        ↓
[IPFS — Stores metadata + farmer photos]
        ↓
[QR Code Generator]
        ↓
[Consumer Verify Page — Mobile-first]
        ↓
[AI Quality Engine — FastAPI]
```

### 3.2 Full Tech Stack

| Layer | Technology | Why This, Not Alternatives |
|---|---|---|
| Blockchain | Polygon PoS | Near-zero gas fees, EVM-compatible, fast finality. Ethereum mainnet = too expensive for per-batch transactions. Hyperledger = overkill for demo. |
| Smart Contracts | Solidity | Industry standard, Polygon supports it, you can deploy in minutes. |
| Contract Dev | Hardhat | Faster than Truffle, better error messages during 36hr crunch. |
| Frontend | Next.js 14 (App Router) | SSR for fast consumer verify page. Tailwind for speed. |
| Backend | Node.js + Express | Lightweight API bridge between frontend and blockchain. |
| AI Engine | FastAPI (Python) | Separate microservice for quality prediction. Easy to mock if time runs out. |
| ML Model | Scikit-learn (Random Forest) | Simple, explainable, fast to train on synthetic data. Not a black box. |
| Storage | IPFS (via Pinata) | Decentralized. Farmer photos + metadata stored off-chain. Hash stored on-chain. |
| QR Library | qrcode.js (frontend) | Client-side generation, no backend dependency. |
| Database | PostgreSQL | Store dashboard state, user accounts, batch metadata before blockchain write. |
| Auth | NextAuth.js | Quick OAuth setup for beekeeper + admin roles. |
| Maps | Leaflet.js | Open source, no API billing during hackathon. |
| Deployment | Vercel (frontend) + Railway (backend + DB) | Both have free tier, deploy in under 10 mins. |

### 3.3 Smart Contract Design

```solidity
// Core contract: HoneyBatch.sol

contract TrueTag {
    struct Farmer {
        uint256 farmerId;
        string name;
        string location;
        string cooperativeId;
        bool isVerified;
    }

    struct Batch {
        uint256 batchId;
        uint256 farmerId;
        uint256 harvestTimestamp;
        string ipfsHash;         // points to metadata JSON on IPFS
        uint8 qualityScore;
        bool isAuthentic;
    }

    mapping(uint256 => Farmer) public farmers;
    mapping(uint256 => Batch) public batches;
    mapping(string => uint256) public qrToBatch; // QR code → batchId

    event BatchMinted(uint256 batchId, uint256 farmerId, string qrCode);
    event FarmerRegistered(uint256 farmerId, string name);

    function registerFarmer(...) public onlyAdmin { ... }
    function mintBatch(...) public onlyFieldOfficer { ... }
    function verifyBatch(string memory qrCode) public view returns (Batch memory) { ... }
}
```

### 3.4 IPFS Metadata Structure (per batch)

```json
{
  "batchId": "TT-2024-00142",
  "farmer": {
    "name": "Ramesh Mahato",
    "photo": "ipfs://Qm...",
    "location": "Sundarban West, West Bengal",
    "cooperative": "KVIC Sundarban Beekeepers Cooperative"
  },
  "harvest": {
    "date": "2024-11-12",
    "weightKg": 42.5,
    "temperature": "28°C",
    "humidity": "65%",
    "gpsCoords": [21.9497, 88.9050]
  },
  "quality": {
    "moistureContent": "17.2%",
    "hmfLevel": "12 mg/kg",
    "qualityScore": 89,
    "grade": "A"
  },
  "blockchain": {
    "txHash": "0x...",
    "mintedAt": "2024-11-12T14:32:00Z",
    "network": "Polygon"
  }
}
```

### 3.5 AI Quality Model

**Input features (at batch entry):**
- Moisture content (%)
- HMF (Hydroxymethylfurfural) level mg/kg
- Diastase activity (DN)
- Electrical conductivity
- Colour (mm Pfund)
- Harvest temperature

**Output:**
- Quality Score 0–100
- Grade (A / B / C / Reject)
- Flag: "Adulteration risk: Low / Medium / High"

**Training data:** Generate 500 synthetic samples based on FSSAI honey quality standards. Random Forest classifier. Accuracy target: 85%+ on test set.

**For SIH demo:** Pre-train and serialize the model as a `.pkl` file. FastAPI endpoint accepts POST with features, returns score. If model fails, fallback to a rule-based scoring function. Never let the AI layer crash the demo.

---

## 4. Product Features (Full List)

### 4.1 Beekeeper Portal
- Register apiary (name, location, cooperative ID, KVIC Beekeeper Registration Number / DigiLocker ID)
- Log new harvest batch (form input + IoT data pull)
- View all batches and their blockchain status
- Download QR codes (PDF printable labels)
- Revenue dashboard (show premium pricing uplift)

### 4.2 Field Officer / KVIC Admin Panel
- Approve farmer registrations (acts as trusted oracle node)
- Verify batch data before minting (prevents garbage data entry)
- District-wise production analytics
- Batch status: Pending → Verified → Minted → Distributed

### 4.3 Consumer Verify Page (Mobile-First)
- Scan QR → no app download, works in browser
- Shows: Farmer story, location map, harvest timeline, quality score
- "Blockchain verified" badge with transaction hash link
- Share-to-social button (for premium honey buyers on Instagram etc.)

### 4.4 Export / B2B Certificate
- One-click PDF export of batch authenticity certificate
- Includes: blockchain hash, KVIC stamp, quality grade, IPFS link
- Designed to satisfy international GI product import requirements (EU, USA)

### 4.5 AI Dashboard (Admin)
- Quality trend by district / season
- Adulteration risk heatmap
- Predictive harvest yield (basic regression model)

---

## 5. Business Model

### 5.1 The Core Insight
Governments don't pay for SaaS until someone else proves it works. Build for KVIC during SIH, then use that as a case study to sell to 700+ GI product categories.

### 5.2 Revenue Streams

| Stream | Mechanism | Unit Economics | Year 1 Target |
|---|---|---|---|
| B2G SaaS | ₹50,000/year per district cooperative | 200 districts × ₹50k | ₹1 crore |
| Per-Batch Certificate | ₹5 per blockchain-anchored batch cert | 2M batches/year | ₹1 crore |
| Export API | ₹2/API call for international buyer verification | 5M calls/year | ₹1 crore |
| Premium Brand Subscription | ₹999/month for artisan brands (custom landing page, analytics) | 1000 brands | ₹1.2 crore |
| **Total Year 1** | | | **₹4.2 crore ARR** |

### 5.3 Go-To-Market

**Phase 1 (Month 1–6): SIH Win → KVIC Pilot**
- Use SIH as the launch event
- Request KVIC for a 3-district pilot: Sundarbans (WB), Nilgiri (TN), Morni Hills (Haryana)
- Goal: 500 farmers, 2000 batches minted

**Phase 2 (Month 6–12): GI Expansion**
- Extend to 5 more GI categories: Darjeeling tea, Alphonso mango, Banaras saree, Kolhapuri chappal, Kashmir saffron
- Approach the GI Registry (Chennai) for formal partnership
- Revenue: per-cert fees + export API

**Phase 3 (Year 2): International**
- EU GI compliance market (India exports ₹3 lakh crore in agricultural goods)
- Partner with APEDA (Agricultural & Processed Food Products Export Development Authority)
- Sell authenticity-as-a-service to Indian exporters

### 5.4 Why This Survives After SIH
- KVIC has ₹3,000 crore annual turnover and procurement budget
- GI registry (DPIIT) has been actively looking for this solution since 2021
- No direct Indian competitor exists at this scope (only honey-specific startups)
- Nearest international competitor: Everledger (diamonds). Not applicable to agri.

### 5.5 Funding Path
- **Month 0–6:** Bootstrap on SIH prize money + college incubator
- **Month 6–18:** Apply to AIC (Atal Innovation Mission) grants + MSME tech grant (₹25 lakh available)
- **Year 2:** Raise ₹1–2 crore pre-seed from agri-focused VCs (Omnivore, Accel India, Blume)

---

## 6. SIH Judging Criteria Map

| Criterion | Score Estimate | What We Do to Maximize |
|---|---|---|
| **Innovation** | 88/100 | Blockchain is common. Universal GI authentication reframe is not. The "farmer income uplift" metric is new. |
| **Feasibility** | 92/100 | All components are live, not mocked (except IoT sensors — justified as "field officer manual entry" fallback). |
| **Impact / Scalability** | 95/100 | 700+ GI categories, 10M artisans, ₹50,000 crore market. Numbers speak. |
| **Technical Complexity** | 85/100 | Solidity + Polygon + IPFS + AI model + QR + maps is a credible full stack. |
| **Presentation Quality** | 90/100 | QR scan live on stage. Farmer story with photo. Revenue numbers. Clear 3-slide business model. |
| **Weighted Total** | **~90/100** | |

### Where We Could Lose Points
- **Innovation:** If judges think "blockchain QR traceability" is generic. Counter: lead with the GI-extension story, not the tech.
- **Technical Complexity:** If AI model looks too simple. Counter: show actual feature importance graph from trained model.
- **Feasibility:** If asked "how do farmers without smartphones use this?" Counter: KVIC field officers act as intermediaries. Farmers don't need phones.

---

## 7. 36-Hour Build Plan

### Pre-Hackathon (This Week)
- [ ] Set up Polygon Amoy testnet wallets (Chain ID: 80002)
- [ ] Deploy skeleton HoneyBatch.sol to testnet
- [ ] Initialize Next.js repo with Tailwind + shadcn/ui
- [ ] Train and serialize AI quality model (scikit-learn) on synthetic data
- [ ] Design 5 screens in Figma: Landing, Farmer Portal, Batch Entry, Verify Page, Admin
- [ ] Register truetag.in domain
- [ ] Set up Pinata IPFS account (free tier)
- [ ] Prepare 3 fake farmer profiles with photos (for demo realism)

### Hour 0–6: Foundation
- [ ] Finalize smart contract: `registerFarmer()`, `mintBatch()`, `verifyBatch()`
- [ ] Deploy to Polygon Amoy testnet
- [ ] Set up Next.js project structure: `/farmer`, `/admin`, `/verify/[qrCode]`
- [ ] Connect Wagmi/ethers.js to frontend
- [ ] Set up PostgreSQL schema on Railway
- [ ] Set up FastAPI microservice (quality model endpoint)

### Hour 6–14: Core Features
- [ ] Farmer registration form → writes to DB + triggers blockchain tx
- [ ] Batch entry form → IoT mock fields + manual entry
- [ ] IPFS upload on batch creation (Pinata API)
- [ ] Smart contract mint on batch approval
- [ ] QR code generation (linked to `/verify/[batchId]`)
- [ ] Consumer verify page (reads from blockchain + IPFS)

### Hour 14–22: Polish + Integration
- [ ] Admin panel: farmer list, batch approval workflow, analytics charts
- [ ] Quality score display on verify page (call FastAPI)
- [ ] Location map (Leaflet) on farmer profile
- [ ] PDF export of authenticity certificate
- [ ] Mobile responsiveness on verify page (critical for live scan demo)
- [ ] Loading states, error handling, basic auth

### Hour 22–30: Demo Path Lock
- [ ] End-to-end test: Register farmer → log batch → get QR → scan QR → see verify page
- [ ] Pre-load 3 demo farmer profiles on testnet (Ramesh, Sunita, Arjun)
- [ ] Pre-mint 5 batches with realistic data
- [ ] Print 3 physical QR code cards for stage demo
- [ ] Test QR scan on 3 different Android/iOS devices
- [ ] Fix all broken flows

### Hour 30–36: Presentation
- [ ] Build demo slide deck (10 slides max, see below)
- [ ] Record 2-minute demo video (backup if live demo fails)
- [ ] Prepare judge FAQ answers (see Section 9)
- [ ] Rehearse demo walk-through 3 times
- [ ] Push all code to GitHub (clean README)
- [ ] Deploy frontend to Vercel, backend to Railway

---

## 8. Demo Script (Live — 5 Minutes)

**[Slide 1 — 30 sec]**
"India has 700 GI-tagged products worth ₹50,000 crore. But 40% of what you buy as 'Sundarbans honey' or 'Darjeeling tea' is counterfeit. The farmer who actually grew it gets paid commodity price. TrueTag fixes that."

**[Slide 2 — 30 sec]**
Show the problem with a number: "Ramesh Mahato, beekeeper from Sundarbans, loses ₹28,000 every season because he cannot prove his honey is authentic."

**[Live Demo — 3 min]**
1. Open TrueTag farmer portal on laptop (projected)
2. Show Ramesh's profile, his hive location on map
3. Show his latest batch — quality score 89/100, Grade A
4. Click "Generate QR" — QR appears on screen
5. Hold up a physical QR card (pre-printed)
6. "Any judge — please scan this with your phone"
7. Judge scans → Consumer verify page opens
8. Shows: Ramesh's photo, GPS location, harvest date, blockchain hash, KVIC verified badge
9. "This took 3 seconds. No app. No account. That QR is anchored to an immutable record on the Polygon blockchain. It cannot be faked."

**[Slide 3 — 30 sec]**
Business model: 3 revenue streams, ₹4 crore Year 1 ARR, 700+ GI categories addressable.

**[Slide 4 — 30 sec]**
"We want to pilot this with KVIC across 3 districts, 500 farmers, within 60 days of SIH."

---

## 9. Slide Deck Structure (10 Slides)

| Slide | Title | Content |
|---|---|---|
| 1 | The Problem | ₹50,000 crore market. 40% counterfeit. Farmer income gap. |
| 2 | The Stakeholders | Ramesh's story. KVIC's credibility problem. Consumer distrust. |
| 3 | TrueTag | One-line pitch. Product screenshot. |
| 4 | How It Works | 5-step flow diagram. Simple, no jargon. |
| 5 | Live Demo | [this is where you do the demo] |
| 6 | Tech Stack | Polygon + IPFS + AI + QR. Architecture diagram. |
| 7 | AI Quality Engine | Feature list. Accuracy. Demo output. |
| 8 | Business Model | 3 revenue streams. Market size. |
| 9 | Roadmap | 60-day KVIC pilot → GI expansion → International |
| 10 | The Ask | Pilot partnership + SIH support letter for KVIC intro |

---

## 10. Judge Questions — Prepared Answers

**Q: "How do you prevent a beekeeper from entering fake data?"**
A: "KVIC field officers act as trusted oracle nodes. No batch is minted to the blockchain without a field officer's digital approval. This is the same model that KVIC already uses for product certification — we digitized it. For advanced deployments, IoT sensors at the hive provide tamper-proof data feeds."

**Q: "How do farmers without smartphones use this?"**
A: "Farmers don't need smartphones. The field officer enters data on behalf of the farmer. The consumer is the one who scans. This is the same model as existing KVIC registration — centrally administered."

**Q: "What's your deployment plan after SIH?"**
A: "We've identified 3 pilot districts — Sundarbans (WB), Nilgiri (TN), Morni Hills (Haryana). We'll approach KVIC regional offices with the SIH recognition and request a 90-day pilot with 500 farmers. We need zero government budget — the pilot runs on our infrastructure for free."

**Q: "Why blockchain? Why not a regular database?"**
A: "A database is controlled by whoever runs the server — government, company, or vendor. Data can be altered retroactively. A blockchain transaction is immutable — once Ramesh's batch is minted, no one, including us, can change that record. That immutability is what gives the QR verification its credibility to international buyers."

**Q: "Why Polygon and not Ethereum or Hyperledger?"**
A: "Ethereum mainnet has gas fees of ₹500–2000 per transaction — unviable for ₹5/batch certificates. Hyperledger requires running your own validator nodes — too costly for a startup. Polygon gives us Ethereum security, near-zero fees (₹0.01 per tx), and 2-second finality. It's the right trade-off."

**Q: "What's your moat? Can't someone copy this?"**
A: "Data network effects. The more farmers, cooperatives, and export buyers on TrueTag, the more valuable the verification network becomes. A competitor starting fresh has no data. We also plan to integrate with DPIIT's GI Registry as the official verification layer — that integration becomes a regulatory moat."

**Q: "What if KVIC doesn't adopt it?"**
A: "KVIC is one client. We simultaneously approach GI-tagged product cooperatives directly — they don't need KVIC's permission to use TrueTag. Darjeeling Tea Board, Alphonso Mango Cooperative, Kashmir Saffron growers — these are autonomous bodies. We de-risk government dependency from day one."

---

## 11. Risks and Mitigation

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Smart contract bug during demo | Medium | High | Deploy to testnet 24hrs before. Use pre-minted demo batches, not live minting on stage. |
| IoT data integration fails | High | Low | Frame as "field officer entry" from day 1. IoT is Phase 2 roadmap, not MVP. |
| Judges don't understand blockchain | Medium | Medium | Never use "blockchain" as the first word. Say "tamper-proof digital record" first. |
| QR scan fails on judge's phone | Medium | High | Print 5 backup QR cards. Have 3 phones ready with verify page already open. |
| AI model gives wrong output on demo | Low | Medium | Hardcode 3 specific demo batches with known inputs. Don't use random inputs on stage. |
| Competitor team has better UI | Medium | Medium | Your technical depth (actual smart contracts, IPFS, real AI model) beats pretty UI. |
| Network issues at venue | High | High | Cache consumer verify page as offline-first PWA. Pre-load IPFS hashes locally. |

---

## 12. Team Role Allocation

| Role | Responsibilities | Stack Required |
|---|---|---|
| Blockchain Dev (1) | Smart contracts, Hardhat, Wagmi integration | Solidity, ethers.js |
| Full Stack Dev (2) | Next.js frontend, Node.js backend, DB | React, Next.js, PostgreSQL |
| AI / Backend Dev (1) | FastAPI quality model, IPFS integration | Python, scikit-learn, Pinata |
| UI/UX Dev (1) | Design system, mobile verify page, dashboard | Tailwind, Figma |
| Team Lead / Presenter (Shivam) | Architecture decisions, pitch, demo script, judge Q&A | All of the above |

---

## 13. Post-SIH Roadmap

### Phase 1 — Validation (Month 1–3)
- Request KVIC intro via SIH Ministry contact
- 3-district pilot, 500 farmers
- Measure: QR scan rate, farmer income change, admin adoption

### Phase 2 — GI Expansion (Month 4–9)
- Add 5 GI categories beyond honey
- Launch public API for export buyers
- Apply for AIC grant (₹25 lakh)

### Phase 3 — Platform (Month 10–18)
- Self-serve onboarding for cooperatives
- Mobile app for field officers (React Native)
- International expansion: EU GI compliance market
- Target: ₹1 crore ARR

### Phase 4 — Scale (Year 2)
- 100+ GI categories
- DPIIT partnership as official GI verification layer
- Raise ₹1–2 crore pre-seed
- Target: ₹5 crore ARR

---

## 14. Why TrueTag Over Every Other PS

| Factor | TrueTag | Generic AI PS | Hardware PS |
|---|---|---|---|
| Skills match | 95/100 (blockchain = CertXchange) | 70/100 | 40/100 |
| Competition density | Low | Very High | Medium |
| Demo impact | QR scan on stage | Chatbot output | Hardware failure risk |
| Business model | Clear, 3 revenue streams | Ad-based or vague | Hardware margin |
| Post-SIH survivability | KVIC pilot possible in 60 days | Dies after demo | Dies after demo |
| Shivam's authentic edge | CertXchange = proof of work | None | None |

---

## 15. Appendix — Key Numbers for Pitch

- **700+** GI-tagged products in India
- **₹50,000 crore** — annual market value of GI products
- **40–60%** — estimated counterfeit rate in premium Indian products
- **10 million+** artisans and farmers producing GI-tagged goods
- **₹15,000–40,000** — average income loss per farmer per season from counterfeit undercutting
- **₹3 lakh crore** — India's annual agricultural export value (authenticity = premium access)
- **500+** KVIC cooperative societies across India (pre-existing distribution)
- **₹0.01** — cost per blockchain transaction on Polygon (viable at scale)
- **3 seconds** — time to verify a TrueTag QR code
- **0** — app downloads required by the consumer

---

*Document maintained by Shivam Mahesh Gawade | TrueTag | SIH 2026*
*Last updated: August 2026*
