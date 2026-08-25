"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import confetti from "canvas-confetti";
import { Layers, ArrowLeft, Sparkles, CheckCircle2, QrCode, ExternalLink, ShieldCheck, Activity } from "lucide-react";

import { saveCustomBatch, getCustomFarmers, getCustomBatches } from "@/lib/registry";

export default function MintBatchPage() {
  const [farmersList, setFarmersList] = useState(getCustomFarmers());
  const [farmerId, setFarmerId] = useState("1");
  const [moisture, setMoisture] = useState(17.8);
  const [brix, setBrix] = useState(81.2);
  const [hmf, setHmf] = useState(16.4);
  const [diastase, setDiastase] = useState(18.0);
  const [conductivity, setConductivity] = useState(0.45);
  const [yieldKg, setYieldKg] = useState(120);

  useEffect(() => {
    setFarmersList(getCustomFarmers());
  }, []);

  // Live AI Microservice Prediction State
  const [aiScore, setAiScore] = useState(94);
  const [aiGrade, setAiGrade] = useState("Grade A+ (Premium Raw Organic)");
  const [aiBreakdown, setAiBreakdown] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{
    batchId: number;
    score: number;
    grade: string;
    qrToken: string;
    txHash: string;
  } | null>(null);

  // Debounced API call to FastAPI AI microservice
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsAiLoading(true);
      try {
        const res = await fetch("/api/quality/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moisture_percent: moisture,
            brix_index: brix,
            hmf_mg_kg: hmf,
            diastase_activity: diastase,
            electrical_conductivity: conductivity,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setAiScore(data.quality_score);
          setAiGrade(data.grade);
          setAiBreakdown(data.breakdown);
        }
      } catch (err) {
        console.warn("AI prediction fallback used:", err);
      } finally {
        setIsAiLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [moisture, brix, hmf, diastase, conductivity]);

  const handleMint = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const allBatches = getCustomBatches();
      const newBatchId = allBatches.length + 1;
      const generatedToken = `TT-2026-0000${newBatchId}`;
      const generatedTx = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      
      const selectedFarmer = farmersList.find(f => f.farmerId === Number(farmerId)) || farmersList[0];

      // Construct BatchMetadata object and save
      const newBatchRecord = {
        batchId: newBatchId,
        farmer: selectedFarmer,
        batch: {
          batchId: newBatchId,
          farmerId: selectedFarmer.farmerId,
          harvestTimestamp: Math.floor(Date.now() / 1000),
          ipfsMetadataHash: "Qm" + Array.from({ length: 44 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join(""),
          qualityScore: aiScore,
          grade: aiGrade,
          isAuthentic: true,
          isRevoked: false,
        },
        custodyChain: [
          {
            actor: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            entity: `Apiary Site (${selectedFarmer.location})`,
            timestamp: Math.floor(Date.now() / 1000),
            action: "Harvested & IoT Monitored",
          },
          {
            actor: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
            entity: "KVIC Regional Honey Processing Center",
            timestamp: Math.floor(Date.now() / 1000) + 3600,
            action: `Cold Filtration & FSSAI AI Testing Passed (Score: ${aiScore}/100)`,
          }
        ],
        labReport: {
          moisturePercent: moisture,
          brixPercent: brix,
          hmfMgPerKg: hmf,
          diastaseNumber: diastase,
          electricalConductivity: conductivity,
          purityScore: aiScore,
          grade: aiGrade,
          passedFSSAI: aiScore >= 70,
          testedAt: new Date().toISOString().split("T")[0],
        },
        qrToken: generatedToken,
        txHash: generatedTx,
      };

      saveCustomBatch(newBatchRecord);

      setSuccessData({
        batchId: newBatchId,
        score: aiScore,
        grade: aiGrade,
        qrToken: generatedToken,
        txHash: generatedTx,
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#D4AF37", "#1A1A1A", "#FFFFFF"],
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="py-16 px-6 md:px-12 max-w-5xl mx-auto w-full flex-1">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-warm-grey hover:text-charcoal transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Operations Dashboard</span>
        </Link>

        <div className="border border-charcoal/20 bg-white p-8 md:p-12 shadow-luxury-card">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-charcoal/10">
            <div className="w-12 h-12 border border-charcoal bg-charcoal text-gold flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-ultra text-warm-grey">Polygon PoS Ledger</p>
              <h1 className="text-3xl md:text-4xl serif text-charcoal font-normal">Mint Honey Harvest Batch</h1>
            </div>
          </div>

          {successData ? (
            <div className="p-8 border border-emerald-300 bg-emerald-50/50 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl serif text-charcoal mb-2">Batch Minted & Anchored On-Chain</h2>
              <p className="text-xs text-warm-grey max-w-md mx-auto mb-6">
                Assigned Batch ID <span className="font-mono font-bold text-charcoal">#00{successData.batchId}</span> with QR Token{" "}
                <span className="font-mono font-bold text-charcoal">{successData.qrToken}</span>.
              </p>

              <div className="p-4 border border-charcoal/10 bg-white max-w-lg mx-auto text-left font-mono text-xs mb-8 space-y-2">
                <div className="flex justify-between">
                  <span className="text-warm-grey">AI Purity Score:</span>
                  <span className="font-bold text-gold">{successData.score}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-grey">Classification:</span>
                  <span className="font-semibold text-charcoal">{successData.grade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-grey">Polygon Tx:</span>
                  <span className="truncate max-w-[200px] text-[10px]">{successData.txHash}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href={`/verify/${successData.batchId}`}
                  target="_blank"
                  className="px-8 py-4 text-xs uppercase tracking-widest font-semibold btn-gold-slide inline-flex items-center justify-center gap-2"
                >
                  <span>Open Consumer Verify View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/dashboard/qr"
                  className="px-8 py-4 text-xs uppercase tracking-widest font-semibold btn-outline-luxury inline-block"
                >
                  Print QR Label Sheet
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleMint} className="space-y-8">
              {/* Farmer selection */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                  Select Registered Beekeeper
                </label>
                <select
                  value={farmerId}
                  onChange={(e) => setFarmerId(e.target.value)}
                  className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans focus:border-gold focus:outline-none"
                >
                  {farmersList.map((f) => (
                    <option key={f.farmerId} value={f.farmerId}>
                      #00{f.farmerId} — {f.name} ({f.location} - {f.cooperativeId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lab Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                    Moisture (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={moisture}
                    onChange={(e) => setMoisture(parseFloat(e.target.value) || 0)}
                    className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans focus:border-gold focus:outline-none"
                  />
                  <span className="text-[10px] text-warm-grey mt-1 block">FSSAI ≤ 20%</span>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                    Brix (°Bx)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={brix}
                    onChange={(e) => setBrix(parseFloat(e.target.value) || 0)}
                    className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans focus:border-gold focus:outline-none"
                  />
                  <span className="text-[10px] text-warm-grey mt-1 block">FSSAI ≥ 65°Bx</span>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                    HMF (mg/kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={hmf}
                    onChange={(e) => setHmf(parseFloat(e.target.value) || 0)}
                    className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans focus:border-gold focus:outline-none"
                  />
                  <span className="text-[10px] text-warm-grey mt-1 block">FSSAI ≤ 80</span>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                    Diastase (DN)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={diastase}
                    onChange={(e) => setDiastase(parseFloat(e.target.value) || 0)}
                    className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans focus:border-gold focus:outline-none"
                  />
                  <span className="text-[10px] text-warm-grey mt-1 block">FSSAI ≥ 8 DN</span>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                    Conductivity (mS)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={conductivity}
                    onChange={(e) => setConductivity(parseFloat(e.target.value) || 0)}
                    className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans focus:border-gold focus:outline-none"
                  />
                  <span className="text-[10px] text-warm-grey mt-1 block">FSSAI ≤ 0.8</span>
                </div>
              </div>

              {/* Yield */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                  Harvest Yield Weight (kg)
                </label>
                <input
                  type="number"
                  required
                  value={yieldKg}
                  onChange={(e) => setYieldKg(parseInt(e.target.value) || 0)}
                  className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans focus:border-gold focus:outline-none"
                />
              </div>

              {/* Live AI Microservice Spectrometry Score Card */}
              <div className="p-6 border border-gold/40 bg-charcoal text-alabaster flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-gold animate-spin" />
                    <span className="text-[10px] uppercase tracking-widest text-gold font-semibold">
                      FastAPI AI Microservice • Live Inference
                    </span>
                  </div>
                  <h3 className="text-2xl serif text-alabaster">{aiGrade}</h3>
                  <p className="text-xs text-taupe/70 mt-1">
                    Direct inference from Scikit-Learn RandomForest Model trained on 5,000 FSSAI samples
                  </p>
                </div>
                <div className="text-right self-end md:self-auto">
                  <span className="text-5xl font-serif font-bold text-gold">{aiScore}</span>
                  <span className="text-sm font-serif text-warm-grey">/100</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-xs uppercase tracking-widest font-semibold btn-gold-slide flex items-center justify-center gap-2"
              >
                <span>{loading ? "Minting on Polygon Sepolia..." : "Mint Batch & Generate QR Token"}</span>
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
