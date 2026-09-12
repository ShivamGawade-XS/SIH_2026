"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Sliders,
  FileCheck2,
  Atom,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface MultiSignalFusionCardProps {
  batchId: number;
  initialScore?: number;
  flowerSource?: string;
}

export default function MultiSignalFusionCard({
  batchId,
  initialScore = 94,
  flowerSource = "Muzaffarpur Litchi Blossom",
}: MultiSignalFusionCardProps) {
  const [activePreset, setActivePreset] = useState<"pure" | "rice_syrup" | "c4_sugar" | "inverted_cane">("pure");
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Dynamic signal parameters based on active preset
  const presets = {
    pure: {
      name: "Pure Raw Unadulterated Nectar",
      nmrMatch: 97.4,
      smrMarkerPpb: 0.0, // Specific Marker for Rice syrup (AFGP)
      tmrMarkerPpb: 0.0, // Trace Marker for Rice
      nirConcordance: 96.8,
      c4DeviationPct: 1.8, // EA-IRMS (<= 7% allowed)
      fructoseGlucoseRatio: 1.18, // FSSAI requirement: >= 0.95
      prolineMgKg: 340, // FSSAI requirement: >= 180 mg/kg
      verdict: "100% Authentic Floral Origin",
      compositeScore: 96,
      status: "PASS",
    },
    rice_syrup: {
      name: "C3 Rice Syrup Blend (SMR Positive)",
      nmrMatch: 64.2,
      smrMarkerPpb: 14.8, // Detected > 2.0 ppb limit!
      tmrMarkerPpb: 8.5,
      nirConcordance: 68.1,
      c4DeviationPct: 3.2, // Passes C4 EA-IRMS (deceptive!), but caught by SMR
      fructoseGlucoseRatio: 0.91,
      prolineMgKg: 135,
      verdict: "Adulteration Detected: C3 Rice/Beet Syrup (SMR/TMR LC-MS/MS positive)",
      compositeScore: 32,
      status: "FAIL",
    },
    c4_sugar: {
      name: "C4 Cane Sugar Adulteration (EA-IRMS Anomaly)",
      nmrMatch: 52.0,
      smrMarkerPpb: 0.0,
      tmrMarkerPpb: 0.0,
      nirConcordance: 59.4,
      c4DeviationPct: 12.6, // Fails C4 limit (> 7.0%)
      fructoseGlucoseRatio: 0.88,
      prolineMgKg: 110,
      verdict: "Adulteration Detected: High C4 Plant Carbon Isotope Deviation",
      compositeScore: 24,
      status: "FAIL",
    },
    inverted_cane: {
      name: "Acid-Hydrolyzed Invert Sugar Syrup",
      nmrMatch: 41.5,
      smrMarkerPpb: 0.0,
      tmrMarkerPpb: 0.0,
      nirConcordance: 48.0,
      c4DeviationPct: 8.9,
      fructoseGlucoseRatio: 0.82,
      prolineMgKg: 85,
      verdict: "Adulteration Detected: Exogenous Invert Sugar & HMF surge",
      compositeScore: 18,
      status: "FAIL",
    },
  };

  const current = presets[activePreset];

  return (
    <div className="border-2 border-charcoal/15 bg-white p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-charcoal/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Atom className="w-4 h-4 text-gold" />
            <span className="text-[10px] uppercase tracking-ultra text-warm-grey font-bold">
              FSSAI Gazette 2020 • Advanced Spectrometric Fingerprint
            </span>
          </div>
          <h3 className="text-2xl serif text-charcoal font-normal">
            Multi-Signal Authenticity Fusion Engine
          </h3>
          <p className="text-xs text-warm-grey mt-1">
            Synchronized 4-tier orthogonal cross-validation: NMR + SMR/TMR + NIR + C4 EA-IRMS
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className={`px-4 py-1.5 border text-xs font-mono font-bold flex items-center gap-2 ${
            current.status === "PASS"
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : "bg-red-50 border-red-300 text-red-800"
          }`}>
            {current.status === "PASS" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{current.status === "PASS" ? "AUTHENTIC PASS" : "ADULTERATED FAIL"}</span>
          </div>
          <div className="text-right">
            <span className="text-3xl font-serif font-bold text-charcoal">{current.compositeScore}</span>
            <span className="text-xs text-warm-grey font-mono">/100</span>
          </div>
        </div>
      </div>

      {/* Preset Simulator Switcher */}
      <div className="my-6 p-4 bg-cream/40 border border-charcoal/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase font-bold text-warm-grey font-mono tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-gold" />
            Interactive Adulterant Cross-Examination Simulator
          </span>
          <span className="text-[10px] text-warm-grey font-mono">Batch #{batchId}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(Object.keys(presets) as Array<keyof typeof presets>).map((key) => {
            const p = presets[key];
            const isSelected = activePreset === key;
            return (
              <button
                key={key}
                onClick={() => setActivePreset(key)}
                className={`p-3 text-left border transition-all ${
                  isSelected
                    ? "bg-charcoal text-alabaster border-charcoal shadow-sm scale-[1.01]"
                    : "bg-white text-charcoal border-charcoal/15 hover:border-gold hover:bg-alabaster/50"
                }`}
              >
                <p className={`text-[10px] font-mono uppercase tracking-wider font-bold mb-1 ${
                  isSelected ? "text-gold" : "text-warm-grey"
                }`}>
                  {key === "pure" ? "Control Sample" : "Adulterant Test"}
                </p>
                <p className="text-xs font-bold truncate">{p.name.split(" (")[0]}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Orthogonal Signal Diagnostic Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {/* Signal 1: 400MHz 1H-NMR */}
        <div className="p-4 bg-[#F9F8F6] border border-charcoal/10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-[10px] font-mono text-warm-grey uppercase font-bold mb-1">
              <span>¹H-NMR Profiling</span>
              <span>400 MHz</span>
            </div>
            <p className="text-lg font-serif font-bold text-charcoal">{current.nmrMatch}%</p>
            <p className="text-[10px] text-warm-grey mt-0.5">Botanical Metabolite Conformance</p>
          </div>
          <div className="w-full bg-charcoal/10 h-1.5 mt-3 overflow-hidden rounded-full">
            <div
              className={`h-full transition-all duration-500 ${current.nmrMatch > 80 ? "bg-emerald-600" : "bg-red-600"}`}
              style={{ width: `${current.nmrMatch}%` }}
            />
          </div>
        </div>

        {/* Signal 2: SMR / TMR LC-MS/MS */}
        <div className="p-4 bg-[#F9F8F6] border border-charcoal/10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-[10px] font-mono text-warm-grey uppercase font-bold mb-1">
              <span>SMR / TMR Rice Marker</span>
              <span>LC-MS/MS</span>
            </div>
            <p className={`text-lg font-serif font-bold ${current.smrMarkerPpb > 2.0 ? "text-red-600" : "text-emerald-700"}`}>
              {current.smrMarkerPpb.toFixed(1)} <span className="text-xs font-normal text-warm-grey">ppb</span>
            </p>
            <p className="text-[10px] text-warm-grey mt-0.5">
              {current.smrMarkerPpb > 2.0 ? "Threshold Exceeded (>2 ppb)" : "Zero Foreign Marker"}
            </p>
          </div>
          <div className="w-full bg-charcoal/10 h-1.5 mt-3 overflow-hidden rounded-full">
            <div
              className={`h-full transition-all duration-500 ${current.smrMarkerPpb > 2.0 ? "bg-red-600" : "bg-emerald-600"}`}
              style={{ width: `${Math.min(100, (current.smrMarkerPpb / 15) * 100 || 5)}%` }}
            />
          </div>
        </div>

        {/* Signal 3: NIR / FTIR Spectral */}
        <div className="p-4 bg-[#F9F8F6] border border-charcoal/10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-[10px] font-mono text-warm-grey uppercase font-bold mb-1">
              <span>NIR Chemometrics</span>
              <span>4000-10000 cm⁻¹</span>
            </div>
            <p className="text-lg font-serif font-bold text-charcoal">{current.nirConcordance}%</p>
            <p className="text-[10px] text-warm-grey mt-0.5">Carbohydrate Matrix Fit</p>
          </div>
          <div className="w-full bg-charcoal/10 h-1.5 mt-3 overflow-hidden rounded-full">
            <div
              className={`h-full transition-all duration-500 ${current.nirConcordance > 80 ? "bg-emerald-600" : "bg-red-600"}`}
              style={{ width: `${current.nirConcordance}%` }}
            />
          </div>
        </div>

        {/* Signal 4: C4 EA-IRMS Isotope */}
        <div className="p-4 bg-[#F9F8F6] border border-charcoal/10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-[10px] font-mono text-warm-grey uppercase font-bold mb-1">
              <span>C4 EA-IRMS δ¹³C</span>
              <span>AOAC 998.12</span>
            </div>
            <p className={`text-lg font-serif font-bold ${current.c4DeviationPct > 7.0 ? "text-red-600" : "text-emerald-700"}`}>
              {current.c4DeviationPct.toFixed(1)}%
            </p>
            <p className="text-[10px] text-warm-grey mt-0.5">Statutory Limit: ≤ 7.0%</p>
          </div>
          <div className="w-full bg-charcoal/10 h-1.5 mt-3 overflow-hidden rounded-full">
            <div
              className={`h-full transition-all duration-500 ${current.c4DeviationPct > 7.0 ? "bg-red-600" : "bg-emerald-600"}`}
              style={{ width: `${Math.min(100, (current.c4DeviationPct / 15) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Synthesis Verdict Banner */}
      <div className={`p-4 border flex items-center justify-between gap-4 ${
        current.status === "PASS"
          ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
          : "bg-red-50/70 border-red-300 text-red-950"
      }`}>
        <div className="flex items-center gap-3">
          <FileCheck2 className={`w-5 h-5 shrink-0 ${current.status === "PASS" ? "text-emerald-700" : "text-red-700"}`} />
          <div>
            <p className="text-xs font-bold">{current.verdict}</p>
            <p className="text-[11px] text-warm-grey font-mono mt-0.5">
              Source Terroir: {flowerSource} • F/G Ratio: {current.fructoseGlucoseRatio} • Proline: {current.prolineMgKg} mg/kg
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="text-[11px] font-mono font-bold flex items-center gap-1 hover:underline shrink-0"
        >
          <span>{showTechnicalDetails ? "Hide FSSAI Standards" : "View FSSAI Standards"}</span>
          {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded FSSAI Statutory Table */}
      {showTechnicalDetails && (
        <div className="mt-4 p-4 bg-[#FAF9F6] border border-charcoal/10 text-xs font-mono animate-in fade-in duration-200">
          <p className="font-bold uppercase tracking-wider text-charcoal text-[11px] mb-2">
            Government of India Statutory Benchmarks (FSSAI Gazette Notification 2020)
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-charcoal/20 text-warm-grey">
                  <th className="py-2 pr-4 font-bold">Parameter</th>
                  <th className="py-2 pr-4 font-bold">Statutory Threshold</th>
                  <th className="py-2 pr-4 font-bold">Current Sample</th>
                  <th className="py-2 font-bold">Analytical Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                <tr>
                  <td className="py-2 pr-4 font-bold">SMR (Specific Marker for Rice)</td>
                  <td className="py-2 pr-4">Negative (&lt; 2 ppb)</td>
                  <td className={`py-2 pr-4 font-bold ${current.smrMarkerPpb > 2 ? "text-red-600" : "text-emerald-700"}`}>
                    {current.smrMarkerPpb > 2 ? "Positive (Adulterated)" : "Negative (Pure)"}
                  </td>
                  <td className="py-2 text-warm-grey">LC-MS/MS</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-bold">C4 Sugars (EA-IRMS)</td>
                  <td className="py-2 pr-4">&le; 7.0%</td>
                  <td className={`py-2 pr-4 font-bold ${current.c4DeviationPct > 7 ? "text-red-600" : "text-emerald-700"}`}>
                    {current.c4DeviationPct.toFixed(1)}%
                  </td>
                  <td className="py-2 text-warm-grey">AOAC 998.12</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-bold">Fructose / Glucose Ratio</td>
                  <td className="py-2 pr-4">&ge; 0.95</td>
                  <td className={`py-2 pr-4 font-bold ${current.fructoseGlucoseRatio < 0.95 ? "text-red-600" : "text-emerald-700"}`}>
                    {current.fructoseGlucoseRatio}
                  </td>
                  <td className="py-2 text-warm-grey">HPLC-RI</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-bold">Proline (Natural Amino Acid)</td>
                  <td className="py-2 pr-4">&ge; 180 mg/kg</td>
                  <td className={`py-2 pr-4 font-bold ${current.prolineMgKg < 180 ? "text-red-600" : "text-emerald-700"}`}>
                    {current.prolineMgKg} mg/kg
                  </td>
                  <td className="py-2 text-warm-grey">Spectrophotometric</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
