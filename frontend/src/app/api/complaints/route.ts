import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const complaints = await prisma.complaint.findMany({
      orderBy: { createdAt: "desc" },
      include: { batch: { select: { qrToken: true, grade: true } } },
    });

    return NextResponse.json({
      success: true,
      complaints: complaints.map((c) => ({
        id: c.id,
        batchId: c.batchId,
        qrToken: c.qrToken,
        reportedBy: c.reportedBy,
        reason: c.reason,
        status: c.status,
        date: c.date,
      })),
    });
  } catch (err: any) {
    console.error("Fetch complaints error:", err);
    return NextResponse.json({ error: "Failed to fetch complaints" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { batchId, qrToken, reportedBy, reason } = body;

    if (!batchId || !reason) {
      return NextResponse.json(
        { error: "batchId and reason are required" },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.create({
      data: {
        batchId: Number(batchId),
        qrToken: qrToken || "",
        reportedBy: reportedBy || "Anonymous Consumer",
        reason,
        status: "Under Review",
        date: new Date().toISOString().split("T")[0],
      },
    });

    return NextResponse.json({
      success: true,
      complaint: {
        id: complaint.id,
        batchId: complaint.batchId,
        qrToken: complaint.qrToken,
        reportedBy: complaint.reportedBy,
        reason: complaint.reason,
        status: complaint.status,
        date: complaint.date,
      },
    });
  } catch (err: any) {
    console.error("Create complaint error:", err);
    return NextResponse.json({ error: "Failed to file complaint" }, { status: 500 });
  }
}
