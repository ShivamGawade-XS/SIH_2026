import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Farmer } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const farmers = await prisma.farmer.findMany({
      orderBy: { id: "asc" },
      include: {
        _count: {
          select: { batches: true },
        },
      },
    });

    const formatted: Farmer[] = farmers.map((f) => ({
      farmerId: f.id,
      name: f.name,
      location: f.location,
      cooperativeId: f.cooperativeId,
      gpsLat: f.gpsLat,
      gpsLng: f.gpsLng,
      ipfsProfileHash: f.ipfsProfileHash,
      upiVpa: f.upiVpa,
      isVerified: f.isVerified,
      registeredAt: Math.floor(f.registeredAt.getTime() / 1000),
    }));

    return NextResponse.json({ success: true, farmers: formatted });
  } catch (err: any) {
    console.error("Fetch farmers error:", err);
    return NextResponse.json(
      { error: "Failed to fetch beekeepers" },
      { status: 500 }
    );
  }
}
