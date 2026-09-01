"use client";

import { useState } from "react";
import {
  FlaskConical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Scale,
} from "lucide-react";

interface HoneySample {
  id: string;
  name: string;
  type: "PURE" | "ADULTERATED";
  flora: string;
  location: string;
  moisture: number;
  brix: number;
  hmf: number;
  diastase: number;
  c13Delta: number;
  c4Sugar: number;
  smrMarker: number;
  score: number;
  grade: string;
  adulterant: string;
  fssaiViolations: string[];
}

const PRESET_SAMPLES: HoneySample[] = [
  {
    id: "SAMPLE-PURE-01",
    name: "Pure Kashmir Acacia Raw Honey",
    type: "PURE",
    flora: "Robinia Pseudoacacia (Acacia)",
    location: "Anantnag, Jammu & Kashmir",
    moisture: 16.8,
    brix: 82.5,
    hmf: 8.2,
    diastase: 16.4,
    c13Delta: -26.8,
    c4Sugar: 0.8,
    smrMarker: 0.01,
    score: 96.2,
    grade: "Grade A+ (Premium Raw Floral)",
    adulterant: "100% Pure Floral Nectar",
    fssaiViolations: [],
  },
  {
    id: "SAMPLE-ADULT-02",
    name: "18% Invert Sugar Syrup Commercial Blend",
    type: "ADULTERATED",
    flora: "Multi-Flora Commercial (Adulterated)",
    location: "Industrial Processing Batch #409",
    moisture: 21.4,
    brix: 76.2,
    hmf: 54.0,
    diastase: 4.2,
    c13Delta: -14.2,
    c4Sugar: 16.4,
    smrMarker: 0.19,
    score: 12.4,
    grade: "Non-Compliant (Adulterated)",
    adulterant: "Acid-Inverted C4 Cane Syrup (18.4% by Mass)",
    fssaiViolations: [
      "C4 Cane Sugar 16.4% violates FSSAI max threshold of 7.0%",
      "δ13C VPDB -14.2‰ indicates C4 photosynthetic plant carbon",
      "SMR (Specific Marker for Rice) 0.19 exceeds 0.05 limit",
      "Moisture 21.4% exceeds FSSAI max 20.0%",
      "HMF 54.0 mg/kg exceeds tropical threshold of 40 mg/kg",
      "Diastase Activity 4.2 Schade units falls below minimum 8.0",
    ],
  },
];

