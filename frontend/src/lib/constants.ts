/**
 * Contract ABI & System Constants for HoneyChain by TrueTag
 */

export const HONEYCHAIN_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const POLYGON_AMOY_RPC =
  process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-amoy.polygon.technology";

export const POLYGON_SEPOLIA_RPC = POLYGON_AMOY_RPC;

export const HONEYCHAIN_ABI = [
  "function totalFarmers() view returns (uint256)",
  "function totalBatches() view returns (uint256)",
  "function totalRequests() view returns (uint256)",
  "function getFarmer(uint256) view returns (tuple(uint256 farmerId, address walletAddress, string name, string location, string cooperativeId, string ipfsProfileHash, bool isVerified, uint256 registeredAt))",
  "function getBatch(uint256) view returns (tuple(uint256 batchId, uint256 requestId, uint256 farmerId, uint256 harvestTimestamp, string ipfsMetadataHash, uint8 qualityScore, string grade, bool isAuthentic, bool isDisputed, string disputeReason, address flaggedBy, bool isRevoked))",
  "function getBatchByQR(string) view returns (tuple(uint256 batchId, uint256 requestId, uint256 farmerId, uint256 harvestTimestamp, string ipfsMetadataHash, uint8 qualityScore, string grade, bool isAuthentic, bool isDisputed, string disputeReason, address flaggedBy, bool isRevoked))",
  "function getCustodyChain(uint256) view returns (tuple(address actor, string entity, uint256 timestamp, string action)[])",
  "function registerFarmer(address walletAddress, string name, string location, string cooperativeId, string ipfsProfileHash) returns (uint256)",
  "function submitHarvest(string floraSource, uint256 quantityKg, string ipfsMetadataHash) returns (uint256)",
  "function approveHarvestAndMint(uint256 requestId, string ipfsMetadataHash, uint8 qualityScore, string grade, string qrToken) returns (uint256)",
  "function addCustody(uint256 batchId, string entity, string action)",
  "function flagFraud(uint256 batchId, string reason)",
  "function resolveDispute(uint256 batchId, bool restoreAuthentic, string resolutionRemarks)",
  "function revokeBatch(uint256 batchId)",
  "event FarmerRegistered(uint256 indexed farmerId, address indexed walletAddress, string name, string location, address registeredBy)",
  "event HarvestSubmitted(uint256 indexed requestId, uint256 indexed farmerId, address indexed beekeeper, uint256 quantityKg, string floraSource, string ipfsMetadataHash)",
  "event HarvestApproved(uint256 indexed requestId, uint256 indexed batchId, address indexed officer, uint8 qualityScore, string grade)",
  "event BatchMinted(uint256 indexed batchId, uint256 indexed requestId, uint256 indexed farmerId, string ipfsMetadataHash, uint8 qualityScore, string grade, address mintedBy)",
  "event CustodyLogged(uint256 indexed batchId, string entity, string action, address loggedBy)",
  "event BatchRevoked(uint256 indexed batchId, address revokedBy)"
];

// FSSAI Quality Benchmark Constants
export const FSSAI_STANDARDS = {
  MAX_MOISTURE_PCT: 20.0,
  MIN_BRIX_PCT: 65.0,
  MAX_HMF_MG_KG: 80.0,
  MIN_DIASTASE_DN: 8.0,
  MAX_ELECTRICAL_CONDUCTIVITY: 0.8,
};

// ─── DEMO DATASET (BASELINE SAMPLES) ──────────────────────────────────────────
// Seeded batches used for stage demos and offline fallback.
// Live-minted batches from /dashboard/mint are served from SQLite.
export const DEMO_BATCHES = [
  {
    batchId: 1,
    farmer: {
      farmerId: 1,
      name: "Rajesh Kumar Verma",
      location: "Muzaffarpur, Bihar",
      cooperativeId: "KVIC-BH-002",
      ipfsProfileHash: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      isVerified: true,
      registeredAt: 1723618800,
    },
    batch: {
      batchId: 1,
      farmerId: 1,
      harvestTimestamp: 1723618800,
      ipfsMetadataHash: "bafybeihdwdcefgh4dqkjv67ui9p1qwe87yu123456789abcdef",
      qualityScore: 94,
      grade: "Grade A+ Premium Raw Organic",
      isAuthentic: true,
      isRevoked: false,
    },
    custodyChain: [
      {
        actor: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        entity: "Apiary Harvest Site (Muzaffarpur Litchi Valley)",
        timestamp: 1723618800,
        action: "Harvested & IoT Sealed (TrueTag #7721)",
      },
      {
        actor: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        entity: "KVIC Regional Honey Processing Center, Patna",
        timestamp: 1723791600,
        action: "Cold Filtration & Anti-Adulteration Spectrometry Passed",
      },
      {
        actor: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        entity: "National Bee Board Quality Testing Lab, New Delhi",
        timestamp: 1723964400,
        action: "FSSAI Grade A+ Certificate Issued (Score: 94/100)",
      },
      {
        actor: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4df",
        entity: "TrueTag Secure Dispatch Hub, Delhi NCR",
        timestamp: 1724310000,
        action: "Cryptographic Tamper-Evident QR Activated",
      },
    ],
    labReport: {
      moisturePercent: 17.2,
      brixPercent: 81.4,
      hmfMgPerKg: 14.5,
      diastaseNumber: 18.2,
      electricalConductivity: 0.38,
      purityScore: 94,
      grade: "Grade A+ Premium Raw Organic",
      passedFSSAI: true,
      testedAt: "2026-08-18",
    },
    qrToken: "TT-2026-00001",
    txHash: "0x8f2d9c4e7b1a56209ef43c8b1a32d67e891c345a6789b0cd1234ef56789a2f10",
  },
  {
    batchId: 2,
    farmer: {
      farmerId: 2,
      name: "Lakshmi Devi & Sundarbans Cooperative",
      location: "Sundarbans Biosphere Reserve, West Bengal",
      cooperativeId: "KVIC-WB-019",
      ipfsProfileHash: "bafybeihdwdcefgh4dqkjv67ui9p1qwe87yu123456789abcdef",
      isVerified: true,
      registeredAt: 1724050800,
    },
    batch: {
      batchId: 2,
      farmerId: 2,
      harvestTimestamp: 1724050800,
      ipfsMetadataHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      qualityScore: 91,
      grade: "Grade A Wild Mangrove Honey",
      isAuthentic: true,
      isRevoked: false,
    },
    custodyChain: [
      {
        actor: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        entity: "Sundarbans Forest Collection Camp #7",
        timestamp: 1724050800,
        action: "Harvested by Forest Honey Collectors Society",
      },
      {
        actor: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        entity: "KVIC Kolkata Processing Hub",
        timestamp: 1724223600,
        action: "Filtered, Packaged & TrueTag NFC Tagged",
      },
    ],
    labReport: {
      moisturePercent: 18.5,
      brixPercent: 79.8,
      hmfMgPerKg: 22.0,
      diastaseNumber: 15.0,
      electricalConductivity: 0.52,
      purityScore: 91,
      grade: "Grade A Wild Mangrove Honey",
      passedFSSAI: true,
      testedAt: "2026-08-20",
    },
    qrToken: "TT-2026-00002",
    txHash: "0x1a7b3c8e9d2f4a56b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3",
  },
];
