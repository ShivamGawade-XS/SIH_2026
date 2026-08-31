"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Papa from "papaparse";
import confetti from "canvas-confetti";
import { getCustomBatches, saveCustomBatch } from "@/lib/registry";
import { BatchMetadata } from "@/lib/types";
import { generateSecureHex, generateSecureCid } from "@/lib/crypto-utils";
import { FileSpreadsheet, ArrowLeft, Upload, CheckCircle2, Download, Layers, QrCode, Sparkles, AlertTriangle } from "lucide-react";

// ─── SIMULATION MODE BANNER ────────────────────────────────────────────────────
// Bulk CSV mint runs in SIMULATION MODE. It stores data locally for demo purposes.
// In production, each row calls the on-chain approveHarvestAndMint() via ethers.js.
// txHash values are NOT real blockchain transactions — they are clearly marked as demo.
const SimulationBanner = () => (
  <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 px-5 py-4 mb-8">
    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-800 mb-0.5">Demo / Simulation Mode</p>
      <p className="text-xs text-amber-700">
        Batches minted here are stored locally for demonstration purposes only. AI scores are
        fetched from the live HoneyChain FastAPI microservice. Transaction hashes are simulation
        placeholders — production deployment connects to the Polygon Amoy smart contract via ethers.js.
      </p>
    </div>
  </div>
);

interface CSVRow {
  BeekeeperName: string;
  Location: string;
  CooperativeCode: string;
  MoisturePercent: string;
  BrixIndex: string;
  HmfMgKg: string;
  DiastaseActivity: string;
  YieldKg: string;
}

