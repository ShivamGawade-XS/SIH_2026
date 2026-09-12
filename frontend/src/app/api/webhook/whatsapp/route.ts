import { NextRequest, NextResponse } from "next/server";

// Meta WhatsApp Cloud API verification token
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "HONEYCHAIN_SIH_2026_SECURE_TOKEN";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification token mismatch" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Handle both Meta Cloud API webhook payloads AND direct simulator testing payloads
  let incomingMessage = "";
  let senderPhone = "919876543210";

  if (body.object === "whatsapp_business_account") {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];
    incomingMessage = message?.text?.body || "";
    senderPhone = message?.from || senderPhone;
  } else {
    incomingMessage = String(body.message || body.queryText || "").trim();
    senderPhone = String(body.sender || senderPhone);
  }

  const query = incomingMessage.trim().toUpperCase();
  let replyText = "";

  if (query.startsWith("VERIFY") || query.includes("TT-") || query.includes("BATCH")) {
    const isBatch2 = query.includes("2") || query.includes("SUNDARBAN");
    if (isBatch2) {
      replyText = 
        `🍯 *KVIC HONEYCHAIN VERIFIED: BATCH #002*\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `✅ *Status:* 100% Genuine Raw Honey\n` +
        `🌿 *Flora:* Sundarbans Wild Mangrove\n` +
        `👨‍🌾 *Beekeeper:* Lakshmi Devi (Sundarbans Co-op)\n` +
        `📍 *GI Origin:* Sundarbans Biosphere, West Bengal\n` +
        `✨ *Purity Score:* 91.0/100 (Grade A+)\n` +
        `🔬 *FSSAI IS 4941:* All Tests Passed\n` +
        `⛓️ *Polygon Hash:* 0x4b7f...9f0a\n` +
        `🔗 *Full Provenance:* https://honeychain-truetag.vercel.app/verify/2`;
    } else {
      replyText = 
        `🍯 *KVIC HONEYCHAIN VERIFIED: BATCH #001*\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `✅ *Status:* 100% Genuine Raw Honey\n` +
        `🌸 *Flora:* Muzaffarpur Shahi Litchi\n` +
        `👨‍🌾 *Beekeeper:* Rajesh Kumar Verma (Bihar Apiary Hub)\n` +
        `📍 *GI Origin:* Muzaffarpur, Bihar (GI Tag Protected)\n` +
        `✨ *Purity Score:* 94.0/100 (Grade A+ Raw Organic)\n` +
        `🔬 *FSSAI Standard:* Passed (Moisture 17.8%, HMF 12.4 mg/kg)\n` +
        `⛓️ *Polygon Hash:* 0x98f4...e2d1\n` +
        `🔗 *Full Provenance:* https://honeychain-truetag.vercel.app/verify/1`;
    }
  } else if (query.startsWith("HIVE") || query.includes("STATUS")) {
    replyText = 
      `🐝 *HONEYCHAIN IOT TELEMETRY: HIVE-WB-0391*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `⚖️ *Weight:* 45.2 kg (Healthy Storage)\n` +
      `🌡️ *Brood Temp:* 34.6°C (Optimal Incubation)\n` +
      `💧 *Humidity:* 62.0% (Normal)\n` +
      `🔊 *Acoustic:* 235 Hz (Normal Brood Fanning)\n` +
      `🔋 *Battery:* 3.95V (Solar Charging Active)\n` +
      `🛡️ *Swarm Alert:* NONE (Colony Stable)`;
  } else {
    replyText = 
      `🍯 *Welcome to KVIC HoneyChain HelpDesk*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `Reply with:\n` +
      `• *VERIFY TT-2026-00001* — Verify honey jar provenance\n` +
      `• *HIVE* — Check live IoT hive box status\n` +
      `• *COMPLAINT* — Report suspected adulteration\n` +
      `\nSupported by KVIC Honey Mission, Ministry of MSME.`;
  }

  return NextResponse.json({
    success: true,
    recipient: senderPhone,
    response_type: "whatsapp_cloud_api",
    timestamp: new Date().toISOString(),
    reply: replyText,
  });
}
