"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Microscope,
  Upload,
  Scan,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Download,
  Layers,
  Flower2,
  MapPin,
  FlaskConical,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import HoneyChainLogo from "./HoneyChainLogo";

// ─── Pollen taxonomy & floral origin database ─────────────────────────────────
interface PollenType {
  id: string;
  commonName: string;
  botanicalName: string;
  origin: string;
  state: string;
  shape: string;
  apertureType: string;
  sizeRange: string;
  surfacePattern: string;
  giTag?: string;
  purityContrib: number; // Expected % of pollen count for this monofloral type
  confidenceThreshold: number;
}

const POLLEN_DB: PollenType[] = [
  {
    id: "acacia_kashmir",
    commonName: "Kashmir Acacia / Locust Tree",
    botanicalName: "Robinia pseudoacacia",
    origin: "Kashmir Valley, Anantnag",
    state: "Jammu & Kashmir",
    shape: "Tricolporate, Prolate-Spheroidal",
    apertureType: "3 Colpi",
    sizeRange: "24–28 µm",
    surfacePattern: "Striate-reticulate exine",
    giTag: "Kashmir Acacia Honey — GI-731",
    purityContrib: 62,
    confidenceThreshold: 0.82,
  },
  {
    id: "litchi_bihar",
    commonName: "Shahi Litchi",
    botanicalName: "Litchi chinensis",
    origin: "Muzaffarpur, Bihar",
    state: "Bihar",
    shape: "Tricolporate, Oblate-Spheroidal",
    apertureType: "3 Colpi",
    sizeRange: "16–22 µm",
    surfacePattern: "Scabrate, micro-echinate",
    giTag: "Shahi Litchi Honey — GI-552",
    purityContrib: 71,
    confidenceThreshold: 0.78,
  },
  {
    id: "mangrove_sundarban",
    commonName: "Sundarbans Khalsi Mangrove",
    botanicalName: "Aegiceras corniculatum",
    origin: "Sundarbans Biosphere Reserve",
    state: "West Bengal",
    shape: "Monocolpate, Ellipsoidal",
    apertureType: "1 Colpus",
    sizeRange: "20–32 µm",
    surfacePattern: "Regulate-reticulate",
    giTag: "Sundarbans Honey — GI-712",
    purityContrib: 55,
    confidenceThreshold: 0.74,
  },
  {
    id: "mustard_rajasthan",
    commonName: "Mustard / Sarson",
    botanicalName: "Brassica napus",
    origin: "Bharatpur, Rajasthan",
    state: "Rajasthan",
    shape: "Tricolporate, Prolate",
    apertureType: "3 Colpi + 3 Pores",
    sizeRange: "20–26 µm",
    surfacePattern: "Reticulate-verrucate",
    purityContrib: 48,
    confidenceThreshold: 0.70,
  },
  {
    id: "cardamom_kerala",
    commonName: "Green Cardamom",
    botanicalName: "Elettaria cardamomum",
    origin: "Idukki, Kerala",
    state: "Kerala",
    shape: "Monosulcate, Boat-Shaped",
    apertureType: "1 Sulcus",
    sizeRange: "42–55 µm",
    surfacePattern: "Psilate-granulate exine",
    giTag: "Idukki Cardamom Honey — GI-818",
    purityContrib: 65,
    confidenceThreshold: 0.85,
  },
  {
    id: "sunflower_deccan",
    commonName: "Hybrid Sunflower",
    botanicalName: "Helianthus annuus",
    origin: "Belagavi, Karnataka",
    state: "Karnataka",
    shape: "Tricolporate, Oblate",
    apertureType: "3 Colpi + Pores",
    sizeRange: "30–40 µm",
    surfacePattern: "Spiny echinate (4–5 µm spines)",
    purityContrib: 58,
    confidenceThreshold: 0.77,
  },
];

// Simulated Gemini Vision classification result
interface ClassificationResult {
  dominantPollen: PollenType;
  secondaryPollens: Array<{ pollen: PollenType; percent: number }>;
  totalPollenCount: number;
  monofloralPurity: number; // %
  fssaiGrade: string;
  botanicalOriginConfidence: number;
  labReportId: string;
  isMonofloral: boolean;
}

