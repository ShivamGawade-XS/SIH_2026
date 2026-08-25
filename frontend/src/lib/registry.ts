/**
 * Dynamic Batch & Farmer Registry Manager
 * Synchronizes on-chain state, memory, and browser storage for live hackathon demos
 * Author: Shivam Gawade (@ShivamGawade-XS)
 */

import { DEMO_BATCHES } from "./constants";
import { BatchMetadata, Farmer, HoneyBatch } from "./types";

const STORAGE_KEY_BATCHES = "honeychain_custom_batches";
const STORAGE_KEY_FARMERS = "honeychain_custom_farmers";
const STORAGE_KEY_COMPLAINTS = "honeychain_complaints";

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

export function getCustomBatches(): BatchMetadata[] {
  if (typeof window === "undefined") return DEMO_BATCHES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BATCHES);
    if (!raw) return DEMO_BATCHES;
    const parsed = JSON.parse(raw);
    return [...DEMO_BATCHES, ...parsed];
  } catch {
    return DEMO_BATCHES;
  }
}

export function saveCustomBatch(batch: BatchMetadata): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BATCHES);
    const list: BatchMetadata[] = raw ? JSON.parse(raw) : [];
    const index = list.findIndex((b) => b.batchId === batch.batchId);
    if (index >= 0) {
      list[index] = batch;
    } else {
      list.unshift(batch);
    }
    localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(list));
  } catch (e) {
    console.warn("Failed to persist batch locally:", e);
  }
}

export function getCustomFarmers(): Farmer[] {
  const initialFarmers: Farmer[] = DEMO_BATCHES.map((b) => b.farmer);
  if (typeof window === "undefined") return initialFarmers;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FARMERS);
    if (!raw) return initialFarmers;
    const parsed = JSON.parse(raw);
    return [...initialFarmers, ...parsed];
  } catch {
    return initialFarmers;
  }
}

export function saveCustomFarmer(farmer: Farmer): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FARMERS);
    const list: Farmer[] = raw ? JSON.parse(raw) : [];
    list.push(farmer);
    localStorage.setItem(STORAGE_KEY_FARMERS, JSON.stringify(list));
  } catch (e) {
    console.warn("Failed to persist farmer locally:", e);
  }
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

export function saveComplaint(complaint: ConsumerComplaint): void {
  if (typeof window === "undefined") return;
  try {
    const list = getComplaints();
    list.unshift(complaint);
    localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(list));
  } catch (e) {
    console.warn("Failed to persist complaint locally:", e);
  }
}
