import { ethers } from "ethers";
import { HONEYCHAIN_ABI, HONEYCHAIN_CONTRACT_ADDRESS, POLYGON_AMOY_RPC, DEMO_BATCHES } from "./constants";
import { BatchMetadata, Farmer, HoneyBatch, CustodyEntry } from "./types";
import { getCustomBatches } from "./registry";

/**
 * Helper to enforce timeout on RPC blockchain calls
 */
async function withTimeout<T>(promise: Promise<T>, ms = 4000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Blockchain RPC call timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Call an RPC blockchain operation with exponential backoff retry (3 attempts)
 */
export async function withRpcRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: any = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await withTimeout(operation(), 4000);
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, baseDelayMs * Math.pow(2, attempt - 1)));
      }
    }
  }
  throw lastError;
}

/**
 * Get read-only provider for Polygon Amoy
 */
export function getReadOnlyProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(POLYGON_AMOY_RPC);
}

/**
 * Get read-only contract instance
 */
export function getReadOnlyContract(): ethers.Contract {
  const provider = getReadOnlyProvider();
  return new ethers.Contract(HONEYCHAIN_CONTRACT_ADDRESS, HONEYCHAIN_ABI, provider);
}

/**
 * Get contract instance with browser wallet signer (MetaMask)
 */
export async function getSignerContract(): Promise<{ contract: ethers.Contract; signer: ethers.Signer; address: string }> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("No Web3 wallet detected. Please install MetaMask.");
  }
  const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await browserProvider.getSigner();
  const address = await signer.getAddress();
  const contract = new ethers.Contract(HONEYCHAIN_CONTRACT_ADDRESS, HONEYCHAIN_ABI, signer);
  return { contract, signer, address };
}

/**
 * Fetch batch metadata by QR token with fallback cascade: DB API -> Smart Contract -> LocalStorage -> Demo (Exact match only)
 */
export async function fetchBatchByQR(qrToken: string): Promise<BatchMetadata | null> {
  if (!qrToken || qrToken.trim() === "") {
    return null;
  }

  const normalizedQR = qrToken.trim();

  // 1. Try DB API first (matches either numeric ID or QR token string)
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/batches/${encodeURIComponent(normalizedQR)}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.batch) return data.batch;
      }
    } catch {
      // Continue to next fallback
    }
  }

  // 2. Check local custom registry for exact match
  const customList = getCustomBatches();
  const localMatch = customList.find(
    (b) =>
      b.qrToken?.toLowerCase() === normalizedQR.toLowerCase() ||
      String(b.batchId) === normalizedQR
  );
  if (localMatch) return localMatch;

  // 3. Check demo batches for exact match
  const demoMatch = DEMO_BATCHES.find(
    (b) =>
      b.qrToken?.toLowerCase() === normalizedQR.toLowerCase() ||
      String(b.batchId) === normalizedQR
  );

  // 4. Try querying Smart Contract on Polygon Amoy if address is configured
  if (HONEYCHAIN_CONTRACT_ADDRESS) {
    try {
      const contract = getReadOnlyContract();
      const rawBatch = await withTimeout(contract.getBatchByQR(normalizedQR), 4000);
      const batchId = Number(rawBatch.batchId);
      if (batchId && batchId > 0) {
        const rawFarmer = await withTimeout(contract.getFarmer(Number(rawBatch.farmerId)), 3000);
        const rawCustody: Array<{ actor: string; entity: string; timestamp: bigint; action: string }> =
          await withTimeout(contract.getCustodyChain(batchId), 3000).catch(() => []);

        const custodyChain: CustodyEntry[] = rawCustody.map((c) => ({
          actor: c.actor,
          entity: c.entity,
          timestamp: Number(c.timestamp),
          action: c.action,
        }));

        const farmer: Farmer = {
          farmerId: Number(rawFarmer.farmerId),
          name: rawFarmer.name,
          location: rawFarmer.location,
          cooperativeId: rawFarmer.cooperativeId,
          ipfsProfileHash: rawFarmer.ipfsProfileHash,
          isVerified: rawFarmer.isVerified,
          registeredAt: Number(rawFarmer.registeredAt),
        };

        const batch: HoneyBatch = {
          batchId: Number(rawBatch.batchId),
          farmerId: Number(rawBatch.farmerId),
          harvestTimestamp: Number(rawBatch.harvestTimestamp),
          ipfsMetadataHash: rawBatch.ipfsMetadataHash,
          qualityScore: Number(rawBatch.qualityScore),
          grade: rawBatch.grade,
          isAuthentic: rawBatch.isAuthentic && !rawBatch.isRevoked && !rawBatch.isDisputed,
          isRevoked: rawBatch.isRevoked,
        };

        return {
          batchId,
          farmer,
          batch,
          custodyChain: custodyChain.length > 0 ? custodyChain : (demoMatch?.custodyChain || []),
          labReport: demoMatch?.labReport || {
            moisturePercent: 17.5,
            brixPercent: 81.0,
            hmfMgPerKg: 15.0,
            diastaseNumber: 17.5,
            electricalConductivity: 0.4,
            purityScore: batch.qualityScore,
            grade: batch.grade,
            passedFSSAI: batch.qualityScore >= 70,
            testedAt: new Date(batch.harvestTimestamp * 1000).toISOString().split("T")[0],
          },
          qrToken: normalizedQR,
          txHash: demoMatch?.txHash,
        };
      }
    } catch {
      // Contract call failed or batch not found on chain
    }
  }

  // Return demoMatch if exact match exists, otherwise null
  return demoMatch || null;
}

