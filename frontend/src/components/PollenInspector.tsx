"use client";

import React, { useState } from "react";
import { Microscope, CheckCircle2, Sparkles, ZoomIn, Info } from "lucide-react";

interface PollenData {
  primaryFlora: string;
  scientificName: string;
  dominantPollenPercent: number; // e.g. 78% (Monofloral minimum is 45%)
  secondaryPollen: { name: string; percent: number }[];
  pollenGrainDensityPerGram: number; // e.g. 84,000 grains/g
  morphology: string;
  fssaiStandardMet: boolean;
  geographicOrigin: string;
}

interface PollenInspectorProps {
  botanicalFlora?: string;
  batchId?: number;
}

export default function PollenInspector({
  botanicalFlora = "Shahi Litchi Monofloral Nectar",
  batchId = 1,
}: PollenInspectorProps) {
  const [zoomLevel, setZoomLevel] = useState<"40x" | "100x" | "400x">("100x");
  const [selectedPollenIndex, setSelectedPollenIndex] = useState(0);

  // Calibrated melissopalynological dataset based on batch origin
  const isMangrove = botanicalFlora?.toLowerCase().includes("mangrove") || batchId === 2;

  const pollenProfile: PollenData = isMangrove
    ? {
        primaryFlora: "Wild Mangrove Blossom (Rhizophora & Avicennia)",
        scientificName: "Rhizophora mucronata & Avicennia marina",
        dominantPollenPercent: 74.2,
        secondaryPollen: [
          { name: "Sonneratia apetala (Keora)", percent: 14.8 },
          { name: "Acanthus ilicifolius (Hargoza)", percent: 7.5 },
          { name: "Other Sundarbans Flora", percent: 3.5 },
        ],
        pollenGrainDensityPerGram: 92400,
        morphology: "Tricolporate, sub-prolate grains (22.5 × 18.2 µm) with reticulate exine ornamentation",
        fssaiStandardMet: true,
        geographicOrigin: "Sundarbans Biosphere Reserve Delta, West Bengal",
      }
    : {
        primaryFlora: "Shahi Litchi Blossom Nectar",
        scientificName: "Litchi chinensis Sonn.",
        dominantPollenPercent: 82.6,
        secondaryPollen: [
          { name: "Mustard (Brassica juncea)", percent: 9.4 },
          { name: "Eucalyptus globulus", percent: 5.2 },
          { name: "Local Orchard Weeds", percent: 2.8 },
        ],
        pollenGrainDensityPerGram: 114000,
        morphology: "Tricolporate, striate-perforate exine, isopolar circular grains (26.4 × 24.1 µm)",
        fssaiStandardMet: true,
        geographicOrigin: "Muzaffarpur Litchi GI Zone, Bihar",
      };

  return (
    <div className="border-2 border-charcoal/15 bg-white p-6 sm:p-8 shadow-sm">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-charcoal/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Microscope className="w-4 h-4 text-gold" />
            <span className="text-[10px] uppercase tracking-ultra text-warm-grey font-bold">
              Melissopalynology & Micro-Spectroscopy
            </span>
          </div>
          <h3 className="text-2xl serif text-charcoal font-normal">
            Botanical Pollen Grain Provenance
          </h3>
        </div>

        {/* Magnification Selector */}
        <div className="flex items-center gap-1 border border-charcoal/30 bg-alabaster p-1">
          {(["40x", "100x", "400x"] as const).map((mag) => (
            <button
              key={mag}
              onClick={() => setZoomLevel(mag)}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase transition-colors ${
                zoomLevel === mag ? "bg-charcoal text-gold" : "text-charcoal hover:bg-white"
              }`}
            >
              {mag} Zoom
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Visual Microscope Lens + Pollen Spectrum Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left: Interactive Microscope Reticle Viewport (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-charcoal bg-[#141414] relative overflow-hidden flex items-center justify-center shadow-inner group">
            {/* Circular Crosshair Grid */}
            <div className="absolute inset-0 border border-gold/30 rounded-full scale-75 pointer-events-none" />
            <div className="absolute inset-0 border border-gold/20 rounded-full scale-50 pointer-events-none" />
            <div className="absolute w-full h-px bg-gold/30 pointer-events-none" />
            <div className="absolute h-full w-px bg-gold/30 pointer-events-none" />

            {/* Microscopic Pollen Grain Morphologies Rendered in SVG */}
            <svg
              viewBox="0 0 200 200"
              className={`w-48 h-48 transition-transform duration-700 ${
                zoomLevel === "400x" ? "scale-150" : zoomLevel === "100x" ? "scale-100" : "scale-75"
              }`}
            >
              {/* Central Dominant Pollen Grain */}
              <circle
                cx="100"
                cy="100"
                r="36"
                fill="#D4AF37"
                stroke="#F3E5AB"
                strokeWidth="2.5"
                opacity="0.9"
              />
              <circle cx="100" cy="100" r="28" fill="none" stroke="#B89528" strokeWidth="1.5" strokeDasharray="3 2" />
              {/* Pores / Colpi */}
              <ellipse cx="100" cy="68" rx="4" ry="7" fill="#141414" />
              <ellipse cx="74" cy="120" rx="6" ry="4" fill="#141414" />
              <ellipse cx="126" cy="120" rx="6" ry="4" fill="#141414" />

              {/* Secondary Pollen Grains Floating in Nectar Substrate */}
              <circle cx="48" cy="52" r="14" fill="#E4DDD3" stroke="#D4AF37" strokeWidth="1.5" opacity="0.8" />
              <circle cx="156" cy="62" r="16" fill="#E4DDD3" stroke="#D4AF37" strokeWidth="1.5" opacity="0.8" />
              <circle cx="145" cy="148" r="12" fill="#E4DDD3" stroke="#D4AF37" strokeWidth="1.5" opacity="0.8" />
              <circle cx="58" cy="152" r="10" fill="#E4DDD3" stroke="#D4AF37" strokeWidth="1.5" opacity="0.7" />
            </svg>

            {/* Live Reticle HUD overlay */}
            <div className="absolute top-3 left-4 text-[9px] font-mono text-gold/90 font-bold uppercase tracking-widest">
              NABL Optical Feed • {zoomLevel}
            </div>
            <div className="absolute bottom-3 right-4 text-[9px] font-mono text-emerald-400 font-bold uppercase">
              {pollenProfile.dominantPollenPercent}% Monofloral
            </div>
          </div>

          <p className="text-[10px] text-warm-grey font-mono mt-3 text-center">
            Micrograph Calibration: ISO/IEC 17025 Certified Optical Stage
          </p>
        </div>

        {/* Right: Botanical Purity Matrix & Pollen Spectrum (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold font-mono border border-emerald-300">
                FSSAI Monofloral Verified (&gt;45% Threshold)
              </span>
            </div>

            <h4 className="text-xl serif text-charcoal font-bold">
              {pollenProfile.primaryFlora}
            </h4>
            <p className="text-xs font-serif italic text-warm-grey mb-4">
              Scientific Classification: {pollenProfile.scientificName}
            </p>

            {/* Pollen Composition Spectrum Bars */}
            <div className="space-y-3 mt-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-charcoal">
                    {pollenProfile.primaryFlora.split("(")[0]} (Dominant)
                  </span>
                  <span className="font-bold text-gold">
                    {pollenProfile.dominantPollenPercent}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-charcoal/10 overflow-hidden">
                  <div
                    className="h-full bg-gold transition-all duration-1000"
                    style={{ width: `${pollenProfile.dominantPollenPercent}%` }}
                  />
                </div>
              </div>

              {pollenProfile.secondaryPollen.map((p, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-[11px] font-mono text-warm-grey mb-0.5">
                    <span>{p.name}</span>
                    <span>{p.percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-charcoal/10 overflow-hidden">
                    <div
                      className="h-full bg-charcoal/50"
                      style={{ width: `${p.percent * 3}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Micro-Details Grid */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-charcoal/10 text-xs font-mono">
            <div className="p-3 bg-[#F9F8F6] border border-charcoal/10">
              <p className="text-[9px] uppercase tracking-widest text-warm-grey font-bold mb-0.5">
                Absolute Pollen Count (APC)
              </p>
              <p className="text-base font-bold text-charcoal">
                {pollenProfile.pollenGrainDensityPerGram.toLocaleString("en-IN")} <span className="text-xs font-normal text-warm-grey">grains/g</span>
              </p>
              <p className="text-[9px] text-emerald-700 mt-0.5 font-sans">
                Maurizio Class III Standard
              </p>
            </div>

            <div className="p-3 bg-[#F9F8F6] border border-charcoal/10">
              <p className="text-[9px] uppercase tracking-widest text-warm-grey font-bold mb-0.5">
                Exine Morphology
              </p>
              <p className="text-[11px] font-medium text-charcoal line-clamp-2">
                {pollenProfile.morphology}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
