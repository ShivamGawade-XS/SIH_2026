import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ||
  process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
  "https://honeychain-ai-service.onrender.com";

// In-memory telemetry cache for real-time edge devices (survives hot reloads)
interface HiveTelemetryRecord {
  hive_id: string;
  weight_kg: number;
  internal_temp_c: number;
  humidity_percent: number;
  acoustic_frequency_hz: number;
  battery_voltage?: number;
  device_firmware?: string;
  status: "Normal" | "Warning" | "Critical";
  anomalies: string[];
  acoustic_classification: string;
  receipt_hash: string;
  received_at: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __hiveTelemetryStore: Map<string, HiveTelemetryRecord> | undefined;
}

const telemetryStore: Map<string, HiveTelemetryRecord> =
  global.__hiveTelemetryStore ||
  (global.__hiveTelemetryStore = new Map<string, HiveTelemetryRecord>([
    [
      "HIVE-WB-0391",
      {
        hive_id: "HIVE-WB-0391",
        weight_kg: 45.2,
        internal_temp_c: 34.6,
        humidity_percent: 62.0,
        acoustic_frequency_hz: 235.0,
        battery_voltage: 3.95,
        device_firmware: "TrueTag-ESP32-v2.6",
        status: "Normal",
        anomalies: [],
        acoustic_classification: "Normal Colony Fanning (Healthy Brood)",
        receipt_hash: "0x7a8f9c1b2e3d4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
        received_at: new Date().toISOString(),
      },
    ],
    [
      "HIVE-RJ-101",
      {
        hive_id: "HIVE-RJ-101",
        weight_kg: 46.8,
        internal_temp_c: 35.1,
        humidity_percent: 54.0,
        acoustic_frequency_hz: 240.0,
        battery_voltage: 4.1,
        device_firmware: "TrueTag-ESP32-v2.6",
        status: "Normal",
        anomalies: [],
        acoustic_classification: "Normal Foraging Activity",
        receipt_hash: "0x3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
        received_at: new Date().toISOString(),
      },
    ],
    [
      "HIVE-JK-303",
      {
        hive_id: "HIVE-JK-303",
        weight_kg: 52.1,
        internal_temp_c: 33.8,
        humidity_percent: 66.0,
        acoustic_frequency_hz: 228.0,
        battery_voltage: 3.88,
        device_firmware: "TrueTag-ESP32-v2.6",
        status: "Normal",
        anomalies: [],
        acoustic_classification: "Optimal High-Altitude Brood Maintenance",
        receipt_hash: "0x1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e",
        received_at: new Date().toISOString(),
      },
    ],
  ]));

function classifyAcousticFrequency(freq: number): string {
  if (freq >= 140 && freq <= 260) {
    return "Normal Colony Fanning (Healthy Brood)";
  } else if (freq > 260 && freq <= 320) {
    return "Elevated Foraging & Comb Construction";
  } else if (freq > 320 && freq <= 450) {
    return "Queen Piping / Virgin Queen Emergence Activity";
  } else if (freq > 450 && freq <= 650) {
    return "Pre-Swarm Buzzing: High Kinetic Energy (Swarm Risk)";
  } else if (freq > 650) {
    return "Pest Invasion / Hornet Disturbance Alert";
  }
  return "Abnormal Low Frequency (Colony Depletion)";
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const hiveId = String(body.hive_id || "HIVE-WB-0391").trim();
  const weightKg = Number(body.weight_kg ?? 45.0);
  const internalTempC = Number(body.internal_temp_c ?? 34.5);
  const humidityPercent = Number(body.humidity_percent ?? 60.0);
  const acousticHz = Number(body.acoustic_frequency_hz ?? 235.0);
  const batteryVoltage = body.battery_voltage ? Number(body.battery_voltage) : undefined;
  const firmware = String(body.device_firmware || "ESP32-Standard");

  // Anomaly evaluation according to agronomic honeybee thresholds
  const anomalies: string[] = [];
  if (internalTempC > 36.5) anomalies.push(`High Temperature Alert: ${internalTempC.toFixed(1)}°C (Thermal Stress)`);
  if (internalTempC < 31.5) anomalies.push(`Low Temperature Alert: ${internalTempC.toFixed(1)}°C (Brood Chilling)`);
  if (humidityPercent > 78.0) anomalies.push(`High Humidity: ${humidityPercent.toFixed(1)}% (Chalkbrood/Mold Risk)`);
  if (humidityPercent < 40.0) anomalies.push(`Low Humidity: ${humidityPercent.toFixed(1)}% (Larval Dehydration)`);
  if (acousticHz > 450.0) anomalies.push(`Swarming Acoustic Signature: ${acousticHz.toFixed(1)} Hz detected`);

  const prev = telemetryStore.get(hiveId);
  if (prev && prev.weight_kg - weightKg > 1.2) {
    anomalies.push(`Sudden Weight Drop: -${(prev.weight_kg - weightKg).toFixed(2)} kg (Swarm Departure / Robbing)`);
  }

  const status: "Normal" | "Warning" | "Critical" =
    anomalies.some((a) => a.includes("Swarming") || a.includes("Sudden Weight Drop"))
      ? "Critical"
      : anomalies.length > 0
      ? "Warning"
      : "Normal";

  const acousticClassification = classifyAcousticFrequency(acousticHz);

  // Cryptographic receipt of edge ingestion
  const payloadString = `${hiveId}:${weightKg}:${internalTempC}:${humidityPercent}:${acousticHz}:${Date.now()}`;
  const receiptHash = "0x" + crypto.createHash("sha256").update(payloadString).digest("hex");

  const record: HiveTelemetryRecord = {
    hive_id: hiveId,
    weight_kg: weightKg,
    internal_temp_c: internalTempC,
    humidity_percent: humidityPercent,
    acoustic_frequency_hz: acousticHz,
    battery_voltage: batteryVoltage,
    device_firmware: firmware,
    status,
    anomalies,
    acoustic_classification: acousticClassification,
    receipt_hash: receiptHash,
    received_at: new Date().toISOString(),
  };

  telemetryStore.set(hiveId, record);

  // Asynchronously notify AI microservice if running
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    fetch(`${AI_SERVICE_URL}/api/iot/push-telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hive_id: hiveId,
        weight_kg: weightKg,
        internal_temp_c: internalTempC,
        humidity_percent: humidityPercent,
        acoustic_frequency_hz: acousticHz,
      }),
      signal: controller.signal,
    })
      .catch(() => {})
      .finally(() => clearTimeout(timeout));
  } catch {
    // Non-blocking
  }

  return NextResponse.json({
    success: true,
    message: `Telemetry recorded for hive ${hiveId}`,
    data: record,
    blockchain_hash: receiptHash,
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hiveId = searchParams.get("hive_id");

  if (hiveId) {
    const item = telemetryStore.get(hiveId);
    if (!item) {
      return NextResponse.json({ error: `Hive ${hiveId} not found` }, { status: 404 });
    }
    return NextResponse.json({ hive: item });
  }

  const allHives = Array.from(telemetryStore.values());
  return NextResponse.json({
    count: allHives.length,
    hives: allHives,
    gateway_status: "Active",
    last_sync: new Date().toISOString(),
  });
}
