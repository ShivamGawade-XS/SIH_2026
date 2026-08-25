import { NextRequest, NextResponse } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${AI_SERVICE_URL}/api/quality/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        moisture_percent: Number(body.moisture_percent || 17.5),
        brix_index: Number(body.brix_index || 81.0),
        hmf_mg_kg: Number(body.hmf_mg_kg || 15.0),
        diastase_activity: Number(body.diastase_activity || 16.0),
        electrical_conductivity: Number(body.electrical_conductivity || 0.45),
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.warn("Could not reach external AI service, using mathematical fallback:", error?.message);

    // Fallback mathematical engine matching FastAPI rule engine
    const { moisture_percent = 17.5, brix_index = 81.0, hmf_mg_kg = 15.0, diastase_activity = 16.0 } =
      await req.json().catch(() => ({}));

    let score = 100.0;
    if (moisture_percent > 20.0) score -= (moisture_percent - 20.0) * 15.0;
    if (brix_index < 80.0) score -= (80.0 - brix_index) * 4.0;
    if (hmf_mg_kg > 40.0) score -= (hmf_mg_kg - 40.0) * 2.5;
    if (diastase_activity < 8.0) score -= (8.0 - diastase_activity) * 6.0;

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    let grade = "Grade A+ (Premium Raw Organic)";
    if (finalScore < 50) grade = "Substandard / Suspected Adulteration";
    else if (finalScore < 75) grade = "Grade B (Commercial Grade)";
    else if (finalScore < 88) grade = "Grade A (Standard Pure Honey)";

    return NextResponse.json({
      quality_score: finalScore,
      grade,
      is_authentic: finalScore >= 70,
      fssai_compliance: finalScore >= 70,
      breakdown: {
        moisture_status: moisture_percent <= 20.0 ? "Optimal" : "Elevated",
        brix_status: brix_index >= 80.0 ? "Optimal" : "Low",
        hmf_status: hmf_mg_kg <= 40.0 ? "Optimal" : "Degraded",
        diastase_status: diastase_activity >= 8.0 ? "Active" : "Depleted",
      },
    });
  }
}
