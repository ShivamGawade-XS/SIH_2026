import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { BatchMetadata } from "@/lib/types";
import { DEMO_BATCHES } from "@/lib/constants";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const isNumeric = /^\d+$/.test(rawId);

  try {
    const batch = await prisma.batch.findFirst({
      where: isNumeric
        ? { id: Number(rawId) }
        : { qrToken: { equals: rawId } },
      include: {
        farmer: true,
        custodyLogs: {
          orderBy: { timestamp: "asc" },
        },
        labTests: {
          orderBy: { testedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!batch) {
      const demoMatch = DEMO_BATCHES.find(
        (b) =>
          String(b.batchId) === String(rawId) ||
          b.qrToken?.toLowerCase() === rawId.toLowerCase()
      );
      if (demoMatch) {
        return NextResponse.json({ success: true, batch: demoMatch });
      }
      return NextResponse.json(
        { error: `Batch '${rawId}' not found in registry` },
        { status: 404 }
      );
    }

    const latestLab = batch.labTests[0];

    const formatted: BatchMetadata = {
      batchId: batch.id,
      farmer: {
        farmerId: batch.farmer.id,
        name: batch.farmer.name,
        location: batch.farmer.location,
        cooperativeId: batch.farmer.cooperativeId,
        gpsLat: batch.farmer.gpsLat,
        gpsLng: batch.farmer.gpsLng,
        ipfsProfileHash: batch.farmer.ipfsProfileHash,
        upiVpa: batch.farmer.upiVpa,
        isVerified: batch.farmer.isVerified,
        registeredAt: Math.floor(batch.farmer.registeredAt.getTime() / 1000),
      },
      batch: {
        batchId: batch.id,
        farmerId: batch.farmerId,
        harvestTimestamp: Math.floor(batch.harvestTimestamp.getTime() / 1000),
        ipfsMetadataHash: batch.ipfsMetadataHash,
        qualityScore: batch.qualityScore,
        grade: batch.grade,
        isAuthentic: batch.isAuthentic && !batch.isRevoked && !batch.isDisputed,
        isRevoked: batch.isRevoked,
        isDisputed: batch.isDisputed,
        disputeReason: batch.disputeReason,
      },
      custodyChain: batch.custodyLogs.map((c) => ({
        actor: c.actor,
        entity: c.entity,
        timestamp: Math.floor(c.timestamp.getTime() / 1000),
        action: c.action,
      })),
      labReport: latestLab
        ? {
            moisturePercent: latestLab.moisturePercent,
            brixPercent: latestLab.brixIndex,
            hmfMgPerKg: latestLab.hmfMgKg,
            diastaseNumber: latestLab.diastaseActivity,
            electricalConductivity: latestLab.electricalConductivity,
            c13IsotopeDelta: latestLab.c13IsotopeDelta,
            c4SugarPercent: latestLab.c4SugarPercent,
            smrMarker: latestLab.smrMarker,
            purityScore: latestLab.purityScore,
            grade: latestLab.grade,
            passedFSSAI: latestLab.passedFSSAI,
            testedAt: latestLab.testedAt.toISOString(),
            engine: latestLab.engine,
          }
        : {
            moisturePercent: 17.5,
            brixPercent: 81.0,
            hmfMgPerKg: 14.0,
            diastaseNumber: 16.0,
            electricalConductivity: 0.4,
            purityScore: batch.qualityScore,
            grade: batch.grade,
            passedFSSAI: true,
            testedAt: batch.createdAt.toISOString(),
          },
      qrToken: batch.qrToken,
      txHash: batch.txHash || undefined,
      blockNumber: batch.blockNumber || undefined,
      botanicalFlora: batch.botanicalFlora || undefined,
    };

    return NextResponse.json({ success: true, batch: formatted });
  } catch (err: any) {
    console.error("Get batch by ID error:", err);
    const demoMatch = DEMO_BATCHES.find(
      (b) =>
        String(b.batchId) === String(rawId) ||
        b.qrToken?.toLowerCase() === rawId.toLowerCase()
    );
    if (demoMatch) {
      return NextResponse.json({ success: true, batch: demoMatch });
    }
    return NextResponse.json(
      { error: "Failed to retrieve batch" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Active officer or admin session required." },
        { status: 401 }
      );
    }

    const batchId = Number(rawId);
    const body = await req.json();
    const { action, actor, entity, details, disputeReason, restoreAuthentic } = body;

    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 }
      );
    }

    if (action === "ADD_CUSTODY") {
      await prisma.custodyLog.create({
        data: {
          batchId,
          actor: actor || session.name || "Authorized Inspector",
          entity: entity || session.cooperative || "Supply Chain Node",
          action: details || "Custody transfer verified and sealed",
          timestamp: new Date(),
        },
      });
      return NextResponse.json({ success: true, message: "Custody event logged" });
    }

    if (action === "FLAG_DISPUTE") {
      if (session.role !== "ADMIN" && session.role !== "LAB_ANALYST") {
        return NextResponse.json(
          { error: "Forbidden: Only Admin or Lab Analysts can flag dispute records." },
          { status: 403 }
        );
      }

      await prisma.batch.update({
        where: { id: batchId },
        data: {
          isDisputed: true,
          disputeReason: disputeReason || "Counterfeiting / tampering alert raised",
        },
      });

      await prisma.custodyLog.create({
        data: {
          batchId,
          actor: actor || session.name || "District Supervisor",
          entity: entity || "KVIC Fraud Prevention Unit",
          action: `FRAUD DISPUTE FLAGGED: ${disputeReason || "Quality / Seal Anomaly"}`,
          timestamp: new Date(),
        },
      });

      return NextResponse.json({ success: true, message: "Batch flagged for dispute" });
    }

    if (action === "RESOLVE_DISPUTE") {
      if (session.role !== "ADMIN" && session.role !== "LAB_ANALYST") {
        return NextResponse.json(
          { error: "Forbidden: Only Admin or Lab Analysts can resolve disputes." },
          { status: 403 }
        );
      }

      await prisma.batch.update({
        where: { id: batchId },
        data: {
          isDisputed: false,
          disputeReason: null,
          isAuthentic: !!restoreAuthentic,
        },
      });

      await prisma.custodyLog.create({
        data: {
          batchId,
          actor: actor || session.name || "Chief Quality Officer",
          entity: entity || "NBB Disciplinary Committee",
          action: `DISPUTE RESOLVED: ${restoreAuthentic ? "Authenticity restored after re-testing" : "Batch permanently revoked"}`,
          timestamp: new Date(),
        },
      });

      return NextResponse.json({ success: true, message: "Dispute status resolved" });
    }

    if (action === "REVOKE_BATCH") {
      if (session.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Forbidden: Emergency batch revocation requires ADMIN privileges." },
          { status: 403 }
        );
      }

      await prisma.batch.update({
        where: { id: batchId },
        data: {
          isRevoked: true,
          isAuthentic: false,
          disputeReason: disputeReason || "Emergency administrative revocation",
        },
      });

      await prisma.custodyLog.create({
        data: {
          batchId,
          actor: actor || session.name || "KVIC Central Administrator",
          entity: "KVIC Central Administration",
          action: `PERMANENT EMERGENCY REVOCATION: ${disputeReason || "Administrative Revocation Order"}`,
          timestamp: new Date(),
        },
      });

      return NextResponse.json({ success: true, message: "Batch permanently revoked" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("Update batch error:", err);
    return NextResponse.json(
      { error: "Failed to update batch state" },
      { status: 500 }
    );
  }
}
