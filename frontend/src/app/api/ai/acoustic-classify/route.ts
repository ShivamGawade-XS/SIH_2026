import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { frequencyHz, amplitudeDb, hiveId } = body;

    const freq = Number(frequencyHz) || 235;

    let status = "CALM";
    let swarmRisk = 8;
    let classification = "Normal Calm Foraging";
    let recommendation = "Brood thermoregulation is optimal. Hive conditions stable.";

    if (freq >= 500) {
      status = "CRITICAL";
      swarmRisk = 94;
      classification = "Pre-Swarm Excitement Spike";
      recommendation = "Imminent swarm departure (< 12 hours). Add supers and swarm traps immediately.";
    } else if (freq >= 400) {
      status = "ANOMALY";
      swarmRisk = 35;
      classification = "Virgin Queen Piping";
      recommendation = "New virgin queen emergence detected. Inspect queen cells for duplicate emergence.";
    } else if (freq >= 300) {
      status = "WARNING";
      swarmRisk = 45;
      classification = "Varroa Parasitic & Heat Distress";
      recommendation = "Elevated fanning frequency detected. Check bottom boards for Varroa mite count.";
    }

    return NextResponse.json({
      success: true,
      hiveId: hiveId || "HIVE-WB-0391",
      analyzedFrequencyHz: freq,
      status,
      swarmRiskPercent: swarmRisk,
      classification,
      recommendation,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to process acoustic analysis" }, { status: 500 });
  }
}
