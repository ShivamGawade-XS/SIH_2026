import { NextRequest, NextResponse } from "next/server";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ||
  process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
  "https://honeychain-ai-service.onrender.com";

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const hiveId = body.hive_id || "HIVE-WB-0391";
  const injectAlert = Boolean(body.inject_varroa_alert);
  const reset = Boolean(body.reset);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${AI_SERVICE_URL}/api/iot/trigger-alert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hive_id: hiveId,
        inject_varroa_alert: injectAlert,
        weight_drop_kg: body.weight_drop_kg ?? 0.85,
        acoustic_increase_db: body.acoustic_increase_db ?? 15.0,
        reset: reset,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        ...data,
        source: "Render FastAPI Microservice",
      });
    }
  } catch (err) {
    console.warn("AI service trigger proxy fallback:", err);
  }

  // Graceful offline simulated response
  return NextResponse.json({
    status: "Success",
    message: reset
      ? `🔄 Hive ${hiveId} reset to optimal baseline (235 Hz, 45.2 kg)`
      : `⚡ ALERT TRIGGERED for ${hiveId}: Weight -0.85kg, Acoustics +15.0dB`,
    active_alert: reset ? false : injectAlert,
    hive: {
      hive_id: `${hiveId} (Sundarbans Delta - Stage Demo)`,
      location: "Sundarbans, West Bengal",
      weight_kg: reset ? 45.2 : 44.35,
      internal_temp_c: reset ? 34.8 : 36.4,
      humidity_percent: reset ? 63.5 : 71.2,
      acoustic_frequency_hz: reset ? 235.0 : 385.0,
      status: reset
        ? "Optimal Colony Health"
        : "CRITICAL: Varroa/Colony Stress Detected (Weight Drop + Acoustic Rise)",
      has_alert: reset ? false : injectAlert,
      alert_type: reset ? null : "VARROA_STRESS_ANOMALY",
      last_updated: Math.floor(Date.now() / 1000),
    },
    source: "Edge Simulator Fallback",
  });
}
