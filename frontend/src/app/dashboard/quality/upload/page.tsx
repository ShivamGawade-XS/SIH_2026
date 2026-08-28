"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import confetti from "canvas-confetti";
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  ScanLine,
  Activity,
  Layers,
} from "lucide-react";

export default function UploadLabCertificatePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sampleText, setSampleText] = useState("");
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [qualityResult, setQualityResult] = useState<any | null>(null);
  const [engineUsed, setEngineUsed] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !sampleText) {
      alert("Please upload a certificate photo or paste report text");
      return;
    }

    setLoading(true);
    setExtractedData(null);
    setQualityResult(null);

    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (sampleText) formData.append("text", sampleText);

      const res = await fetch("/api/ai/analyze-lab-report", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.extracted) {
        setExtractedData(data.extracted);
        setQualityResult(data.quality);
        setEngineUsed(data.engine || "Gemini 2.0 Flash + FSSAI Physics Engine");

        confetti({
          particleCount: 70,
          spread: 50,
          origin: { y: 0.6 },
          colors: ["#D4AF37", "#009688", "#1A1A1A"],
        });
      } else {
        alert(data.error || "Analysis failed");
      }
    } catch (err: any) {
      alert("AI analysis network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSampleReport = () => {
    setSampleText(`NABL ACCREDITED TESTING LABORATORY REPORT #NBB-2026-8941
SAMPLE ID: RAW MONOFLORAL HONEY BATCH #001
TEST PARAMETERS ACCORDING TO FSSAI IS 4941:2020:
- Moisture Content: 16.8% (FSSAI Limit: Max 20.0%)
- Brix Index: 82.4° Brix (Standard: Min 65.0%)
- Hydroxymethylfurfural (HMF): 8.4 mg/kg (Limit: Max 80.0 mg/kg)
- Diastase Activity Index: 21.2 DN (Limit: Min 8.0 DN)
- Electrical Conductivity: 0.36 mS/cm (Limit: Max 0.8 mS/cm)
- Carbon Isotope Ratio (Delta 13C): -26.4 per mil
- C4 Exogenous Sugar Content: 0.8% (Limit: Max 7.0%)
- Specific Marker for Rice Syrup (SMR): Negative (0.012)
CONCLUSION: Sample conforms to Grade A+ Premium Raw Organic Honey standards.`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F9F8F6]">
      <Navbar />

      <main className="py-16 px-6 md:px-12 max-w-5xl mx-auto w-full flex-1">
        <Link
          href="/dashboard/quality"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-warm-grey hover:text-charcoal transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Quality Lab Hub</span>
        </Link>

        <div className="border-2 border-charcoal/20 bg-white p-8 md:p-12 shadow-luxury-card mb-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-charcoal/10">
            <div className="w-12 h-12 border-2 border-charcoal bg-charcoal text-gold flex items-center justify-center">
              <ScanLine className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-ultra text-warm-grey font-bold">Multimodal AI Vision & OCR</p>
              <h1 className="text-3xl md:text-4xl serif text-charcoal font-normal">
                Gemini AI Lab Certificate Analyzer
              </h1>
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-8">
            {/* File Upload Dropzone */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-bold">
                1. Upload Physical Lab Certificate or NMR Spectrometry Chart (JPG / PNG / PDF)
              </label>
              <div className="border-2 border-dashed border-charcoal/30 hover:border-gold p-8 text-center bg-alabaster/40 transition-colors">
                <input
                  type="file"
                  id="labFile"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="labFile" className="cursor-pointer block">
                  <UploadCloud className="w-10 h-10 text-gold mx-auto mb-3" />
                  <p className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                    {file ? file.name : "Click to Browse or Drag Certificate Image Here"}
                  </p>
                  <p className="text-[10px] text-warm-grey">
                    Supports high-resolution camera snapshots from NABL laboratories
                  </p>
                </label>
                {previewUrl && (
                  <div className="mt-4 max-w-xs mx-auto border border-charcoal/20 p-1 bg-white">
                    <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-48 object-contain" />
                  </div>
                )}
              </div>
            </div>

            {/* Paste Report Text Alternative */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-2">
                <label className="text-[10px] uppercase tracking-widest text-warm-grey font-bold">
                  2. Or Paste Raw Lab Test Transcript / Text
                </label>
                <button
                  type="button"
                  onClick={handleLoadSampleReport}
                  className="text-[10px] uppercase tracking-widest text-gold hover:text-charcoal font-bold underline"
                >
                  ⚡ Load Sample FSSAI NABL Report
                </button>
              </div>
              <textarea
                rows={4}
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder="Paste laboratory spectrometry output or chemist report notes here..."
                className="w-full border border-charcoal/30 p-3 text-xs font-mono focus:border-gold focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-charcoal text-alabaster uppercase tracking-widest text-xs font-bold btn-gold-slide flex items-center justify-center gap-3 shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  <span>Gemini Multimodal AI Extracting Parameters & Analyzing Purity...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span>Run AI Lab Certificate Parameter Extraction</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RESULTS SECTION */}
        {extractedData && qualityResult && (
          <div className="border-2 border-gold bg-white p-8 md:p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-charcoal/10">
              <div>
                <span className="text-[10px] uppercase tracking-ultra text-gold font-bold block mb-1">
                  AI Vision Extraction Complete
                </span>
                <h2 className="text-3xl serif text-charcoal font-bold">
                  Laboratory Analysis & Purity Assessment
                </h2>
                <p className="text-xs text-warm-grey font-mono mt-1">Engine: {engineUsed}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-widest text-warm-grey block">FSSAI Purity Score</span>
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-5xl font-serif text-gold font-bold">{qualityResult.quality_score}</span>
                  <span className="text-lg text-warm-grey">/100</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 block">
                  {qualityResult.grade}
                </span>
              </div>
            </div>

            {/* Extracted Physicochemical Parameters Table */}
            <div className="mb-8">
              <h3 className="text-xs uppercase tracking-widest font-bold text-charcoal mb-4">
                Extracted Physicochemical Parameters (FSSAI IS 4941:2020)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[#F9F8F6] border border-charcoal/10">
                  <span className="text-[9px] uppercase tracking-widest text-warm-grey block mb-1">Moisture Content</span>
                  <span className="text-xl font-mono font-bold text-charcoal">{extractedData.moisture_percent}%</span>
                  <span className="text-[9px] text-emerald-700 block mt-1">FSSAI Max: 20.0%</span>
                </div>
                <div className="p-4 bg-[#F9F8F6] border border-charcoal/10">
                  <span className="text-[9px] uppercase tracking-widest text-warm-grey block mb-1">Brix Density</span>
                  <span className="text-xl font-mono font-bold text-charcoal">{extractedData.brix_index}°Bx</span>
                  <span className="text-[9px] text-emerald-700 block mt-1">Standard: &gt; 80°</span>
                </div>
                <div className="p-4 bg-[#F9F8F6] border border-charcoal/10">
                  <span className="text-[9px] uppercase tracking-widest text-warm-grey block mb-1">HMF Freshness</span>
                  <span className="text-xl font-mono font-bold text-charcoal">{extractedData.hmf_mg_kg} mg/kg</span>
                  <span className="text-[9px] text-emerald-700 block mt-1">Limit: Max 80.0</span>
                </div>
                <div className="p-4 bg-[#F9F8F6] border border-charcoal/10">
                  <span className="text-[9px] uppercase tracking-widest text-warm-grey block mb-1">Diastase Index</span>
                  <span className="text-xl font-mono font-bold text-charcoal">{extractedData.diastase_activity} DN</span>
                  <span className="text-[9px] text-emerald-700 block mt-1">Min: 8.0 DN</span>
                </div>
                <div className="p-4 bg-[#F9F8F6] border border-charcoal/10">
                  <span className="text-[9px] uppercase tracking-widest text-warm-grey block mb-1">Conductivity</span>
                  <span className="text-xl font-mono font-bold text-charcoal">{extractedData.electrical_conductivity} mS/cm</span>
                  <span className="text-[9px] text-emerald-700 block mt-1">Max: 0.8 mS/cm</span>
                </div>
                <div className="p-4 bg-[#F9F8F6] border border-charcoal/10">
                  <span className="text-[9px] uppercase tracking-widest text-warm-grey block mb-1">Delta 13C Isotope</span>
                  <span className="text-xl font-mono font-bold text-charcoal">{extractedData.c13_isotope_delta} ‰</span>
                  <span className="text-[9px] text-emerald-700 block mt-1">Authentic: &lt; -24.0</span>
                </div>
                <div className="p-4 bg-[#F9F8F6] border border-charcoal/10">
                  <span className="text-[9px] uppercase tracking-widest text-warm-grey block mb-1">C4 Exogenous Sugars</span>
                  <span className="text-xl font-mono font-bold text-charcoal">{extractedData.c4_sugar_percent}%</span>
                  <span className="text-[9px] text-emerald-700 block mt-1">Max: 7.0%</span>
                </div>
                <div className="p-4 bg-[#F9F8F6] border border-charcoal/10">
                  <span className="text-[9px] uppercase tracking-widest text-warm-grey block mb-1">SMR Rice Syrup</span>
                  <span className="text-xl font-mono font-bold text-charcoal">{extractedData.smr_marker}</span>
                  <span className="text-[9px] text-emerald-700 block mt-1">Marker: Negative</span>
                </div>
              </div>
            </div>

            {/* Adulterant Fingerprint Banner */}
            <div className="p-4 bg-charcoal text-alabaster flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
              <div>
                <span className="text-[9px] uppercase tracking-ultra text-gold font-bold">Adulteration Fingerprint Classification</span>
                <p className="text-lg font-serif font-bold text-alabaster">{qualityResult.adulterant_fingerprint}</p>
              </div>
              <Link
                href="/dashboard/mint"
                className="px-6 py-3 bg-gold text-charcoal uppercase tracking-widest text-xs font-bold hover:bg-white transition-colors"
              >
                Mint Batch with Extracted Parameters →
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
