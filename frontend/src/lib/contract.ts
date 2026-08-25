import { ethers } from "ethers";
import { HONEYCHAIN_ABI, HONEYCHAIN_CONTRACT_ADDRESS, POLYGON_SEPOLIA_RPC, DEMO_BATCHES } from "./constants";
import { BatchMetadata, Farmer, HoneyBatch, CustodyEntry } from "./types";

/**
 * Get read-only provider for Polygon Sepolia
 */
export function getReadOnlyProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(POLYGON_SEPOLIA_RPC);
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
 * Fetch batch metadata by QR token with fallback to demo data if contract is unreachable
 */
export async function fetchBatchByQR(qrToken: string): Promise<BatchMetadata> {
  try {
    const contract = getReadOnlyContract();
    const result = await contract.verifyByQR(qrToken);
    const rawBatch = result.batch;
    const rawFarmer = result.farmer;

    const batchId = Number(rawBatch.batchId);
    const rawCustody: Array<{ actor: string; entity: string; timestamp: bigint; action: string }> =
      await contract.getCustodyChain(batchId);

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
      isAuthentic: rawBatch.isAuthentic,
      isRevoked: rawBatch.isRevoked,
    };

    return {
      batchId,
      farmer,
      batch,
      custodyChain,
      labReport: {
        moisturePercent: 17.5,
        brixPercent: 81.0,
        hmfMgPerKg: 15.0,
        diastaseNumber: 17.5,
        electricalConductivity: 0.4,
        purityScore: batch.qualityScore,
        grade: batch.grade,
        passedFSSAI: true,
        testedAt: new Date(batch.harvestTimestamp * 1000).toISOString().split("T")[0],
      },
      qrToken,
    };
  } catch (err) {
    console.warn("Contract read failed, falling back to local demo registry:", err);
    // Find matching demo batch or default to batch 1
    const match = DEMO_BATCHES.find((b) => b.qrToken === qrToken) || DEMO_BATCHES[0];
    return match;
  }
}

/**
 * Fetch batch metadata by Batch ID
 */
export async function fetchBatchById(batchId: number): Promise<BatchMetadata> {
  const match = DEMO_BATCHES.find((b) => b.batchId === batchId) || DEMO_BATCHES[0];
  try {
    const contract = getReadOnlyContract();
    const rawBatch = await contract.batches(batchId);
    if (!rawBatch || Number(rawBatch.batchId) === 0) {
      return match;
    }
    const rawFarmer = await contract.farmers(Number(rawBatch.farmerId));
    const rawCustody = await contract.getCustodyChain(batchId);

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
        isAuthentic: rawBatch.isAuthentic,
        isRevoked: rawBatch.isRevoked,
      },
      custodyChain: rawCustody.map((c: any) => ({
        actor: c.actor,
        entity: c.entity,
        timestamp: Number(c.timestamp),
        action: c.action,
      })),
      labReport: match.labReport,
      qrToken: match.qrToken,
      txHash: match.txHash,
    };
  } catch {
    return match;
  }
}
