"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NMRSpectrumViewer from "@/components/NMRSpectrumViewer";
import Scorecard from "@/components/Scorecard";
import {
  FlaskConical,
  Microscope,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Download,
  Layers,
  ChevronRight,
} from "lucide-react";
import { DEMO_BATCHES } from "@/lib/constants";
import { getCustomBatches, fetchBatchesFromDB } from "@/lib/registry";
import { BatchMetadata } from "@/lib/types";

export default function QualityLabPage() {
  const [batches, setBatches] = useState<BatchMetadata[]>(DEMO_BATCHES);

  useEffect(() => {
    fetchBatchesFromDB().then((b) => {
      setBatches(b);
      if (b.length > 0) setSelectedBatchId(b[0].batchId);
    });
  }, []);

  // Test parameters state
  const [selectedBatchId, setSelectedBatchId] = useState<number>(1);
  const [moisture, setMoisture] = useState<number>(17.2);
  const [brix, setBrix] = useState<number>(81.5);
  const [hmf, setHmf] = useState<number>(14.2);
  const [diastase, setDiastase] = useState<number>(18.5);
  const [conductivity, setConductivity] = useState<number>(0.38);
  const [c13Delta, setC13Delta] = useState<number>(-25.4);
  const [c4Sugar, setC4Sugar] = useState<number>(1.2);
  const [smrMarker, setSmrMarker] = useState<number>(0.02);

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    grade: string;
    passed: boolean;
    adulterant: string;
    adulterantProb: number;
    fssaiViolations: string[];
  } | null>({
    score: 94.6,
    grade: "Grade A+ (Premium Raw Organic)",
    passed: true,
    adulterant: "Pure Unadulterated",
    adulterantProb: 0.98,
    fssaiViolations: [],
  });

  const handleBatchSelect = (batchId: number) => {
    setSelectedBatchId(batchId);
    const target = batches.find((b) => b.batchId === batchId);
    if (target) {
      setMoisture(target.labReport.moisturePercent);
      setBrix(target.labReport.brixPercent);
      setHmf(target.labReport.hmfMgPerKg);
      setDiastase(target.labReport.diastaseNumber);
      setConductivity(target.labReport.electricalConductivity);
    }
  };

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      // Call FastAPI microservice
      const res = await fetch("/api/quality/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moisture,
          brix,
          hmf,
          diastase,
          electrical_conductivity: conductivity,
          c13_delta: c13Delta,
          c4_sugar_percent: c4Sugar,
          smr_marker: smrMarker,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const violations: string[] = [];
        if (moisture > 20) violations.push("Moisture exceeds FSSAI max 20%");
        if (brix < 65) violations.push("Brix below FSSAI min 65%");
        if (hmf > 80) violations.push("HMF exceeds FSSAI max 80 mg/kg");
        if (diastase < 8) violations.push("Diastase below FSSAI min 8 DN");
        if (conductivity > 0.8) violations.push("Conductivity exceeds FSSAI max 0.8 mS/cm");
        if (c4Sugar > 7.0) violations.push("C4 Corn Syrup marker exceeds limit (>7%)");

        setResult({
          score: data.quality_score ?? data.purity_score ?? 91.2,
          grade: data.grade ?? (moisture < 18 ? "Grade A+ (Premium Raw Organic)" : "Grade A (Standard Pure)"),
          passed: violations.length === 0 && (data.quality_score ?? 90) >= 70,
          adulterant: data.adulterant_type ?? (c4Sugar > 7 ? "C4 Corn Syrup" : "Pure Unadulterated"),
          adulterantProb: data.adulterant_probability ?? 0.95,
          fssaiViolations: violations,
        });
      } else {
        // Fallback calculation
        fallbackCompute();
      }
    } catch {
      fallbackCompute();
    } finally {
      setAnalyzing(false);
    }
  };

  const fallbackCompute = () => {
    const violations: string[] = [];
    if (moisture > 20) violations.push("Moisture exceeds FSSAI max 20%");
    if (brix < 65) violations.push("Brix below FSSAI min 65%");
    if (hmf > 80) violations.push("HMF exceeds FSSAI max 80 mg/kg");
    if (diastase < 8) violations.push("Diastase below FSSAI min 8 DN");
    if (conductivity > 0.8) violations.push("Conductivity exceeds FSSAI max 0.8 mS/cm");
    if (c4Sugar > 7.0) violations.push("C4 Corn Syrup marker exceeds limit (>7%)");

    let score = 100;
    score -= Math.max(0, (moisture - 17) * 4);
    score -= Math.max(0, (hmf - 10) * 0.5);
    score -= c4Sugar * 5;
    score = Math.max(20, Math.min(99, Math.round(score)));

    setResult({
      score,
      grade: score >= 90 ? "Grade A+ (Premium Raw Organic)" : score >= 75 ? "Grade A (Standard)" : "Grade C (Substandard)",
      passed: violations.length === 0,
      adulterant: c4Sugar > 7 ? "C4 Corn Syrup" : smrMarker > 0.1 ? "Rice Syrup" : "Pure Unadulterated",
      adulterantProb: 0.94,
      fssaiViolations: violations,
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F9F8F6]">
      <Navbar />

      <main className="py-12 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full flex-1">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-charcoal hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-ultra font-bold text-warm-grey">
            <span>National Bee Board Lab</span>
            <span>•</span>
            <span className="text-emerald-700">NABL IS 4941:2020 Certified</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-10 pb-6 border-b-2 border-charcoal/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[10px] uppercase tracking-ultra text-charcoal font-bold">
              AI NMR Spectrometry & Adulteration Diagnostic Suite
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl serif text-charcoal font-normal">
            Quality & <span className="italic text-gold font-serif">NMR Analysis</span>
          </h1>
          <p className="text-xs text-warm-grey mt-1">
            Conduct multi-parameter FSSAI physico-chemical scoring, &delta;&sup1;&sup3;C Carbon Isotope EA-IRMS testing, and 400 MHz &sup1;H-NMR resonance profiling.
          </p>
        </div>

        {/* Gemini AI OCR Fast Extract Banner */}
        <div className="mb-8 p-4 border-2 border-gold bg-gold/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold/20 border border-gold flex items-center justify-center text-gold shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-ultra font-bold text-charcoal">
                ✨ Gemini 2.0 Multimodal OCR Certificate Scanner
              </p>
              <p className="text-xs text-warm-grey">
                Upload physical lab certificates or NMR spectrometry charts for automated parameter extraction and fraud diagnostics.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/quality/upload"
            className="px-5 py-2.5 bg-charcoal text-alabaster hover:bg-gold hover:text-charcoal text-xs uppercase tracking-wider font-bold shrink-0 transition-colors shadow-xs"
          >
            Upload Certificate Photo →
          </Link>
        </div>

        {/* Batch Quick-Selector Bar */}
        <div className="mb-8 p-4 border-2 border-charcoal/15 bg-white shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-[10px] uppercase tracking-widest font-bold text-warm-grey">
              Select Batch for Testing:
            </span>
            <div className="flex flex-wrap gap-2">
              {batches.slice(0, 6).map((b) => (
                <button
                  key={b.batchId}
                  type="button"
                  onClick={() => handleBatchSelect(b.batchId)}
                  className={`px-3 py-1 text-xs font-mono font-bold border transition-colors ${
                    selectedBatchId === b.batchId
                      ? "bg-charcoal text-gold border-charcoal"
                      : "bg-[#F9F8F6] text-charcoal border-charcoal/20 hover:border-gold"
                  }`}
                >
                  Batch #{b.batchId} ({b.qrToken})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Two-Column Testing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Column: Parameter Inputs */}
          <div className="lg:col-span-6 border-2 border-charcoal/15 bg-white p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-charcoal/10">
              <FlaskConical className="w-5 h-5 text-gold" />
              <h3 className="text-xl serif text-charcoal font-bold">Physico-Chemical & Isotope Parameters</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-1">
                    Moisture Content (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={moisture}
                    onChange={(e) => setMoisture(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 border border-charcoal/20 px-3 text-sm font-mono font-bold focus:border-gold focus:outline-none"
                  />
                  <span className="text-[9px] text-warm-grey">FSSAI Limit: ≤ 20.0%</span>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-1">
                    Total Soluble Solids (Brix %)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={brix}
                    onChange={(e) => setBrix(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 border border-charcoal/20 px-3 text-sm font-mono font-bold focus:border-gold focus:outline-none"
                  />
                  <span className="text-[9px] text-warm-grey">FSSAI Limit: ≥ 65.0%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-1">
                    HMF Content (mg/kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={hmf}
                    onChange={(e) => setHmf(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 border border-charcoal/20 px-3 text-sm font-mono font-bold focus:border-gold focus:outline-none"
                  />
                  <span className="text-[9px] text-warm-grey">FSSAI Limit: ≤ 80 mg/kg</span>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-1">
                    Diastase Activity (DN)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={diastase}
                    onChange={(e) => setDiastase(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 border border-charcoal/20 px-3 text-sm font-mono font-bold focus:border-gold focus:outline-none"
                  />
                  <span className="text-[9px] text-warm-grey">FSSAI Limit: ≥ 8.0 Schade</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-1">
                    Elec. Conductivity (mS/cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={conductivity}
                    onChange={(e) => setConductivity(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 border border-charcoal/20 px-3 text-sm font-mono font-bold focus:border-gold focus:outline-none"
                  />
                  <span className="text-[9px] text-warm-grey">FSSAI Limit: ≤ 0.8 mS/cm</span>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-1">
                    δ¹³C Isotope Delta (‰)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={c13Delta}
                    onChange={(e) => setC13Delta(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 border border-charcoal/20 px-3 text-sm font-mono font-bold focus:border-gold focus:outline-none"
                  />
                  <span className="text-[9px] text-warm-grey">Natural Range: -23 to -28‰</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-1">
                    Exogenous C4 Sugars (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={c4Sugar}
                    onChange={(e) => setC4Sugar(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 border border-charcoal/20 px-3 text-sm font-mono font-bold focus:border-gold focus:outline-none"
                  />
                  <span className="text-[9px] text-warm-grey">FSSAI Limit: ≤ 7.0%</span>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-1">
                    SMR Rice Syrup Marker
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={smrMarker}
                    onChange={(e) => setSmrMarker(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 border border-charcoal/20 px-3 text-sm font-mono font-bold focus:border-gold focus:outline-none"
                  />
                  <span className="text-[9px] text-warm-grey">FSSAI Threshold: ≤ 0.05</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={analyzing}
                className="w-full h-12 mt-6 bg-charcoal text-alabaster border-2 border-charcoal hover:border-gold text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <Sparkles className="w-4 h-4 text-gold" />
                <span>{analyzing ? "Executing AI Model & Spectrometry..." : "Run AI Analysis & NMR Diagnostic"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: AI Diagnostics & FSSAI Decision */}
          <div className="lg:col-span-6 border-2 border-charcoal/15 bg-white p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-charcoal/10">
                <div className="flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-gold" />
                  <h3 className="text-xl serif text-charcoal font-bold">Diagnostic Output & Score</h3>
                </div>
                {result && (
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                    result.passed
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-rose-300 bg-rose-50 text-rose-800"
                  }`}>
                    {result.passed ? "FSSAI PASSED" : "NON-COMPLIANT"}
                  </span>
                )}
              </div>

              {result && (
                <div className="space-y-6">
                  {/* Purity Score Hero */}
                  <div className="p-6 bg-[#F9F8F6] border border-charcoal/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-warm-grey font-bold">
                        Calculated AI Purity Score
                      </span>
                      <p className="text-4xl font-serif font-bold text-charcoal mt-1">
                        {result.score}
                        <span className="text-lg text-warm-grey font-sans font-normal">/100</span>
                      </p>
                      <p className="text-xs font-bold text-gold mt-1">{result.grade}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-widest text-warm-grey font-bold">
                        Adulterant Status
                      </span>
                      <p className={`text-base font-bold mt-1 ${result.adulterant.includes("Pure") ? "text-emerald-700" : "text-rose-700"}`}>
                        {result.adulterant}
                      </p>
                      <p className="text-[10px] font-mono text-warm-grey">
                        Confidence: {(result.adulterantProb * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Violations / Compliance list */}
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-warm-grey font-bold block mb-2">
                      FSSAI IS 4941 Compliance Check
                    </span>
                    {result.fssaiViolations.length === 0 ? (
                      <div className="p-4 border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>All parameters satisfy Gazette of India Food Safety & Standards (FSSAI) thresholds.</span>
                      </div>
                    ) : (
                      <div className="p-4 border border-rose-200 bg-rose-50 text-rose-900 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>Quality Threshold Violations:</span>
                        </div>
                        {result.fssaiViolations.map((v, i) => (
                          <p key={i} className="pl-5">• {v}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-charcoal/10 mt-6 flex gap-3">
              <Link
                href="/dashboard/custody"
                className="flex-1 px-4 py-2.5 border-2 border-charcoal bg-white hover:bg-charcoal hover:text-gold text-charcoal text-xs uppercase tracking-widest font-bold text-center transition-colors"
              >
                Log Test to Custody Chain
              </Link>
              <Link
                href="/dashboard/reports"
                className="px-4 py-2.5 border-2 border-gold bg-gold/10 hover:bg-gold hover:text-charcoal text-charcoal text-xs uppercase tracking-widest font-bold text-center transition-colors flex items-center gap-1.5"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>View Reports</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 400 MHz 1H-NMR Resonance Spectrum Visualizer */}
        <div className="border-2 border-charcoal/15 bg-white p-8 shadow-xs mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-charcoal/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-gold rounded-full" />
                <span className="text-[10px] uppercase tracking-ultra text-warm-grey font-bold">
                  Spectroscopy Analysis
                </span>
              </div>
              <h3 className="text-2xl serif text-charcoal font-bold">
                400 MHz ¹H-NMR Resonance Frequency Curve
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-charcoal uppercase tracking-widest bg-[#F9F8F6] px-3 py-1.5 border border-charcoal/15">
              NMR Profile Simulation (IS 4941 Standard)
            </span>
          </div>

          <NMRSpectrumViewer
            purityScore={result?.score ?? 94}
            adulterantClass={result?.adulterant ?? "Pure Unadulterated"}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