export default function AdulterationComparisonLab() {
  const [selectedSample, setSelectedSample] = useState<HoneySample>(PRESET_SAMPLES[0]);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSelect = (sample: HoneySample) => {
    setIsSimulating(true);
    setTimeout(() => {
      setSelectedSample(sample);
      setIsSimulating(false);
    }, 200);
  };

  return (
    <div className="border-2 border-charcoal/15 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-charcoal/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold/10 border border-gold flex items-center justify-center text-gold">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl serif text-charcoal font-bold">
                FSSAI IS 4941 Adulteration Lab Stress-Tester
              </h3>
              <span className="text-sm md:text-xs md:text-[10px] font-mono px-2 py-0.5 border border-gold/40 bg-gold/10 text-charcoal font-bold uppercase">
                Interactive
              </span>
            </div>
            <p className="text-sm md:text-xs text-warm-grey mt-1">
              Side-by-side comparison of 100% pure raw honey vs. modern synthetic syrup adulteration vectors.
            </p>
          </div>
        </div>

        {/* Sample Selectors */}
        <div className="flex gap-2">
          {PRESET_SAMPLES.map((s) => {
            const isSelected = selectedSample.id === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelect(s)}
                className={`px-3 py-1.5 text-sm md:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                  isSelected
                    ? s.type === "PURE"
                      ? "bg-emerald-700 text-white border-emerald-800 shadow-xs"
                      : "bg-rose-700 text-white border-rose-800 shadow-xs"
                    : "border-charcoal/20 bg-[#F9F8F6] text-charcoal hover:border-gold"
                }`}
              >
                {s.type === "PURE" ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>{s.type === "PURE" ? "Pure Acacia" : "18% Invert Blend"}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {/* Sample Profile Header */}
        <div className="p-5 bg-[#F9F8F6] border border-charcoal/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`px-2.5 py-0.5 text-sm md:text-xs md:text-[10px] md:text-[9px] font-mono font-bold uppercase tracking-widest border ${
                  selectedSample.type === "PURE"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-rose-100 text-rose-800 border-rose-300"
                }`}
              >
                {selectedSample.type === "PURE" ? "VERIFIED AUTHENTIC" : "ADULTERATED SAMPLE"}
              </span>
              <span className="text-sm md:text-xs font-mono text-warm-grey">{selectedSample.id}</span>
            </div>
            <h4 className="text-xl serif font-bold text-charcoal">{selectedSample.name}</h4>
            <p className="text-sm md:text-xs text-warm-grey mt-0.5">{selectedSample.location} · {selectedSample.flora}</p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm md:text-xs md:text-[10px] uppercase tracking-widest text-warm-grey font-mono font-bold">FSSAI Purity Score</p>
            <p className={`text-3xl font-serif font-bold ${
              selectedSample.score >= 85 ? "text-emerald-700" : "text-rose-700"
            }`}>
              {selectedSample.score} <span className="text-base font-sans font-normal text-warm-grey">/ 100</span>
            </p>
            <p className="text-sm md:text-xs font-semibold text-warm-grey">{selectedSample.grade}</p>
          </div>
        </div>

        {/* 6 Key Laboratory Parameters Table */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 bg-[#F9F8F6] border border-charcoal/10">
            <p className="text-sm md:text-xs md:text-[10px] md:text-[9px] uppercase font-mono text-warm-grey font-bold">Moisture %</p>
            <p className={`text-xl font-bold font-mono ${selectedSample.moisture <= 20 ? "text-charcoal" : "text-rose-700"}`}>
              {selectedSample.moisture}%
            </p>
            <p className="text-sm md:text-xs md:text-[10px] text-warm-grey mt-1">FSSAI: &le; 20.0%</p>
          </div>

          <div className="p-3.5 bg-[#F9F8F6] border border-charcoal/10">
            <p className="text-sm md:text-xs md:text-[10px] md:text-[9px] uppercase font-mono text-warm-grey font-bold">Brix Index</p>
            <p className={`text-xl font-bold font-mono ${selectedSample.brix >= 80 ? "text-charcoal" : "text-rose-700"}`}>
              {selectedSample.brix}°
            </p>
            <p className="text-sm md:text-xs md:text-[10px] text-warm-grey mt-1">FSSAI: &ge; 80.0°</p>
          </div>

          <div className="p-3.5 bg-[#F9F8F6] border border-charcoal/10">
            <p className="text-sm md:text-xs md:text-[10px] md:text-[9px] uppercase font-mono text-warm-grey font-bold">HMF Level</p>
            <p className={`text-xl font-bold font-mono ${selectedSample.hmf <= 40 ? "text-charcoal" : "text-rose-700"}`}>
              {selectedSample.hmf} <span className="text-sm md:text-xs font-normal text-warm-grey">mg/kg</span>
            </p>
            <p className="text-sm md:text-xs md:text-[10px] text-warm-grey mt-1">FSSAI: &le; 40.0</p>
          </div>

          <div className="p-3.5 bg-[#F9F8F6] border border-charcoal/10">
            <p className="text-sm md:text-xs md:text-[10px] md:text-[9px] uppercase font-mono text-warm-grey font-bold">Diastase (DN)</p>
            <p className={`text-xl font-bold font-mono ${selectedSample.diastase >= 8 ? "text-charcoal" : "text-rose-700"}`}>
              {selectedSample.diastase}
            </p>
            <p className="text-sm md:text-xs md:text-[10px] text-warm-grey mt-1">FSSAI: &ge; 8.0 DN</p>
          </div>

          <div className="p-3.5 bg-[#F9F8F6] border border-charcoal/10">
            <p className="text-sm md:text-xs md:text-[10px] md:text-[9px] uppercase font-mono text-warm-grey font-bold">&delta;13C Isotope</p>
            <p className={`text-xl font-bold font-mono ${selectedSample.c13Delta <= -23.5 ? "text-charcoal" : "text-rose-700"}`}>
              {selectedSample.c13Delta} <span className="text-sm md:text-xs font-normal text-warm-grey">‰</span>
            </p>
            <p className="text-sm md:text-xs md:text-[10px] text-warm-grey mt-1">EA-IRMS: &le; -23.5</p>
          </div>

          <div className="p-3.5 bg-[#F9F8F6] border border-charcoal/10">
            <p className="text-sm md:text-xs md:text-[10px] md:text-[9px] uppercase font-mono text-warm-grey font-bold">C4 Sugar %</p>
            <p className={`text-xl font-bold font-mono ${selectedSample.c4Sugar <= 7.0 ? "text-charcoal" : "text-rose-700"}`}>
              {selectedSample.c4Sugar}%
            </p>
            <p className="text-sm md:text-xs md:text-[10px] text-warm-grey mt-1">FSSAI: &le; 7.0%</p>
          </div>
        </div>

        {/* Violations / Compliance Audit Card */}
        {selectedSample.fssaiViolations.length > 0 ? (
          <div className="p-4 bg-rose-50 border-2 border-rose-300">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              <p className="text-sm md:text-xs uppercase font-mono font-bold text-rose-800 tracking-wider">
                Non-Compliance Violations Detected ({selectedSample.fssaiViolations.length} Parameters Failed)
              </p>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-sm md:text-xs text-rose-900 font-mono">
              {selectedSample.fssaiViolations.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-300 flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <p className="text-sm md:text-xs font-mono text-emerald-900 font-bold">
              100% Passed: Sample strictly satisfies all FSSAI IS 4941:2019, IRMS &delta;13C, and SMR rice syrup standards. Qualified for Polygon PoS on-chain minting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
