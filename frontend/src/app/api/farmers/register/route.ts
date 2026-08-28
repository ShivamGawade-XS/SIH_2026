import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkGIZone } from "@/lib/geo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, location, cooperativeId, gpsLat, gpsLng, ipfsProfileHash, upiVpa, registeredById } = body;

    if (!name || !location || !cooperativeId) {
      return NextResponse.json(
        { error: "Name, location, and cooperative code are required" },
        { status: 400 }
      );
    }

    const lat = gpsLat ? Number(gpsLat) : null;
    const lng = gpsLng ? Number(gpsLng) : null;

    // Check if GPS coordinates fall in a registered GI zone
    let giZone = null;
    if (lat !== null && lng !== null) {
      giZone = checkGIZone(lat, lng);
    }

    const farmer = await prisma.farmer.create({
      data: {
        name: name.trim(),
        location: location.trim(),
        cooperativeId: cooperativeId.trim(),
        gpsLat: lat,
        gpsLng: lng,
        ipfsProfileHash: ipfsProfileHash || "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        upiVpa: upiVpa ? upiVpa.trim() : null,
        isVerified: true,
        registeredById: registeredById || null,
      },
    });

    return NextResponse.json({
      success: true,
      farmerId: farmer.id,
      farmer: {
        farmerId: farmer.id,
        name: farmer.name,
        location: farmer.location,
        cooperativeId: farmer.cooperativeId,
        gpsLat: farmer.gpsLat,
        gpsLng: farmer.gpsLng,
        upiVpa: farmer.upiVpa,
        isVerified: farmer.isVerified,
        registeredAt: Math.floor(farmer.registeredAt.getTime() / 1000),
      },
      giZone: giZone
        ? {
            name: giZone.name,
            giCertNo: giZone.giCertNo,
            flora: giZone.flora,
            verified: true,
          }
        : null,
      message: `Beekeeper #${farmer.id} onboarded and verified successfully`,
    });
  } catch (err: any) {
    console.error("Register farmer error:", err);
    return NextResponse.json(
      { error: "Failed to onboard beekeeper" },
      { status: 500 }
    );
  }
}
