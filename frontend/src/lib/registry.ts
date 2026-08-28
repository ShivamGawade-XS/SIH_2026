/**
 * Dynamic Batch & Farmer Registry Manager
 * Synchronizes SQLite database, memory, and browser storage for seamless persistence
 * Author: Shivam Gawade (@ShivamGawade-XS)
 */

import { DEMO_BATCHES } from "./constants";
import { BatchMetadata, Farmer } from "./types";

const STORAGE_KEY_BATCHES = "honeychain_custom_batches";
const STORAGE_KEY_FARMERS = "honeychain_custom_farmers";
const STORAGE_KEY_COMPLAINTS = "honeychain_complaints";

let syncChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    syncChannel = new BroadcastChannel("honeychain_sync");
  } catch {
    syncChannel = null;
  }
}

export interface ConsumerComplaint {
  id: string;
  batchId: number;
  qrToken: string;
  reportedBy: string;
  reason: string;
  date: string;
  status: string;
}

const INITIAL_COMPLAINTS: ConsumerComplaint[] = [
  {
    id: "CMP-2026-881",
    batchId: 2,
    qrToken: "TT-2026-00002",
    reportedBy: "Consumer (Kolkata Market)",
    reason: "Broken QR seal on lid and unusually thin consistency",
    date: "2026-08-24",
    status: "Under Lab Review",
  },
  {
    id: "CMP-2026-882",
    batchId: 1,
    qrToken: "TT-2026-00001",
    reportedBy: "Retailer (New Delhi)",
    reason: "Routine verification inquiry",
    date: "2026-08-25",
    status: "Verified Authentic",
  },
];

/**
 * Fetch batches asynchronously from Database API with synchronous fallback
 */
export async function fetchBatchesFromDB(): Promise<BatchMetadata[]> {
  try {
    const res = await fetch("/api/batches", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.batches && data.batches.length > 0) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(data.batches));
        }
        return data.batches;
      }
    }
  } catch (err) {
    console.warn("DB batch fetch failed, using local cache:", err);
  }
  return getCustomBatches();
}

export function getCustomBatches(): BatchMetadata[] {
  if (typeof window === "undefined") return DEMO_BATCHES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BATCHES);
    if (!raw) return DEMO_BATCHES;
    const parsed = JSON.parse(raw);
    return parsed.length > 0 ? parsed : DEMO_BATCHES;
  } catch {
    return DEMO_BATCHES;
  }
}

export async function saveCustomBatch(batch: BatchMetadata): Promise<void> {
  // 1. Optimistic local update
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BATCHES);
      const list: BatchMetadata[] = raw ? JSON.parse(raw) : [...DEMO_BATCHES];
      const index = list.findIndex((b) => b.batchId === batch.batchId);
      if (index >= 0) {
        list[index] = batch;
      } else {
        list.unshift(batch);
      }
      localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(list));

      if (syncChannel) {
        syncChannel.postMessage({ type: "BATCH_UPDATED", batchId: batch.batchId, batch });
      }
      window.dispatchEvent(new CustomEvent("honeychain_batch_updated", { detail: batch }));
    } catch (e) {
      console.warn("Local storage write failed:", e);
    }
  }

  // 2. Persist to SQLite Database via API
  try {
    await fetch("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        farmerId: batch.farmer.farmerId,
        botanicalFlora: batch.botanicalFlora,
        qualityScore: batch.batch.qualityScore,
        grade: batch.batch.grade,
        moisture: batch.labReport?.moisturePercent,
        brix: batch.labReport?.brixPercent,
        hmf: batch.labReport?.hmfMgPerKg,
        diastase: batch.labReport?.diastaseNumber,
        conductivity: batch.labReport?.electricalConductivity,
        c13Delta: batch.labReport?.c13IsotopeDelta,
        c4Sugar: batch.labReport?.c4SugarPercent,
        smrMarker: batch.labReport?.smrMarker,
        ipfsMetadataHash: batch.batch.ipfsMetadataHash,
        txHash: batch.txHash,
        blockNumber: batch.blockNumber,
      }),
    });
  } catch (err) {
    console.warn("DB batch persistence background call:", err);
  }
}

export function subscribeToBatchUpdates(callback: (batch: BatchMetadata) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type === "BATCH_UPDATED" && event.data.batch) {
      callback(event.data.batch);
    }
  };

  const handleCustom = (event: Event) => {
    const custom = event as CustomEvent<BatchMetadata>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY_BATCHES) {
      const batches = getCustomBatches();
      if (batches.length > 0) callback(batches[0]);
    }
  };

  if (syncChannel) {
    syncChannel.addEventListener("message", handleBroadcast);
  }
  window.addEventListener("honeychain_batch_updated", handleCustom);
  window.addEventListener("storage", handleStorage);

  return () => {
    if (syncChannel) {
      syncChannel.removeEventListener("message", handleBroadcast);
    }
    window.removeEventListener("honeychain_batch_updated", handleCustom);
    window.removeEventListener("storage", handleStorage);
  };
}

export async function fetchFarmersFromDB(): Promise<Farmer[]> {
  try {
    const res = await fetch("/api/farmers", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.farmers && data.farmers.length > 0) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_FARMERS, JSON.stringify(data.farmers));
        }
        return data.farmers;
      }
    }
  } catch (err) {
    console.warn("DB farmer fetch failed, using fallback:", err);
  }
  return getCustomFarmers();
}

export function getCustomFarmers(): Farmer[] {
  const initialFarmers: Farmer[] = DEMO_BATCHES.map((b) => b.farmer);
  if (typeof window === "undefined") return initialFarmers;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FARMERS);
    if (!raw) return initialFarmers;
    const parsed = JSON.parse(raw);
    return parsed.length > 0 ? parsed : initialFarmers;
  } catch {
    return initialFarmers;
  }
}

export async function saveCustomFarmer(farmer: Farmer): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FARMERS);
      const list: Farmer[] = raw ? JSON.parse(raw) : getCustomFarmers();
      list.push(farmer);
      localStorage.setItem(STORAGE_KEY_FARMERS, JSON.stringify(list));

      if (syncChannel) {
        syncChannel.postMessage({ type: "FARMER_REGISTERED", farmer });
      }
    } catch (e) {
      console.warn("Local farmer storage failed:", e);
    }
  }

  try {
    await fetch("/api/farmers/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: farmer.name,
        location: farmer.location,
        cooperativeId: farmer.cooperativeId,
        gpsLat: farmer.gpsLat,
        gpsLng: farmer.gpsLng,
        ipfsProfileHash: farmer.ipfsProfileHash,
        upiVpa: farmer.upiVpa,
      }),
    });
  } catch (err) {
    console.warn("DB farmer registration call:", err);
  }
}

export async function fetchComplaintsFromDB(): Promise<ConsumerComplaint[]> {
  try {
    const res = await fetch("/api/complaints", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.complaints && data.complaints.length > 0) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(data.complaints));
        }
        return data.complaints;
      }
    }
  } catch (err) {
    console.warn("DB complaint fetch failed:", err);
  }
  return getComplaints();
}

export function getComplaints(): ConsumerComplaint[] {
  if (typeof window === "undefined") return INITIAL_COMPLAINTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
    if (!raw) return INITIAL_COMPLAINTS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_COMPLAINTS;
  }
}

export async function saveComplaint(complaint: ConsumerComplaint): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const list = getComplaints();
      list.unshift(complaint);
      localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(list));
    } catch (e) {
      console.warn("Local complaint storage failed:", e);
    }
  }

  try {
    await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(complaint),
    });
  } catch (err) {
    console.warn("DB complaint submission failed:", err);
  }
}
