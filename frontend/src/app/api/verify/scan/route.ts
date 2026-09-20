import { NextRequest, NextResponse } from "next/server";
import {
  evaluateScanVelocity,
  haversineDistanceKm,
  resolveLocation,
  ScanRecord,
  CloneDetectionResult,
  DEMO_CITIES,
} from "@/lib/clone-detection";

declare global {
  // eslint-disable-next-line no-var
  var __honeyChainScanStore: Map<string, ScanRecord> | undefined;
  // eslint-disable-next-line no-var
  var __honeyChainScanHistory: ScanRecord[] | undefined;
}

const scanStore: Map<string, ScanRecord> =
  global.__honeyChainScanStore ||
  (global.__honeyChainScanStore = new Map());

const scanHistory: ScanRecord[] =
  global.__honeyChainScanHistory ||
  (global.__honeyChainScanHistory = []);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const batchId = Number(body.batchId || 1);
    const qrToken = String(body.qrToken || `TT-2026-0000${batchId}`).trim();
    const demoCity = body.demoCity ? String(body.demoCity).trim().toLowerCase() : null;
    const now = Math.floor(Date.now() / 1000);

    const resolved = resolveLocation(demoCity, body.lat, body.lng);
    const isDemoLocation = resolved.isDemo;

    const currentScan: ScanRecord = {
      batchId,
      qrToken,
      lat: resolved.lat,
      lng: resolved.lng,
      city: resolved.city,
      timestamp: now,
      isDemoLocation,
      userAgent: req.headers.get("user-agent") || undefined,
    };

    const prevScan = scanStore.get(qrToken);

    let cloneEvaluation: CloneDetectionResult = {
      isClone: false,
      distanceKm: 0,
      timeDeltaSeconds: 0,
      impliedSpeedKmh: 0,
      warningMessage: undefined,
      prevScan: undefined,
      currentScan,
    };

    if (prevScan) {
      cloneEvaluation = evaluateScanVelocity(prevScan, currentScan);
    }

    // Update store with current scan
    scanStore.set(qrToken, currentScan);
    scanHistory.push(currentScan);
    if (scanHistory.length > 100) {
      scanHistory.shift();
    }

    return NextResponse.json({
      success: true,
      storeType: "demo store (in-memory)",
      isClone: cloneEvaluation.isClone,
      warningMessage: cloneEvaluation.warningMessage || (cloneEvaluation.isClone ? "This QR was scanned in two places that are too far apart. It may be copied." : undefined),
      distanceKm: cloneEvaluation.distanceKm,
      timeDeltaSeconds: cloneEvaluation.timeDeltaSeconds,
      impliedSpeedKmh: cloneEvaluation.impliedSpeedKmh,
      prevScan: prevScan || null,
      currentScan,
      isDemoLocation,
      locationCity: resolved.city,
    });
  } catch (err: any) {
    console.error("Scan recording error:", err);
    return NextResponse.json(
      { error: "Failed to record verification scan", details: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const qrToken = searchParams.get("qr");

  if (qrToken) {
    const lastScan = scanStore.get(qrToken.trim());
    return NextResponse.json({
      storeType: "demo store (in-memory)",
      qrToken,
      lastScan: lastScan || null,
    });
  }

  return NextResponse.json({
    storeType: "demo store (in-memory)",
    totalRecordedScans: scanHistory.length,
    activeMonitoredQRs: scanStore.size,
    availableDemoCities: Object.keys(DEMO_CITIES),
  });
}
