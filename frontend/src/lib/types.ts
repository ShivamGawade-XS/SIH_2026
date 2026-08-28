/**
 * TypeScript type definitions for HoneyChain by TrueTag
 * Author: Shivam Gawade (@ShivamGawade-XS)
 */

export interface Farmer {
  farmerId: number;
  name: string;
  location: string;
  cooperativeId: string;
  gpsLat?: number | null;
  gpsLng?: number | null;
  ipfsProfileHash: string;
  upiVpa?: string | null;
  isVerified: boolean;
  registeredAt: number;
}

export interface HoneyBatch {
  batchId: number;
  farmerId: number;
  harvestTimestamp: number;
  ipfsMetadataHash: string;
  qualityScore: number;
  grade: string;
  isAuthentic: boolean;
  isRevoked: boolean;
  isDisputed?: boolean;
  disputeReason?: string | null;
}

export interface CustodyEntry {
  actor: string;
  entity: string;
  timestamp: number;
  action: string;
}

export interface LabQualityReport {
  moisturePercent: number;    // FSSAI limit: max 20%
  brixPercent: number;        // FSSAI limit: min 65%
  hmfMgPerKg: number;         // FSSAI limit: max 80 mg/kg
  diastaseNumber: number;     // FSSAI limit: min 8 DN
  electricalConductivity: number; // FSSAI limit: max 0.8 mS/cm
  c13IsotopeDelta?: number;
  c4SugarPercent?: number;
  smrMarker?: number;
  purityScore: number;        // 0 - 100
  grade: string;
  passedFSSAI: boolean;
  testedAt: string;
  engine?: string;
}

export interface BatchMetadata {
  batchId: number;
  farmer: Farmer;
  batch: HoneyBatch;
  custodyChain: CustodyEntry[];
  labReport: LabQualityReport;
  qrToken: string;
  txHash?: string;
  blockNumber?: number;
  botanicalFlora?: string;
}

export interface UserSession {
  id?: string;
  address?: string;
  email?: string;
  role: 'ADMIN' | 'FIELD_OFFICER' | 'LAB_ANALYST' | 'CONSUMER';
  name: string;
  cooperative?: string;
  exp: number;
}