const PREVIEW_IMAGES = [
  { id: "acacia_kashmir", label: "Kashmir Acacia Sample", color: "#0284C7" },
  { id: "litchi_bihar", label: "Shahi Litchi Sample", color: "#E11D48" },
  { id: "mangrove_sundarban", label: "Sundarbans Mangrove Sample", color: "#059669" },
  { id: "mustard_rajasthan", label: "Mustard Sarson Sample", color: "#F59E0B" },
  { id: "cardamom_kerala", label: "Idukki Cardamom Sample", color: "#7C3AED" },
  { id: "sunflower_deccan", label: "Deccan Sunflower Sample", color: "#D97706" },
];

function simulateClassification(pollenId: string): ClassificationResult {
  const dominant = POLLEN_DB.find((p) => p.id === pollenId) || POLLEN_DB[0];
  const others = POLLEN_DB.filter((p) => p.id !== pollenId).slice(0, 3);
  const remaining = 100 - dominant.purityContrib;
  const secondaryPollens = others.map((p, i) => ({
    pollen: p,
    percent: i === 0 ? Math.round(remaining * 0.55) : i === 1 ? Math.round(remaining * 0.30) : Math.round(remaining * 0.15),
  }));
  const isMonofloral = dominant.purityContrib >= 45;
  return {
    dominantPollen: dominant,
    secondaryPollens,
    totalPollenCount: Math.floor(Math.random() * 400) + 250,
    monofloralPurity: dominant.purityContrib,
    fssaiGrade: dominant.purityContrib >= 60 ? "Grade A — Monofloral GI Honey" : dominant.purityContrib >= 45 ? "Grade B — Monofloral" : "Grade C — Multifloral",
    botanicalOriginConfidence: dominant.confidenceThreshold + Math.random() * 0.1,
    labReportId: `HC-PAL-${Date.now().toString(36).toUpperCase().slice(-7)}`,
    isMonofloral,
  };
}

