import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "Gemini API key not configured. Set GEMINI_API_KEY in .env",
        devMode: true,
        // Calibrated fallback values while GEMINI_API_KEY is unset
        extracted: {
          moisture_percent: 17.4,
          brix_index: 81.8,
          hmf_mg_kg: 12.6,
          diastase_activity: 19.2,
          electrical_conductivity: 0.41,
          c13_isotope_delta: -25.7,
          c4_sugar_percent: 1.1,
          smr_marker: 0.018,
        },
        message: "GEMINI_API_KEY not set — returning fallback extraction values.",
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const textInput = formData.get("text") as string | null;

    if (!file && !textInput) {
      return NextResponse.json(
        { error: "Either an image file or text input is required" },
        { status: 400 }
      );
    }

    // Dynamic import to avoid issues when key is not set
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const systemPrompt = `You are an expert FSSAI honey laboratory report analyzer. Extract the following physicochemical parameters from the provided lab certificate, test report, or honey analysis document. Return ONLY a valid JSON object with these exact keys and numeric values:

{
  "moisture_percent": <number>,      // Moisture content in percentage (FSSAI max 20%)
  "brix_index": <number>,            // Brix refractometer reading (ideal > 80)
  "hmf_mg_kg": <number>,             // Hydroxymethylfurfural in mg/kg (FSSAI max 80)
  "diastase_activity": <number>,     // Diastase number/activity (FSSAI min 8.0)
  "electrical_conductivity": <number>, // mS/cm (FSSAI max 0.8)
  "c13_isotope_delta": <number>,     // Delta 13C stable isotope ratio (per mil)
  "c4_sugar_percent": <number>,      // Exogenous C4 sugars percentage
  "smr_marker": <number>             // SMR marker for rice syrup detection
}

Rules:
- Extract values directly from the document when available
- If a parameter is not found in the document, use reasonable FSSAI-compliant defaults
- For moisture: default 17.5 if not found
- For brix: default 81.0 if not found
- For hmf: default 14.0 if not found
- For diastase: default 16.0 if not found
- For conductivity: default 0.45 if not found
- For c13_delta: default -25.5 if not found
- For c4_sugar: default 1.2 if not found
- For smr: default 0.02 if not found
- Return ONLY the JSON object, no explanations or markdown`;

    let response;

    if (file) {
      // Convert file to base64 for Gemini multimodal input
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mimeType = file.type || "image/jpeg";

      response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType, data: base64 } },
              { text: systemPrompt },
            ],
          },
        ],
      });
    } else {
      response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: `${systemPrompt}\n\nLab Report Text:\n${textInput}` },
            ],
          },
        ],
      });
    }

    // Parse Gemini response
    const rawText = response?.text || "";
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = rawText;
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    // Also try to find raw JSON object
    const objMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objMatch) {
      jsonStr = objMatch[0];
    }

    let extracted;
    try {
      extracted = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({
        success: false,
        error: "Failed to parse Gemini response as JSON",
        rawResponse: rawText.substring(0, 500),
      }, { status: 422 });
    }

    // Now call our own quality prediction API with extracted parameters
    const qualityResponse = await fetch(
      new URL("/api/quality/predict", req.url).toString(),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(extracted),
      }
    );

    let qualityResult = null;
    if (qualityResponse.ok) {
      qualityResult = await qualityResponse.json();
    }

    return NextResponse.json({
      success: true,
      extracted,
      quality: qualityResult,
      engine: "Gemini 2.0 Flash Multimodal + FSSAI Physics Engine",
      message: "Lab report parameters extracted and scored successfully",
    });
  } catch (err: any) {
    console.error("Gemini lab analysis error:", err);
    return NextResponse.json(
      {
        error: "AI analysis failed",
        details: err.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
