import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const moisture = parseFloat(searchParams.get("moisture") || "18.2");
  const hmf = parseFloat(searchParams.get("hmf") || "14.5");
  const brix = parseFloat(searchParams.get("brix") || "71.4");
  const diastase = parseFloat(searchParams.get("diastase") || "14.2");
  const c4 = parseFloat(searchParams.get("c4") || "0.8");
  const hz = parseFloat(searchParams.get("hz") || "235");

  return NextResponse.json(computeAttributions(moisture, hmf, brix, diastase, c4, hz));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const moisture = parseFloat(body.moisture ?? 18.2);
    const hmf = parseFloat(body.hmf ?? 14.5);
    const brix = parseFloat(body.brix ?? 71.4);
    const diastase = parseFloat(body.diastase ?? 14.2);
    const c4 = parseFloat(body.c4 ?? 0.8);
    const hz = parseFloat(body.hz ?? body.frequency_hz ?? 235);

    return NextResponse.json(computeAttributions(moisture, hmf, brix, diastase, c4, hz));
  } catch {
    return NextResponse.json({ error: "Invalid JSON request payload" }, { status: 400 });
  }
}

function computeAttributions(
  moisture: number,
  hmf: number,
  brix: number,
  diastase: number,
  c4: number,
  hz: number
) {
  // 1. Moisture Attribution
  const moisturePoints =
    moisture <= 18.0 ? 18.0 : moisture <= 20.0 ? 8.0 : Math.max(-30.0, -20.0 * (moisture - 20.0));
  const moistureRationale =
    moisture <= 18.0
      ? `Optimal low moisture (${moisture.toFixed(1)}% <= 18.0%) prevents osmophilic yeast fermentation.`
      : moisture <= 20.0
      ? `Acceptable moisture (${moisture.toFixed(1)}% <= 20.0%) within domestic FSSAI limit.`
      : `High moisture (${moisture.toFixed(1)}% > 20.0%) risks post-harvest fermentation.`;

  // 2. HMF Attribution
  const hmfPoints =
    hmf <= 15.0 ? 22.0 : hmf <= 40.0 ? 12.0 : Math.max(-35.0, -15.0 - (hmf - 40.0) * 0.5);
  const hmfRationale =
    hmf <= 15.0
      ? `Low HMF (${hmf.toFixed(1)} mg/kg) confirms cold-extracted raw honey freshness.`
      : hmf <= 40.0
      ? `Moderate HMF (${hmf.toFixed(1)} mg/kg) complies with FSSAI statutory threshold.`
      : `Elevated HMF (${hmf.toFixed(1)} mg/kg) signals excessive heat exposure or prolonged aging.`;

  // 3. Brix Attribution
  const brixPoints = brix >= 75.0 ? 20.0 : brix >= 65.0 ? 10.0 : -25.0;
  const brixRationale =
    brix >= 75.0
      ? `High Brix (${brix.toFixed(1)}°Bx) verifies natural floral nectar density.`
      : brix >= 65.0
      ? `Standard Brix (${brix.toFixed(1)}°Bx) meets basic commercial requirements.`
      : `Low Brix (${brix.toFixed(1)}°Bx) indicates dilution or immature comb harvesting.`;

  // 4. Diastase Attribution
  const diastasePoints = diastase >= 12.0 ? 18.0 : diastase >= 8.0 ? 8.0 : -15.0;
  const diastaseRationale =
    diastase >= 12.0
      ? `High enzyme activity (${diastase.toFixed(1)} DN) proves active salivary enzymes.`
      : diastase >= 8.0
      ? `Standard enzyme activity (${diastase.toFixed(1)} DN) meets FSSAI benchmark.`
      : `Low diastase (${diastase.toFixed(1)} DN) indicates denaturation via ultra-pasteurization.`;

  // 5. C4 Isotope Sugars (EA-IRMS)
  const c4Points = c4 <= 2.0 ? 16.0 : c4 <= 7.0 ? 2.0 : -40.0;
  const c4Rationale =
    c4 <= 2.0
      ? `Undetectable C4 plant sugars (${c4.toFixed(1)}%) proves zero cane or corn syrup.`
      : c4 <= 7.0
      ? `Borderline C4 sugars (${c4.toFixed(1)}%) requires secondary NMR profiling.`
      : `Adulterated C4 sugars (${c4.toFixed(1)}% > 7.0%) signals artificial syrup feeding.`;

  const attributions = [
    {
      feature: "Hydroxymethylfurfural (HMF)",
      value: `${hmf.toFixed(1)} mg/kg`,
      benchmark: "Domestic limit <= 40 mg/kg",
      points: Number(hmfPoints.toFixed(1)),
      positive: hmfPoints > 0,
      description: hmfRationale,
    },
    {
      feature: "Moisture Content",
      value: `${moisture.toFixed(1)}%`,
      benchmark: "FSSAI limit <= 20.0%",
      points: Number(moisturePoints.toFixed(1)),
      positive: moisturePoints > 0,
      description: moistureRationale,
    },
    {
      feature: "Brix Index & Hexose Density",
      value: `${brix.toFixed(1)}°Bx`,
      benchmark: "FSSAI limit >= 65.0°Bx",
      points: Number(brixPoints.toFixed(1)),
      positive: brixPoints > 0,
      description: brixRationale,
    },
    {
      feature: "Diastase (Amylase) Activity",
      value: `${diastase.toFixed(1)} DN`,
      benchmark: "FSSAI limit >= 8.0 DN",
      points: Number(diastasePoints.toFixed(1)),
      positive: diastasePoints > 0,
      description: diastaseRationale,
    },
    {
      feature: "C4 Plant Sugars (EA-IRMS)",
      value: `${c4.toFixed(1)}%`,
      benchmark: "Statutory limit <= 7.0%",
      points: Number(c4Points.toFixed(1)),
      positive: c4Points > 0,
      description: c4Rationale,
    },
  ];

  const baselineScore = 10.0;
  const totalRaw = baselineScore + attributions.reduce((acc, curr) => acc + curr.points, 0);
  const normalizedPurity = Number(Math.max(25.0, Math.min(99.8, totalRaw)).toFixed(1));

  // Bio-Acoustics
  let band = "";
  let behavior = "";
  let urgency = "";
  let healthScore = 95;

  if (hz >= 140 && hz <= 260) {
    band = "Brood Thermoregulation (Normal Fanning)";
    behavior = "Workers fanning wings to circulate air and maintain 34.5°C brood temperature.";
    urgency = "LOW - Optimal Colony Vitality";
    healthScore = 98;
  } else if (hz > 260 && hz <= 330) {
    band = "Intense Foraging & Nectar Dehydration";
    behavior = "High incoming field nectar flow being vigorously dried in comb cells.";
    urgency = "LOW - High Nectar Flow";
    healthScore = 94;
  } else if (hz > 330 && hz <= 450) {
    band = "Queen Piping / Emergence Call";
    behavior = "Virgin queen vibrating thorax against comb prior to flight or emergence.";
    urgency = "MEDIUM - Queen Emergence Event";
    healthScore = 82;
  } else if (hz > 450 && hz <= 650) {
    band = "Pre-Swarm Buzzing Harmonic";
    behavior = "Scout recruitment buzzing; colony preparing to swarm within 24-48 hours.";
    urgency = "HIGH - Swarm Departure Imminent";
    healthScore = 55;
  } else {
    band = "Predator Defense / Distress Harmonic";
    behavior = "High-pitch acoustic agitation reacting to hive invasion or predator.";
    urgency = "CRITICAL - Colony Under Attack";
    healthScore = 40;
  }

  return {
    status: "success",
    timestamp: new Date().toISOString(),
    purity: {
      score: normalizedPurity,
      baselineAnchor: baselineScore,
      grade: normalizedPurity >= 90 ? "Special Grade" : normalizedPurity >= 80 ? "Grade A" : "Standard",
      attributions,
      primaryDriver: attributions.reduce((prev, current) => (prev.points > current.points ? prev : current)).feature,
    },
    acoustics: {
      frequencyHz: hz,
      harmonicBand: band,
      behaviorInterpretation: behavior,
      urgency,
      colonyVitalityScore: healthScore,
      actionRecommendation:
        healthScore >= 90
          ? "No intervention required. Apiary operating in peak vitality."
          : healthScore >= 70
          ? "Inspect hive supers and check queen cells during weekly inspection."
          : "Urgent apiary inspection required: check for swarming prep or pest attack.",
    },
  };
}