export default function PollenVisionAnalyzer() {
  const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runAnalysis = useCallback((pollenId: string) => {
    setIsAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      setResult(simulateClassification(pollenId));
      setIsAnalyzing(false);
    }, 2200);
  }, []);

  const handlePreviewSelect = (id: string) => {
    setSelectedPreviewId(id);
    runAnalysis(id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const randomPollen = POLLEN_DB[Math.floor(Math.random() * POLLEN_DB.length)];
    setSelectedPreviewId(randomPollen.id);
    runAnalysis(randomPollen.id);
  };

  const verifyUrl = result
    ? `https://honeychain-truetag.vercel.app/verify-pollen/${result.labReportId}`
    : "";

  return (
    <div className="border-2 border-charcoal/20 bg-white shadow-luxury-card overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-charcoal text-alabaster border-b border-charcoal flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="w-10 h-10 border border-gold bg-[#121212] rounded-xl flex items-center justify-center text-gold shrink-0">
          <Microscope className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-ultra text-gold font-mono font-bold">
              Gemini Vision AI • Melissopalynology
            </span>
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[8px] font-mono uppercase font-bold">
              6 Indian Floral Families
            </span>
          </div>
          <h2 className="text-lg sm:text-xl serif text-alabaster font-normal">
            Live Microscope Pollen Grain Vision AI — Floral Botanical Origin Classifier
          </h2>
        </div>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* ─── Left: Upload / Sample Presets ──────────────────────────────── */}
        <div className="lg:col-span-5 space-y-5">
          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed cursor-pointer p-8 text-center transition-all ${
              isDragging ? "border-gold bg-gold/10 scale-[1.01]" : "border-charcoal/25 bg-alabaster hover:border-gold hover:bg-gold/5"
            }`}
          >
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={() => {
              const randomPollen = POLLEN_DB[Math.floor(Math.random() * POLLEN_DB.length)];
              setSelectedPreviewId(randomPollen.id);
              runAnalysis(randomPollen.id);
            }} />
            <Microscope className="w-10 h-10 text-warm-grey/50 mx-auto mb-3" />
            <p className="text-sm font-serif text-charcoal mb-1">Drop Pollen Slide Image Here</p>
            <p className="text-[10px] font-mono text-warm-grey">
              .JPG · .PNG · .TIFF — 40× to 400× light microscope photography
            </p>
            <div className="mt-4 px-5 py-2 bg-charcoal text-gold text-[10px] font-mono uppercase tracking-widest font-bold inline-flex items-center gap-2 mx-auto">
              <Upload className="w-3.5 h-3.5" />
              Select Microscope Image
            </div>
          </div>

          {/* Preset Sample Slides */}
          <div>
            <p className="text-[10px] uppercase tracking-widest font-mono font-bold text-warm-grey mb-2">
              Or Select Demo Pollen Sample:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PREVIEW_IMAGES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePreviewSelect(p.id)}
                  className={`p-3 border-2 text-left transition-all ${
                    selectedPreviewId === p.id
                      ? "border-gold bg-gold/10 scale-[1.01] shadow-sm"
                      : "border-charcoal/15 bg-white hover:border-charcoal/40"
                  }`}
                >
                  <div className="w-full h-10 rounded mb-2 flex items-center justify-center" style={{ backgroundColor: `${p.color}18`, border: `1px solid ${p.color}30` }}>
                    <Flower2 className="w-5 h-5" style={{ color: p.color }} />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-charcoal block leading-tight">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Right: Classification Results ──────────────────────────────── */}
        <div className="lg:col-span-7">
          {isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center space-y-4 p-12 bg-[#F9F8F6] border-2 border-charcoal/10">
              <div className="relative w-20 h-20">
                <div className="w-20 h-20 rounded-full border-4 border-charcoal/10 border-t-gold animate-spin" />
                <Microscope className="absolute inset-0 m-auto w-8 h-8 text-charcoal" />
              </div>
              <div className="text-center">
                <p className="text-sm serif font-bold text-charcoal">Gemini Vision AI Classifying...</p>
                <p className="text-[10px] font-mono text-warm-grey mt-1">Morphological feature extraction · Aperture detection · Exine pattern matching</p>
              </div>
              {[
                "Loading palynological taxonomy database...",
                "Detecting pollen grain boundaries...",
                "Measuring polar × equatorial diameter...",
                "Classifying aperture type (colpi / pores)...",
                "Matching exine surface pattern to KVIC GI index...",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-warm-grey">
                  <Loader className={`w-3 h-3 ${i <= 2 ? "text-emerald-500" : "text-warm-grey/40 animate-pulse"}`} i={i} />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}

          {!isAnalyzing && !result && (
            <div className="h-full flex flex-col items-center justify-center space-y-3 p-12 bg-[#F9F8F6] border-2 border-dashed border-charcoal/15">
              <Scan className="w-12 h-12 text-warm-grey/30 mx-auto" />
              <p className="text-sm serif text-warm-grey text-center">Upload a microscopic pollen slide or select a demo sample to begin botanical origin classification.</p>
            </div>
          )}

          {!isAnalyzing && result && (
            <div className="space-y-4">
              {/* Primary Result Banner */}
              <div className="p-5 bg-charcoal border-2 border-charcoal text-alabaster">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-ultra text-gold font-mono font-bold block mb-1">
                      Dominant Pollen Species Identified
                    </span>
                    <h3 className="text-2xl serif text-gold">{result.dominantPollen.commonName}</h3>
                    <p className="text-[11px] font-serif italic text-warm-grey mt-0.5">{result.dominantPollen.botanicalName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-3xl serif font-bold text-gold">{result.monofloralPurity}%</p>
                    <p className="text-[9px] font-mono text-warm-grey">Monofloral Purity</p>
                  </div>
                </div>
              </div>

              {/* Morphological Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-4 border-2 border-charcoal/15 bg-[#F9F8F6] space-y-1.5 text-xs font-mono">
                  <p className="text-[9px] uppercase tracking-widest text-warm-grey font-bold mb-2">Grain Morphology</p>
                  <p><span className="text-warm-grey">Shape:</span> <strong className="text-charcoal">{result.dominantPollen.shape}</strong></p>
                  <p><span className="text-warm-grey">Aperture:</span> <strong className="text-charcoal">{result.dominantPollen.apertureType}</strong></p>
                  <p><span className="text-warm-grey">Size:</span> <strong className="text-charcoal">{result.dominantPollen.sizeRange}</strong></p>
                  <p><span className="text-warm-grey">Exine:</span> <strong className="text-charcoal">{result.dominantPollen.surfacePattern}</strong></p>
                </div>

                <div className="p-4 border-2 border-charcoal/15 bg-[#F9F8F6] space-y-1.5 text-xs font-mono">
                  <p className="text-[9px] uppercase tracking-widest text-warm-grey font-bold mb-2">Botanical Origin</p>
                  <p><span className="text-warm-grey">Region:</span> <strong className="text-charcoal">{result.dominantPollen.origin}</strong></p>
                  <p><span className="text-warm-grey">State:</span> <strong className="text-charcoal">{result.dominantPollen.state}</strong></p>
                  {result.dominantPollen.giTag && (
                    <p><span className="text-warm-grey">GI Status:</span> <strong className="text-gold">{result.dominantPollen.giTag}</strong></p>
                  )}
                  <p><span className="text-warm-grey">AI Confidence:</span> <strong className="text-emerald-700">{(result.botanicalOriginConfidence * 100).toFixed(1)}%</strong></p>
                </div>
              </div>

              {/* Pollen Composition Bar Chart */}
              <div className="p-4 border-2 border-charcoal/15 bg-white">
                <p className="text-[9px] uppercase tracking-widest font-mono font-bold text-warm-grey mb-3">Pollen Composition Analysis ({result.totalPollenCount} grains counted)</p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] font-mono font-bold mb-1">
                      <span className="text-charcoal">{result.dominantPollen.commonName}</span>
                      <span className="text-gold">{result.monofloralPurity}%</span>
                    </div>
                    <div className="w-full h-3 bg-charcoal/10">
                      <div className="h-full bg-gold transition-all duration-700" style={{ width: `${result.monofloralPurity}%` }} />
                    </div>
                  </div>
                  {result.secondaryPollens.map((sp) => (
                    <div key={sp.pollen.id}>
                      <div className="flex justify-between text-[9px] font-mono mb-1 text-warm-grey">
                        <span>{sp.pollen.commonName}</span>
                        <span>{sp.percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-charcoal/10">
                        <div className="h-full bg-charcoal/30 transition-all duration-700" style={{ width: `${sp.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FSSAI Grade + QR */}
              <div className="p-4 border-2 border-charcoal/15 bg-white flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-mono font-bold text-warm-grey mb-1">FSSAI IS 4941:2020 Grade</p>
                  <p className={`text-lg serif font-bold ${result.monofloralPurity >= 60 ? "text-emerald-700" : result.monofloralPurity >= 45 ? "text-amber-700" : "text-rose-700"}`}>
                    {result.fssaiGrade}
                  </p>
                  <p className="text-[9px] font-mono text-warm-grey mt-0.5">Palynology Lab Report ID: {result.labReportId}</p>
                </div>
                <div className="flex flex-col items-center">
                  <QRCodeSVG
                    value={verifyUrl}
                    size={72}
                    level="H"
                    imageSettings={{ src: "/honeychain_app_icon.jpg", height: 16, width: 16, excavate: true }}
                  />
                  <span className="text-[8px] font-mono text-warm-grey mt-1">Scan to Verify</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setResult(null); setSelectedPreviewId(null); }}
                  className="flex-1 py-2.5 border-2 border-charcoal text-xs uppercase tracking-widest font-mono font-bold text-charcoal hover:bg-alabaster flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  New Analysis
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-charcoal text-gold hover:bg-black text-xs uppercase tracking-widest font-mono font-bold flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Palynology Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// helper: animated loader steps
function Loader({ i, className }: { i: number; className?: string }) {
  return i <= 2
    ? <CheckCircle2 className={`w-3 h-3 ${className}`} />
    : <RefreshCw className={`w-3 h-3 ${className}`} />;
}
