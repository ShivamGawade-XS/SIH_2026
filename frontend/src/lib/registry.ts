/**
 * Dynamic Batch & Farmer Registry Manager
 * Synchronizes on-chain state, memory, and browser storage for live hackathon demos
 * Author: Shivam Gawade (@ShivamGawade-XS)
 */

import { DEMO_BATCHES } from "./constants";
import { BatchMetadata, Farmer, HoneyBatch } from "./types";

const STORAGE_KEY_BATCHES = "honeychain_custom_batches";
const STORAGE_KEY_FARMERS = "honeychain_custom_farmers";

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
    list.unshift(batch);
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
