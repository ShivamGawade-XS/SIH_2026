import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Farmer } from "@/lib/types";

export const dynamic = "force-dynamic";

const DEMO_FARMERS: Farmer[] = [
  {
    farmerId: 1,
    name: "Rajesh Kumar Verma",
    location: "Muzaffarpur, Bihar",
    cooperativeId: "KVIC-BIHAR-001",
    gpsLat: 26.1208,
    gpsLng: 85.3905,
    ipfsProfileHash: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    upiVpa: "rajeshverma@upi",
    isVerified: true,
    registeredAt: 1704067200,
  },
  {
    farmerId: 2,
    name: "Lakshmi Devi & Sundarbans Cooperative",
    location: "Sundarbans Biosphere Reserve, West Bengal",
    cooperativeId: "KVIC-BENGAL-009",
    gpsLat: 21.9497,
    gpsLng: 89.1833,
    ipfsProfileHash: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    upiVpa: "lakshmidevi@upi",
    isVerified: true,
    registeredAt: 1704067200,
  },
];

export async function GET() {
  try {
    const farmers = await prisma.farmer.findMany({
      orderBy: { id: "asc" },
      include: { _count: { select: { batches: true } } },
    });

    if (farmers.length === 0) {
      return NextResponse.json({ success: true, farmers: DEMO_FARMERS });
    }

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
    return NextResponse.json({ success: true, farmers: DEMO_FARMERS });
  }
}