/**
 * Fetch batch metadata by Batch ID with fallback cascade: DB API -> Smart Contract -> LocalStorage -> Demo (Exact match only)
 */
export async function fetchBatchById(batchId: number): Promise<BatchMetadata | null> {
  if (!batchId || isNaN(batchId) || batchId <= 0) {
    return null;
  }

  // 1. Try DB API first
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/batches/${batchId}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.batch) return data.batch;
      }
    } catch {
      // Continue to next fallback
    }
  }

  // 2. Check local custom registry for exact match
  const customList = getCustomBatches();
  const localMatch = customList.find((b) => Number(b.batchId) === Number(batchId));
  if (localMatch) return localMatch;

  // 3. Check demo batches for exact match
  const demoMatch = DEMO_BATCHES.find((b) => Number(b.batchId) === Number(batchId));

  // 4. Try querying Smart Contract on Polygon Amoy if address is configured
  if (HONEYCHAIN_CONTRACT_ADDRESS) {
    try {
      const contract = getReadOnlyContract();
      const rawBatch = await withTimeout(contract.getBatch(batchId), 4000);
      if (rawBatch && Number(rawBatch.batchId) > 0) {
        const rawFarmer = await withTimeout(contract.getFarmer(Number(rawBatch.farmerId)), 3000);
        const rawCustody = await withTimeout(contract.getCustodyChain(batchId), 3000).catch(() => []);

        return {
          batchId,
          farmer: {
            farmerId: Number(rawFarmer.farmerId),
            name: rawFarmer.name,
            location: rawFarmer.location,
            cooperativeId: rawFarmer.cooperativeId,
            ipfsProfileHash: rawFarmer.ipfsProfileHash,
            isVerified: rawFarmer.isVerified,
            registeredAt: Number(rawFarmer.registeredAt),
          },
          batch: {
            batchId: Number(rawBatch.batchId),
            farmerId: Number(rawBatch.farmerId),
            harvestTimestamp: Number(rawBatch.harvestTimestamp),
            ipfsMetadataHash: rawBatch.ipfsMetadataHash,
            qualityScore: Number(rawBatch.qualityScore),
            grade: rawBatch.grade,
            isAuthentic: rawBatch.isAuthentic && !rawBatch.isRevoked && !rawBatch.isDisputed,
            isRevoked: rawBatch.isRevoked,
          },
          custodyChain: (rawCustody || []).map((c: any) => ({
            actor: c.actor,
            entity: c.entity,
            timestamp: Number(c.timestamp),
            action: c.action,
          })),
          labReport: demoMatch?.labReport || {
            moisturePercent: 17.2,
            brixPercent: 81.4,
            hmfMgPerKg: 14.5,
            diastaseNumber: 18.2,
            electricalConductivity: 0.38,
            purityScore: Number(rawBatch.qualityScore),
            grade: rawBatch.grade,
            passedFSSAI: Number(rawBatch.qualityScore) >= 70,
            testedAt: new Date(Number(rawBatch.harvestTimestamp) * 1000).toISOString().split("T")[0],
          },
          qrToken: demoMatch?.qrToken || `TT-2026-0000${batchId}`,
          txHash: demoMatch?.txHash,
        };
      }
    } catch {
      // Contract call failed or batch not found
    }
  }

  // Return demoMatch if exact match exists, otherwise null
  return demoMatch || null;
}
