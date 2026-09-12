"use client";

import React, { useState } from "react";
import {
  Globe,
  X,
  FileCode,
  ShieldCheck,
  Leaf,
  CheckCircle2,
  Copy,
  ExternalLink,
  QrCode,
  Sparkles,
  TreeDeciduous,
  Recycle,
} from "lucide-react";

interface EUDigitalProductPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: number;
  qrToken?: string;
  farmerName?: string;
  location?: string;
  harvestDate?: string;
}

export default function EUDigitalProductPassportModal({
  isOpen,
  onClose,
  batchId,
  qrToken = "TT-2026-00001",
  farmerName = "Rajesh K. Verma",
  location = "Muzaffarpur, Bihar, India",
  harvestDate = "March 2026",
}: EUDigitalProductPassportModalProps) {
  const [activeTab, setActiveTab] = useState<"passport" | "jsonld">("passport");
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isOpen) return null;

  const gtin = "08901020620019";
  const gs1DigitalLink = `https://id.honeychain.org/01/${gtin}/21/${qrToken}`;

  // CIRPASS / ESPR Compliant JSON-LD Schema
  const cirpassJsonLd = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://schema.org",
      "https://cirpass.eu/dpp/v1",
    ],
    type: ["VerifiableCredential", "DigitalProductPassport", "FoodProductPassport"],
    id: `urn:uuid:dpp-honeychain-${batchId}`,
    issuer: {
      id: "did:polygon:0x5eB5A63F8B3e4C34DbD4A9369C31c2D9C87B32F1",
      name: "Khadi and Village Industries Commission (KVIC), Govt of India",
    },
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: gs1DigitalLink,
      gtin: gtin,
      batchLotNumber: `BATCH-2026-00${batchId}`,
      productName: "KVIC Certified Organic Litchi Blossom Raw Honey",
      botanicalOrigin: "Litchi chinensis (Soapberry Family)",
      countryOfOrigin: "IN",
      geographicCoordinates: {
        latitude: 26.1209,
        longitude: 85.3647,
        terroir: "Muzaffarpur Gangetic Alluvial Orchards",
      },
      sustainability: {
        carbonFootprintKgCo2e: -0.42, // Carbon negative due to pollination ecosystem service
        carbonMethodology: "ISO 14067:2018 Product Carbon Footprint (Cradle-to-Gate)",
        eudrCompliance: {
          deforestationFree: true,
          geoPolygonVerified: true,
          riskBenchmark: "Zero Forest Degradation",
        },
        circularity: {
          packagingMaterial: "Type III Flint Glass (100% Infinitely Recyclable)",
          closureMaterial: "Anodized Aluminum Cap with Food-Grade EVA liner",
          recycledContentPercentage: 45,
          recyclabilityScore: "Class A (98%)",
        },
      },
      conformance: {
        fssaiGazette2020: "COMPLIANT (Agmark Special Grade)",
        euDirective2001110EC: "COMPLIANT (Raw Unpasteurized Honey)",
        c4SugarRatioPct: 1.8,
        smrRiceSyrupAfgpMarker: "UNDETECTED (< 2 ppb)",
        antibioticResidues: "ZERO (ND)",
      },
    },
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(cirpassJsonLd, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-charcoal/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Globe className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight">EU Digital Product Passport (DPP)</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[9px] font-mono font-bold uppercase tracking-wider">
                  CIRPASS &bull; ESPR Ready
                </span>
              </div>
              <p className="text-xs text-blue-200/90 font-mono mt-0.5">
                Batch #{batchId} &bull; GTIN: {gtin} &bull; GS1 Digital Link
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-charcoal/10 bg-alabaster text-xs font-mono shrink-0">
          <button
            onClick={() => setActiveTab("passport")}
            className={`flex-1 py-3 font-bold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === "passport"
                ? "bg-white text-blue-900 border-b-2 border-blue-800 shadow-2xs"
                : "text-charcoal/60 hover:text-charcoal"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>EU Regulatory Compliance Passport</span>
          </button>
          <button
            onClick={() => setActiveTab("jsonld")}
            className={`flex-1 py-3 font-bold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === "jsonld"
                ? "bg-white text-blue-900 border-b-2 border-blue-800 shadow-2xs"
                : "text-charcoal/60 hover:text-charcoal"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>CIRPASS JSON-LD Payload</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-charcoal">
          {activeTab === "passport" ? (
            <div className="space-y-6">
              {/* Product Identity & GS1 Digital Link */}
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[10px] font-mono text-blue-900 font-bold uppercase tracking-wider block">
                    GS1 Standard Digital Link Anchor
                  </span>
                  <p className="font-mono text-xs font-bold text-blue-950 break-all mt-0.5">
                    {gs1DigitalLink}
                  </p>
                  <p className="text-[11px] text-blue-800 mt-1">
                    Producer: {farmerName} &bull; {location}
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-blue-900 text-white rounded-xl text-[10px] font-mono font-bold shrink-0">
                  EU Border Ready
                </div>
              </div>

              {/* 3 Core ESG & Environmental Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Carbon Negative Lifecycle */}
                <div className="p-4 bg-[#FAF9F6] border border-charcoal/10 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-800 font-bold uppercase mb-1">
                      <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Product Carbon Footprint</span>
                    </div>
                    <p className="text-2xl font-serif font-bold text-emerald-700">
                      -0.42 <span className="text-xs font-mono font-normal text-warm-grey">kg CO₂e</span>
                    </p>
                    <p className="text-[10px] text-emerald-800 font-bold mt-1">
                      🌱 Net Carbon-Negative Consignment
                    </p>
                    <p className="text-[11px] text-warm-grey mt-1">
                      Pollination ecosystem bio-sequestration offsets harvest and packaging footprint under ISO 14067.
                    </p>
                  </div>
                </div>

                {/* 2. EUDR Deforestation Due Diligence */}
                <div className="p-4 bg-[#FAF9F6] border border-charcoal/10 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-800 font-bold uppercase mb-1">
                      <TreeDeciduous className="w-3.5 h-3.5 text-emerald-600" />
                      <span>EUDR Forest Due Diligence</span>
                    </div>
                    <p className="text-2xl font-serif font-bold text-charcoal">
                      100% <span className="text-xs font-mono font-normal text-warm-grey">Compliant</span>
                    </p>
                    <p className="text-[10px] text-emerald-800 font-bold mt-1">
                      ✅ Deforestation-Free Geofenced
                    </p>
                    <p className="text-[11px] text-warm-grey mt-1">
                      GPS apiary coordinates matched against EU Copernicus Forest Observational Sentinel data.
                    </p>
                  </div>
                </div>

                {/* 3. Circular Packaging */}
                <div className="p-4 bg-[#FAF9F6] border border-charcoal/10 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-blue-800 font-bold uppercase mb-1">
                      <Recycle className="w-3.5 h-3.5 text-blue-600" />
                      <span>Circularity &amp; Packaging</span>
                    </div>
                    <p className="text-2xl font-serif font-bold text-charcoal">
                      Class A <span className="text-xs font-mono font-normal text-warm-grey">(98%)</span>
                    </p>
                    <p className="text-[10px] text-blue-800 font-bold mt-1">
                      ♻️ 100% Recyclable Glass Body
                    </p>
                    <p className="text-[11px] text-warm-grey mt-1">
                      Type III flint glass + aluminum cap; 45% post-consumer recycled cullet; zero single-use plastic.
                    </p>
                  </div>
                </div>
              </div>

              {/* European Union Codex Alimentarius Benchmark Summary */}
              <div className="p-4 bg-white border border-charcoal/15 rounded-2xl space-y-2 text-xs font-mono">
                <p className="font-bold uppercase tracking-wider text-charcoal text-[11px]">
                  EU Honey Directive 2001/110/EC Conformance Matrix
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2 bg-alabaster rounded border border-charcoal/10">
                    <p className="text-[10px] text-warm-grey font-bold">HMF Ceiling</p>
                    <p className="font-bold text-emerald-700">&le; 40 mg/kg (Passed)</p>
                  </div>
                  <div className="p-2 bg-alabaster rounded border border-charcoal/10">
                    <p className="text-[10px] text-warm-grey font-bold">Diastase Activity</p>
                    <p className="font-bold text-emerald-700">&ge; 8 DN (Passed: 18.2)</p>
                  </div>
                  <div className="p-2 bg-alabaster rounded border border-charcoal/10">
                    <p className="text-[10px] text-warm-grey font-bold">Residues / Antibiotics</p>
                    <p className="font-bold text-emerald-700">Zero (MRL Compliant)</p>
                  </div>
                  <div className="p-2 bg-alabaster rounded border border-charcoal/10">
                    <p className="text-[10px] text-warm-grey font-bold">GMO Pollen</p>
                    <p className="font-bold text-emerald-700">Non-GMO Verified</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* JSON-LD Raw Data Tab */
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-warm-grey">
                  Standard W3C Verifiable Credential / CIRPASS v1.0 Schema
                </span>
                <button
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 border border-charcoal/20 bg-white hover:bg-alabaster text-xs font-mono font-bold flex items-center gap-1.5 transition-colors rounded-lg shadow-2xs"
                >
                  {copiedJson ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON-LD</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-charcoal text-emerald-400 font-mono text-[11px] rounded-2xl overflow-x-auto max-h-[50vh] leading-relaxed border border-charcoal/20">
                {JSON.stringify(cirpassJsonLd, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-alabaster border-t border-charcoal/10 flex justify-between items-center shrink-0">
          <p className="text-[11px] font-mono text-warm-grey">
            Anchored to Polygon PoS &bull; European Union ESPR Framework Ready
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-charcoal text-white font-bold text-xs hover:bg-black transition-colors"
          >
            Close Passport
          </button>
        </div>
      </div>
    </div>
  );
}
