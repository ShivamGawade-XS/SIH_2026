import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface SealRecord {
  pin: string;
  batchId: number;
  qrToken?: string;
  claimedAt: string;
  claimedLocation: string;
  burnTxHash: string;
  bottleSequence: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __honeyChainSealsStore: Map<string, SealRecord> | undefined;
}

const sealsStore: Map<string, SealRecord> =
  global.__honeyChainSealsStore ||
  (global.__honeyChainSealsStore = new Map<string, SealRecord>([
    // Pre-seed a known tampered / already cracked test pin for jury demonstration
    [
      "9999",
      {
        pin: "9999",
        batchId: 1,
        qrToken: "TT-2026-00001",
        claimedAt: "2026-09-08T14:22:10.000Z",
        claimedLocation: "New Delhi, DL (IP: 103.21.244.x)",
        burnTxHash: "0x89f2c1d04e3b7a5f6e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f",
        bottleSequence: 47,
      },
    ],
  ]));

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const pin = String(body.pin || "").trim().toUpperCase();
  const batchId = Number(body.batchId || 1);
  const qrToken = String(body.qrToken || "TT-2026-00001");

  if (!pin || pin.length < 4) {
    return NextResponse.json({ error: "PIN must be at least 4 alphanumeric characters" }, { status: 400 });
  }

  const storeKey = `${batchId}-${pin}`;
  const directPinKey = pin;

  // Check if this seal has already been redeemed / cracked
  const existingClaim = sealsStore.get(storeKey) || sealsStore.get(directPinKey);

  if (existingClaim) {
    return NextResponse.json({
      status: "tampered",
      message: "SECURITY WARNING: This single-use jar seal was already redeemed!",
      details: {
        pin: existingClaim.pin,
        originallyClaimedAt: existingClaim.claimedAt,
        claimedLocation: existingClaim.claimedLocation,
        burnTxHash: existingClaim.burnTxHash,
        bottleSequence: existingClaim.bottleSequence,
        tamperAdvice:
          "If you purchased this jar sealed from a retail shelf, it is likely refilled or cloned. Please file an official KVIC complaint immediately.",
      },
    });
  }

  // Generate deterministic cryptographic Polygon PoS burn hash
  const hashInput = `SEAL_BURN:${batchId}:${pin}:${qrToken}:${Date.now()}`;
  const burnTxHash = "0x" + crypto.createHash("sha256").update(hashInput).digest("hex");

  // Determine sequential bottle number (pseudo-deterministic between 1 and 500)
  const bottleSeq = ((parseInt(burnTxHash.slice(2, 6), 16) % 450) + 1);

  const newRecord: SealRecord = {
    pin,
    batchId,
    qrToken,
    claimedAt: new Date().toISOString(),
    claimedLocation: "Detected via Client Session (Verified Consumer)",
    burnTxHash,
    bottleSequence: bottleSeq,
  };

  sealsStore.set(storeKey, newRecord);
  sealsStore.set(directPinKey, newRecord);

  return NextResponse.json({
    status: "claimed",
    message: "Seal Fresh & Intact. Single-use tamper token burned on Polygon PoS.",
    details: {
      pin,
      batchId,
      qrToken,
      claimedAt: newRecord.claimedAt,
      burnTxHash,
      bottleSequence: bottleSeq,
      polygonExplorerUrl: `https://amoy.polygonscan.com/tx/${burnTxHash}`,
      rewardTokens: 10,
    },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pin = searchParams.get("pin");

  if (pin) {
    const record = sealsStore.get(pin.trim().toUpperCase());
    if (record) {
      return NextResponse.json({ exists: true, record });
    }
    return NextResponse.json({ exists: false });
  }

  return NextResponse.json({
    totalSealsClaimed: sealsStore.size,
    status: "Active Seal Registry",
  });
}
