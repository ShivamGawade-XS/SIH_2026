# 📜 HoneyChain Smart Contracts (Polygon PoS)

> **Part of the HoneyChain by TrueTag Ecosystem**  
> **Team:** Crimson Syndicate (CS Syndicate)  
> **Smart India Hackathon (SIH) 2026** | **Problem Statement:** SIH26021  

---

## 🏗️ Architecture Overview

The smart contracts layer anchors every honey batch onto the **Polygon PoS (Amoy Testnet / Mainnet)** blockchain. It implements granular role-based access control, cryptographic supply-chain custody tracking, and anti-counterfeiting verification tokens.

```text
  ┌───────────────────────────────────────────────────────────┐
  │                   HoneyChain.sol                          │
  │     OpenZeppelin AccessControl + Multi-Tier Workflow      │
  ├───────────────────────────────────────────────────────────┤
  │  1. registerFarmer()        ──>  KYC & GPS Apiary Token   │
  │  2. submitHarvest()         ──>  Beekeeper Raw Batch Log  │
  │  3. approveHarvestAndMint() ──>  Field Officer Minting    │
  │  4. logCustodyTransfer()    ──>  Supply Chain Transfer    │
  │  5. logLabReport()          ──>  FSSAI Chemist Validation │
  │  6. flagFraud()             ──>  Supervisor Dispute Lock  │
  └───────────────────────────────────────────────────────────┘
```

---

## 👥 Authors & Contributors — Team Crimson Syndicate (CS Syndicate)

- **Shivam Gawade**
- **Rahul Rathod**
- **Rehan Harmalkar**
- **Avneesh Walwalkar**
- **Sunehri Sonar**
- **Shaunak Pai**

---

## 🚀 Contracts Deployment Details

| Parameter | Value |
|---|---|
| **Contract Name** | `HoneyChain.sol`, `HoneyChainQR.sol` |
| **Network** | Polygon PoS (Amoy Testnet / Mainnet) |
| **Chain ID** | `80002` |
| **Contract Address** | `0x199E39294f9f23908846c433DE86c757270D5b82` |
| **Solidity Version** | `0.8.24` |
| **Dependencies** | OpenZeppelin Contracts v5 (AccessControl, ERC1155) |

---

## 🧪 Testing & Verification

Run the Hardhat test suite (38 passing unit tests):

```bash
# Install dependencies
npm install

# Run complete test suite
npx hardhat test
```

Test coverage includes:
- Role-based authorization tests (Field Officer, Lab Analyst, Admin)
- Valid IPFS CID (length $\ge 46$) input validation
- Harvest rejection and re-submission workflows
- Non-destructive fraud flagging & dispute resolution
- Batch revocation & QR lookup integrity