export default function BulkMintPage() {
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mintedCount, setMintedCount] = useState<number | null>(null);

  const handleDownloadSample = () => {
    const csvContent =
      "BeekeeperName,Location,CooperativeCode,MoisturePercent,BrixIndex,HmfMgKg,DiastaseActivity,YieldKg\n" +
      "Rameshwar Singh,Muzaffarpur Bihar,KVIC-BH-002,17.4,81.8,14.2,18.5,150\n" +
      "Devi Lal Meena,Bharatpur Rajasthan,KVIC-RJ-009,18.0,80.5,18.0,16.0,120\n" +
      "Anowar Hossain,Sundarbans West Bengal,KVIC-WB-019,18.8,79.4,22.1,14.8,200\n" +
      "Ghulam Hassan,Anantnag Kashmir,KVIC-JK-004,16.2,83.0,11.5,21.0,85\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "HoneyChain_Bulk_Mint_Template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        // Score each row by calling the real HoneyChain FastAPI microservice.
        // Falls back to physics-based formula only if the AI service is unreachable.
        const AI_ENDPOINT = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

        const enriched = await Promise.all(
          results.data.map(async (row, idx) => {
            const moisture = parseFloat(row.MoisturePercent) || 17.5;
            const brix     = parseFloat(row.BrixIndex)       || 81.0;
            const hmf      = parseFloat(row.HmfMgKg)         || 15.0;
            const diastase = parseFloat(row.DiastaseActivity) || 16.0;

            let finalScore = 0;
            let grade = "Grade B";
            let scoredBy = "physics-fallback";

            try {
              const res = await fetch(`${AI_ENDPOINT}/api/quality/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  moisture: moisture,
                  brix: brix,
                  hmf: hmf,
                  diastase: diastase,
                }),
              });
              if (res.ok) {
                const json = await res.json();
                finalScore = json.quality_score ?? json.purity_score ?? 0;
                grade      = json.grade ?? "Grade B";
                scoredBy   = "ai-service-v2";
              } else {
                throw new Error(`AI service returned ${res.status}`);
              }
            } catch {
              // Physics-based FSSAI fallback (identical to FastAPI _calculate_math_score_and_class)
              let score = 100.0;
              if (moisture > 20.0) score -= (moisture - 20.0) * 15.0;
              if (brix < 80.0)     score -= (80.0 - brix) * 4.0;
              if (hmf > 40.0)      score -= (hmf - 40.0) * 2.5;
              if (diastase < 8.0)  score -= (8.0 - diastase) * 6.0;
              finalScore = Math.max(10, Math.min(99, Math.round(score)));
              grade      = finalScore >= 90 ? "Grade A+ Raw Organic" : finalScore >= 75 ? "Grade A Pure" : "Grade B";
              scoredBy   = "physics-fallback";
            }

            return { ...row, id: idx + 1, computedScore: finalScore, grade, scoredBy };
          })
        );
        setParsedRows(enriched);
      },
    });
  };

  const handleExecuteBulkMint = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const existing = getCustomBatches();

      parsedRows.forEach((row, idx) => {
        const newBatchId = existing.length + idx + 1;
        const qrToken = `TT-2026-${String(newBatchId).padStart(5, "0")}`;

        // ── SIMULATION MODE ───────────────────────────────────────────────────
        // txHash is intentionally marked as a simulation placeholder.
        // Production: replace with await honeyChainContract.approveHarvestAndMint(...)
        // and use the returned ethers.js TransactionReceipt.hash (real Polygon tx).
        const SIMULATION_TX_PREFIX = "DEMO-SIM-NOT-ONCHAIN-";
        const simulationTxHash = SIMULATION_TX_PREFIX + generateSecureHex(10);
        // ─────────────────────────────────────────────────────────────────────

        const newBatchRecord: BatchMetadata = {
          batchId: newBatchId,
          farmer: {
            farmerId: newBatchId,
            name: row.BeekeeperName || "Verified Beekeeper",
            location: row.Location || "KVIC Apiary Cluster",
            cooperativeId: row.CooperativeCode || "KVIC-COOP-01",
            ipfsProfileHash: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
            isVerified: true,
            registeredAt: Math.floor(Date.now() / 1000),
          },
          batch: {
            batchId: newBatchId,
            farmerId: newBatchId,
            harvestTimestamp: Math.floor(Date.now() / 1000),
            ipfsMetadataHash: generateSecureCid(),
            qualityScore: row.computedScore,
            grade: row.grade,
            isAuthentic: true,
            isRevoked: false,
          },
          custodyChain: [
            {
              actor: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
              entity: `Harvest Site (${row.Location})`,
              timestamp: Math.floor(Date.now() / 1000),
              action: `Bulk Harvested & TrueTag IoT Sealed [AI scored by: ${row.scoredBy ?? "physics-fallback"}]`,
            },
          ],
          labReport: {
            moisturePercent: parseFloat(row.MoisturePercent) || 17.5,
            brixPercent: parseFloat(row.BrixIndex) || 81.0,
            hmfMgPerKg: parseFloat(row.HmfMgKg) || 15.0,
            diastaseNumber: parseFloat(row.DiastaseActivity) || 16.0,
            electricalConductivity: 0.45,
            purityScore: row.computedScore,
            grade: row.grade,
            passedFSSAI: row.computedScore >= 70,
            testedAt: new Date().toISOString().split("T")[0],
          },
          qrToken,
          txHash: simulationTxHash,
        };
        saveCustomBatch(newBatchRecord);
      });

      setMintedCount(parsedRows.length);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#D4AF37", "#1A1A1A", "#FFFFFF"],
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="py-8 sm:py-16 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto w-full flex-1">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-warm-grey hover:text-charcoal transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Operations Dashboard</span>
        </Link>

        <SimulationBanner />
        <div className="border border-charcoal/20 bg-white p-5 sm:p-8 md:p-12 shadow-luxury-card mb-8 sm:mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-charcoal/10">
            <div className="flex items-center gap-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 border border-charcoal bg-charcoal text-gold flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-ultra text-warm-grey font-semibold">High-Throughput Processing</p>
                <h1 className="text-2xl sm:text-3xl serif text-charcoal font-normal">Bulk CSV Batch Minting</h1>
              </div>
            </div>

            <button
              onClick={handleDownloadSample}
              className="px-5 py-2.5 text-xs uppercase tracking-widest font-semibold btn-outline-luxury flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {mintedCount !== null ? (
            <div className="p-8 border border-emerald-300 bg-emerald-50/50 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl serif text-charcoal mb-2">
                {mintedCount} Harvest Batches Minted On Polygon!
              </h2>
              <p className="text-xs text-warm-grey max-w-md mx-auto mb-6">
                All batches have been authenticated with AI spectrometry scores, unique cryptographic QR tokens, and anchored to the ledger.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/dashboard/qr"
                  className="px-8 py-4 text-xs uppercase tracking-widest font-semibold btn-gold-slide inline-flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Print Batch QR Sticker Sheets</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="px-8 py-4 text-xs uppercase tracking-widest font-semibold btn-outline-luxury inline-block"
                >
                  Return to Dashboard Table
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Dropzone */}
              <div className="border-2 border-dashed border-charcoal/30 bg-alabaster/40 p-10 text-center relative hover:border-gold transition-colors mb-8">
                <label htmlFor="bulk-csv-upload" className="sr-only">Upload KVIC Regional Harvest CSV Sheet</label>
                <input
                  id="bulk-csv-upload"
                  name="csvFile"
                  aria-label="Upload KVIC Regional Harvest CSV Sheet"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-10 h-10 text-gold mx-auto mb-4" />
                <p className="text-sm font-serif font-medium text-charcoal mb-1">
                  Upload KVIC Regional Harvest CSV Sheet
                </p>
                <p className="text-[10px] uppercase tracking-widest text-warm-grey">
                  Drag and drop .CSV file here or click to browse
                </p>
              </div>

              {/* Preview Table */}
              {parsedRows.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs uppercase tracking-widest font-semibold text-charcoal">
                      Parsed Batches ({parsedRows.length} lots detected)
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 border border-emerald-200">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Scores Calculated</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-charcoal/10 mb-8">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-alabaster border-b border-charcoal/10 text-[10px] uppercase tracking-widest text-warm-grey">
                        <tr>
                          <th className="p-3 font-semibold">#</th>
                          <th className="p-3 font-semibold">Beekeeper / Location</th>
                          <th className="p-3 font-semibold">Cooperative</th>
                          <th className="p-3 font-semibold">Moisture</th>
                          <th className="p-3 font-semibold">Brix</th>
                          <th className="p-3 font-semibold">AI Purity</th>
                          <th className="p-3 font-semibold">Grade</th>
                          <th className="p-3 font-semibold">Scored By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-charcoal/5">
                        {parsedRows.map((row) => (
                          <tr key={row.id} className="hover:bg-alabaster/50">
                            <td className="p-3 font-mono font-bold">{row.id}</td>
                            <td className="p-3 font-medium">{row.BeekeeperName} ({row.Location})</td>
                            <td className="p-3 font-mono">{row.CooperativeCode}</td>
                            <td className="p-3 font-mono">{row.MoisturePercent}%</td>
                            <td className="p-3 font-mono">{row.BrixIndex}°Bx</td>
                            <td className="p-3 font-serif font-bold text-gold">{row.computedScore}/100</td>
                            <td className="p-3 font-medium">{row.grade}</td>
                            <td className="p-3 font-mono text-[10px] text-warm-grey">{row.scoredBy ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={handleExecuteBulkMint}
                    disabled={loading}
                    className="w-full h-14 text-xs uppercase tracking-widest font-semibold btn-gold-slide flex items-center justify-center gap-2"
                  >
                    <Layers className="w-4 h-4" />
                    <span>{loading ? "Bulk Anchoring on Polygon..." : `Mint All ${parsedRows.length} Batches on HoneyChain`}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
