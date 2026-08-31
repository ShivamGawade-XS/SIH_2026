import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * KVIC Honey Mission Automated DBT (Direct Benefit Transfer) Subsidy Pipeline
 * Simulates automated PFMS / Aadhaar Payment Bridge (APB) subsidy disbursement
 * triggered when an immutable batch is minted on Polygon PoS.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { batchId, farmerId, farmerName, quantityKg, beeBoxes = 10, aadhaarLast4 = "9182" } = body;

    if (!batchId || !farmerId || !quantityKg) {
      return NextResponse.json(
        { error: "batchId, farmerId, and quantityKg are required for DBT processing" },
        { status: 400 }
      );
    }

    // KVIC Honey Mission Subsidy Rules:
    // 1. Box Subsidy: ₹2,000 per verified bee box (up to 10 boxes = ₹20,000)
    // 2. Production Incentive: ₹15/kg for raw organic certified harvests
    const boxSubsidyAmount = Math.min(10, Number(beeBoxes)) * 2000;
    const productionIncentive = Number(quantityKg) * 15;
    const totalDisbursement = boxSubsidyAmount + productionIncentive;

    const utrReference = `DBT-KVIC-${Date.now().toString().slice(-8)}`;
    const timestamp = new Date().toISOString();

    return NextResponse.json({
      success: true,
      dbt_record: {
        batchId: Number(batchId),
        farmerId: Number(farmerId),
        farmerName: farmerName || "KVIC Registered Beekeeper",
        scheme: "KVIC National Honey Mission (Direct Benefit Transfer)",
        aadhaarMasked: `XXXX-XXXX-${aadhaarLast4}`,
        disbursementStatus: "PROCESSED_CREDITED",
        utrNumber: utrReference,
        breakdown: {
          beeBoxesFunded: Number(beeBoxes),
          beeBoxSubsidyInr: boxSubsidyAmount,
          productionIncentiveInr: productionIncentive,
          totalDirectBenefitInr: totalDisbursement,
        },
        paymentBridge: "PFMS / NPCI Aadhaar Payment Bridge (APB)",
        onChainTriggerTx: `0x${Date.now().toString(16).padEnd(64, "e")}`,
        timestamp,
      },
      message: `₹${totalDisbursement} DBT subsidy successfully routed to ${farmerName || "Beekeeper"}'s Jan Dhan account via PFMS.`,
    });
  } catch (err: any) {
    console.error("DBT Disbursal Error:", err);
    return NextResponse.json({ error: "Failed to process DBT disbursement" }, { status: 500 });
  }
}
