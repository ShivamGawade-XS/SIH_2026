import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const farmerId = searchParams.get("farmerId");
    const batchId = searchParams.get("batchId");

    const where: any = {};
    if (farmerId) where.farmerId = Number(farmerId);
    if (batchId) where.batchId = Number(batchId);

    const tips = await prisma.tipPayment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        farmer: { select: { name: true, location: true, upiVpa: true } },
        batch: { select: { qrToken: true } },
      },
    });

    const totalAmount = tips
      .filter((t) => t.status === "CONFIRMED")
      .reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      success: true,
      tips: tips.map((t) => ({
        id: t.id,
        batchId: t.batchId,
        farmerId: t.farmerId,
        amount: t.amount,
        utrNumber: t.utrNumber,
        tipperName: t.tipperName,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
        farmerName: t.farmer.name,
        farmerLocation: t.farmer.location,
      })),
      totalConfirmed: totalAmount,
      count: tips.length,
    });
  } catch (err: any) {
    console.error("Fetch tips error:", err);
    return NextResponse.json({
      success: true,
      tips: [],
      totalConfirmed: 0,
      count: 0,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { batchId, farmerId, amount, utrNumber, tipperName } = body;

    if (!batchId || !farmerId || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "batchId, farmerId, and valid positive amount are required" },
        { status: 400 }
      );
    }

    const tip = await prisma.tipPayment.create({
      data: {
        batchId: Number(batchId),
        farmerId: Number(farmerId),
        amount: Number(amount),
        utrNumber: utrNumber ? String(utrNumber).trim() : null,
        tipperName: tipperName || "Anonymous Consumer",
        status: utrNumber ? "CONFIRMED" : "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      tip: {
        id: tip.id,
        amount: tip.amount,
        status: tip.status,
        utrNumber: tip.utrNumber,
        createdAt: tip.createdAt.toISOString(),
      },
      message: `₹${tip.amount} tip ${tip.status === "CONFIRMED" ? "confirmed" : "pending verification"}`,
    });
  } catch (err: any) {
    console.error("Create tip error:", err);
    return NextResponse.json({ error: "Failed to record tip payment" }, { status: 500 });
  }
}
