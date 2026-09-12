import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get("batchId") || "1";

  // Consignment ID format: APEDA/IND/HONEY/<batchId>/2026
  const consignmentId = `APEDA/IND/HONEY/${String(batchId).padStart(5, "0")}/2026`;
  
  // Standard batch evaluation parameters
  const batchData = {
    consignmentId,
    batchId: Number(batchId),
    issuingAuthority: "Agricultural & Processed Food Products Export Development Authority (APEDA)",
    nodalMinistry: "Ministry of Commerce & Industry, Government of India",
    cooperative: "Sundarbans Forest Beekeepers Multipurpose Cooperative Ltd.",
    apicultureCluster: "Canning Apiary Hub, Sundarbans Biosphere Reserve, West Bengal",
    hivesCovered: ["HIVE-WB-0391", "HIVE-WB-0392", "HIVE-WB-0395"],
    botanicalOrigin: "Mangrove Blossom (Aegiceras corniculatum & Ceriops decandra)",
    harvestDate: "2026-05-14",
    exportStandard: "EU Directive 2001/110/EC & USFDA 21 CFR 168.130 Compliant",
    fssaiLicense: "10020031002984",
    agmarkGrading: "Agmark Special Grade (Certified Export)",
    physicochemicalParameters: {
      moisturePercent: 18.2,
      fssaiMoistureLimit: "<= 20.0%",
      hmfMgPerKg: 14.5,
      fssaiHmfLimit: "<= 40.0 mg/kg",
      reducingSugarsPercent: 71.4,
      fssaiSugarsLimit: ">= 65.0%",
      fructoseGlucoseRatio: 1.14,
      sucrosePercent: 1.8,
      diastaseNumber: 14.2,
      c4PlantSugarsIrmsPercent: 0.8,
      c4Limit: "<= 7.0% (Passed EA-IRMS)",
      nmrForeignOligosaccharides: "Undetected (< 0.2%)",
      antibioticsResidues: "ND (Not Detected - Zero MRL)",
    },
    blockchainVerification: {
      network: "Polygon PoS (Amoy Testnet)",
      smartContract: "0x8E2a6288b8Cee3e390C55F266F53d68102A1a82E",
      batchProvenanceHash: "0x4b7f9a1c2d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
      timestamp: "2026-05-16T10:44:21.000Z",
    },
    exportStatus: "APPROVED_FOR_EXPORT",
    eligibleMarkets: ["European Union (EU)", "United States (USFDA)", "United Arab Emirates (ESMA)", "Japan (MHLW)"],
  };

  // Generate SHA-256 seal for the certificate
  const certificateHash = "0x" + crypto
    .createHash("sha256")
    .update(JSON.stringify(batchData))
    .digest("hex");

  return NextResponse.json({
    status: "success",
    certificateSeal: certificateHash,
    data: batchData,
    verificationUrl: `https://honeychain-truetag.vercel.app/verify/${batchId}?export=apeda`,
  });
}
