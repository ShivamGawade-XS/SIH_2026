import { NextRequest, NextResponse } from "next/server";

// Meta WhatsApp Cloud API verification token
const WHATSAPP_VERIFY_TOKEN =
  process.env.WHATSAPP_VERIFY_TOKEN || "HONEYCHAIN_SIH_2026_SECURE_TOKEN";

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
  let language = body.lang || "en";

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

  // Multi-lingual response handler
  if (query.startsWith("VERIFY") || query.includes("TT-") || query.includes("BATCH")) {
    const isBatch2 = query.includes("2") || query.includes("SUNDARBAN");
    if (language === "hi") {
      if (isBatch2) {
        replyText =
          `🍯 *KVIC हनीचेन सत्यापन: बैच #002*\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `✅ *स्थिति:* 100% शुद्ध प्राकृतिक शहद\n` +
          `🌿 *स्रोत:* सुंदरबन वाइल्ड मैंग्रोव\n` +
          `👨‍🌾 *मधुमक्खी पालक:* लक्ष्मी देवी (सुंदरबन)\n` +
          `📍 *जीआई टैग:* सुंदरबन बायोस्फीयर, प. बंगाल\n` +
          `✨ *शुद्धता स्कोर:* 91.0/100 (FSSAI उत्तीर्ण)\n` +
          `⛓️ *ब्लॉकचेन हैश:* 0x4b7f...9f0a\n` +
          `🔗 https://honeychain-truetag.vercel.app/verify/2`;
      } else {
        replyText =
          `🍯 *KVIC हनीचेन सत्यापन: बैच #001*\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `✅ *स्थिति:* 100% शुद्ध प्राकृतिक शहद\n` +
          `🌸 *स्रोत:* मुजफ्फरपुर शाही लीची\n` +
          `👨‍🌾 *मधुमक्खी पालक:* राजेश कुमार वर्मा (बिहार)\n` +
          `📍 *जीआई टैग:* मुजफ्फरपुर, बिहार (संरक्षित)\n` +
          `✨ *शुद्धता स्कोर:* 94.0/100 (ग्रेड A+)\n` +
          `🔬 *FSSAI मानक:* नमी 17.8%, HMF 12.4 mg/kg\n` +
          `⛓️ *ब्लॉकचेन हैश:* 0x98f4...e2d1\n` +
          `🔗 https://honeychain-truetag.vercel.app/verify/1`;
      }
    } else if (language === "bn") {
      if (isBatch2) {
        replyText =
          `🍯 *KVIC হানিচেইন যাচাইকরণ: ব্যাচ #002*\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `✅ *অবস্থা:* ১০০% খাঁটি বুনো মধু\n` +
          `🌿 *উৎস:* সুন্দরবন ম্যানগ্রোভ বন\n` +
          `👨‍🌾 *মৌচাষী:* লক্ষ্মী দেবী (সুন্দরবন কো-অপ)\n` +
          `📍 *জিআই উৎস:* সুন্দরবন, পশ্চিমবঙ্গ\n` +
          `✨ *বিশুদ্ধতা:* 91.0/100 (FSSAI অনুমোদিত)\n` +
          `⛓️ *পলিগন হ্যাশ:* 0x4b7f...9f0a\n` +
          `🔗 https://honeychain-truetag.vercel.app/verify/2`;
      } else {
        replyText =
          `🍯 *KVIC হানিচেইন যাচাইকরণ: ব্যাচ #001*\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `✅ *অবস্থা:* ১০০% খাঁটি লিচু মধু\n` +
          `🌸 *উৎস:* মুজাফফরপুর শাহী লিচু\n` +
          `👨‍🌾 *মৌচাষী:* রাজেশ কুমার বর্মা\n` +
          `📍 *জিআই উৎস:* মুজাফফরপুর, বিহার\n` +
          `✨ *বিশুদ্ধতা:* 94.0/100 (গ্রেড A+)\n` +
          `⛓️ *পলিগন হ্যাশ:* 0x98f4...e2d1\n` +
          `🔗 https://honeychain-truetag.vercel.app/verify/1`;
      }
    } else {
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
  } else if (query.includes("DBT") || query.includes("SUBSIDY") || query.includes("KISAN")) {
    replyText =
      `🏛️ *KVIC HONEY MISSION DBT ESCROW STATUS*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `👨‍🌾 *Beneficiary:* Rajesh Kumar Verma (ID: #1)\n` +
      `📦 *Sanctioned Hives:* 10 Langstroth Wooden Supers\n` +
      `💰 *Total DBT Sanction:* ₹25,000 (80% MSME Subsidy)\n` +
      `✅ *Disbursed (Milestone 1 & 2):* ₹15,000 via PFMS/UPI\n` +
      `⏳ *Escrow Milestone 3:* ₹10,000 (Awaiting Lab Report QA)\n` +
      `⛓️ *Smart Contract Escrow:* 0x8E2a6288b8Cee3e390C55F266F53d68102A1a82E\n` +
      `🔗 https://honeychain-truetag.vercel.app/dashboard`;
  } else {
    replyText =
      `🍯 *Welcome to KVIC HoneyChain HelpDesk*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `Reply with:\n` +
      `• *VERIFY TT-2026-00001* — Verify honey jar provenance\n` +
      `• *HIVE* — Check live IoT hive box telemetry\n` +
      `• *DBT* — Check KVIC Beekeeper Subsidy Escrow\n` +
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
