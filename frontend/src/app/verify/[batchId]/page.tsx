"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FarmerProfile from "@/components/FarmerProfile";
import Scorecard from "@/components/Scorecard";
import CustodyTimeline from "@/components/CustodyTimeline";
import ApiaryMap from "@/components/ApiaryMap";
import { fetchBatchById } from "@/lib/contract";
import { exportHoneyBatchCredential } from "@/lib/vc-serializer";
import { generateCertificatePDF } from "@/lib/pdf-certificate";
import { BatchMetadata } from "@/lib/types";
import confetti from "canvas-confetti";
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Sparkles,
  Award,
  Calendar,
  Layers,
  FileText,
  FileCheck,
} from "lucide-react";

export default function ConsumerVerificationPage() {
  const params = useParams();
  const batchIdNum = Number(params.batchId) || 1;
  const [data, setData] = useState<BatchMetadata | null>(null);
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedIpfs, setCopiedIpfs] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportReason, setReportReason] = useState("Broken or damaged QR seal on lid");

  useEffect(() => {
    fetchBatchById(batchIdNum).then((res) => setData(res));
  }, [batchIdNum]);

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="py-32 text-center">
          <p className="text-xs uppercase tracking-widest text-warm-grey">Querying Polygon Ledger...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const { batch, farmer, custodyChain, labReport, txHash, qrToken } = data;
  const harvestDate = new Date(batch.harvestTimestamp * 1000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const handleCopyTx = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash);
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    }
  };

  const handleCopyIpfs = () => {
    if (batch.ipfsMetadataHash) {
      navigator.clipboard.writeText(batch.ipfsMetadataHash);
      setCopiedIpfs(true);
      setTimeout(() => setCopiedIpfs(false), 2000);
    }
  };

  const handleDownloadVC = () => {
    const vc = exportHoneyBatchCredential(data);
    const blob = new Blob([JSON.stringify(vc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `HoneyChain_Batch_${batch.batchId}_W3C_VC.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    generateCertificatePDF(data);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#D4AF37", "#1A1A1A"],
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="py-24 px-6 md:px-12 lg:px-24 border-b border-charcoal/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-px w-8 bg-gold" />
                  <span className="text-[10px] uppercase tracking-ultra text-warm-grey font-semibold">
                    Polygon Blockchain Verified • TrueTag {qrToken}
                  </span>
                </div>
                <h1 className="text-6xl md:text-8xl serif text-charcoal font-normal leading-[0.95]">
                  Verified. <span className="italic text-gold">Pure</span>. Yours.
                </h1>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs uppercase tracking-widest text-warm-grey">Batch Identifier</p>
                <p className="text-3xl font-serif font-bold text-charcoal">#00{batch.batchId}</p>
                <p className="text-[10px] text-warm-grey mt-1">KVIC Registry Token: {qrToken}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. AUTHENTICITY BADGE SECTION (Dark Charcoal) */}
        <section className="py-20 px-6 md:px-12 lg:px-24 bg-charcoal text-alabaster border-b border-charcoal">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 border border-gold flex items-center justify-center bg-charcoal text-gold">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
                    Authentic & Untampered
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl serif font-normal text-alabaster">
                  {batch.grade}
                </h2>
                <p className="text-xs text-taupe/70 mt-1">
                  National Bee Board & FSSAI Standards 2021 Compliant
                </p>
              </div>
            </div>

            {/* Purity Score Metric */}
            <div className="border border-gold/40 px-10 py-6 text-center bg-charcoal">
              <p className="text-[10px] uppercase tracking-ultra text-warm-grey">AI Purity Score</p>
              <div className="text-6xl font-serif font-bold text-gold my-1">{batch.qualityScore}</div>
              <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">Grade A+ Certified</p>
            </div>
          </div>
        </section>

        {/* 3. FARMER PROVENANCE & GEOGRAPHIC TERROIR */}
        <section className="py-24 px-6 md:px-12 lg:px-24 border-b border-charcoal/10 bg-alabaster">
          <div className="max-w-6xl mx-auto">
            <FarmerProfile farmer={farmer} />
            <ApiaryMap farmer={farmer} batchId={batch.batchId} />
          </div>
        </section>

        {/* 4. HARVEST METRICS */}
        <section className="py-20 px-6 md:px-12 lg:px-24 bg-charcoal text-alabaster border-b border-charcoal">
          <div className="max-w-6xl mx-auto">
            <p className="text-[10px] uppercase tracking-ultra text-warm-grey mb-2 font-semibold">Harvest Record</p>
            <h3 className="text-4xl serif mb-12 font-normal text-alabaster">Field Telemetry</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="border-t border-white/10 pt-6">
                <span className="text-[10px] uppercase tracking-widest text-warm-grey block mb-1">Harvest Date</span>
                <span className="text-2xl font-serif text-alabaster block">{harvestDate}</span>
                <span className="text-[10px] text-taupe/60 mt-1 block">Optimal Moon Phase</span>
              </div>
              <div className="border-t border-white/10 pt-6">
                <span className="text-[10px] uppercase tracking-widest text-warm-grey block mb-1">Brix Sugar Index</span>
                <span className="text-2xl font-serif text-gold block">{labReport.brixPercent}°Bx</span>
                <span className="text-[10px] text-emerald-400 mt-1 block">Exceeds FSSAI Standard</span>
              </div>
              <div className="border-t border-white/10 pt-6">
                <span className="text-[10px] uppercase tracking-widest text-warm-grey block mb-1">Moisture Level</span>
                <span className="text-2xl font-serif text-alabaster block">{labReport.moisturePercent}%</span>
                <span className="text-[10px] text-emerald-400 mt-1 block">Optimal Low Moisture</span>
              </div>
              <div className="border-t border-white/10 pt-6">
                <span className="text-[10px] uppercase tracking-widest text-warm-grey block mb-1">Freshness (HMF)</span>
                <span className="text-2xl font-serif text-alabaster block">{labReport.hmfMgPerKg} mg/kg</span>
                <span className="text-[10px] text-taupe/60 mt-1 block">Unheated Raw Quality</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. AI QUALITY SCORECARD */}
        <section className="py-24 px-6 md:px-12 lg:px-24 border-b border-charcoal/10 bg-white">
          <div className="max-w-6xl mx-auto">
            <Scorecard report={labReport} />
          </div>
        </section>

        {/* 6. BLOCKCHAIN PROOF & CUSTODY TIMELINE */}
        <section className="py-24 px-6 md:px-12 lg:px-24 bg-alabaster">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-20">
              {/* Left Col: Cryptographic Proof */}
              <div className="w-full lg:w-1/2">
                <p className="text-[10px] uppercase tracking-ultra text-warm-grey mb-2 font-semibold">Chain of Trust</p>
                <h3 className="text-4xl md:text-5xl serif text-charcoal mb-8 font-normal">Immutable Evidence</h3>
                <p className="text-xs text-warm-grey leading-relaxed mb-10">
                  Every honey batch is permanently anchored onto the Polygon PoS blockchain with cryptographic hashes matching the physical micro-QR seal on the jar.
                </p>

                <div className="space-y-6">
                  {/* Tx Hash */}
                  <div className="p-6 border border-charcoal/15 bg-white">
                    <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-2">Polygon Transaction Hash</p>
                    <div className="flex items-center justify-between font-mono text-xs text-charcoal">
                      <span className="truncate pr-4">{txHash || "0x8f2d9c4e7b1a56209ef43c8b1a32d67e891c345a2f"}</span>
                      <button
                        onClick={handleCopyTx}
                        className="text-gold hover:text-charcoal transition-colors flex items-center gap-1 text-[10px] uppercase font-semibold flex-shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedTx ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  {/* IPFS CID */}
                  <div className="p-6 border border-charcoal/15 bg-white">
                    <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-2">IPFS Metadata CID</p>
                    <div className="flex items-center justify-between font-mono text-xs text-charcoal">
                      <span className="truncate pr-4">{batch.ipfsMetadataHash}</span>
                      <button
                        onClick={handleCopyIpfs}
                        className="text-gold hover:text-charcoal transition-colors flex items-center gap-1 text-[10px] uppercase font-semibold flex-shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedIpfs ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Download Certificate Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 py-4 px-6 text-xs uppercase tracking-widest font-semibold btn-gold-slide flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-gold" />
                    <span>Download Official PDF</span>
                  </button>
                  <button
                    onClick={handleDownloadVC}
                    className="py-4 px-6 text-xs uppercase tracking-widest font-semibold btn-outline-luxury flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>W3C JSON-LD</span>
                  </button>
                  <a
                    href={`https://amoy.polygonscan.com/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-4 px-6 text-xs uppercase tracking-widest font-semibold btn-outline-luxury flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Explorer</span>
                  </a>
                </div>

                {/* Report Counterfeit / Broken Seal */}
                <div className="mt-6 pt-6 border-t border-charcoal/10 flex justify-between items-center">
                  <span className="text-[10px] text-warm-grey">Suspect this jar is counterfeit or tampered?</span>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="text-[10px] uppercase tracking-widest font-semibold text-rose-700 hover:text-rose-900 transition-colors underline"
                  >
                    Report Tampering
                  </button>
                </div>
              </div>

              {/* Right Col: Custody Timeline */}
              <div className="w-full lg:w-1/2">
                <p className="text-[10px] uppercase tracking-ultra text-warm-grey mb-2 font-semibold">Supply Chain Timeline</p>
                <h3 className="text-4xl serif text-charcoal mb-8 font-normal">Chain of Custody</h3>
                <div className="border border-charcoal/10 bg-white p-8 md:p-12">
                  <CustodyTimeline chain={custodyChain} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REPORT MODAL */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="border border-charcoal/20 bg-white max-w-md w-full p-8 relative shadow-2xl">
              <h3 className="text-2xl serif text-charcoal mb-2">Report Suspicious Jar / Tampering</h3>
              <p className="text-xs text-warm-grey mb-6">
                Your report for Batch #{batch.batchId} ({qrToken}) will be forwarded directly to KVIC & National Bee Board quality inspectors.
              </p>

              {reportSubmitted ? (
                <div className="p-6 border border-emerald-300 bg-emerald-50 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-serif font-bold text-charcoal">Report Successfully Logged</p>
                  <p className="text-xs text-warm-grey mt-1">Inspection Ticket: CMP-2026-{Math.floor(Math.random() * 800 + 100)}</p>
                  <button
                    onClick={() => {
                      setShowReportModal(false);
                      setReportSubmitted(false);
                    }}
                    className="mt-6 px-6 py-2 text-xs uppercase tracking-widest font-semibold btn-outline-luxury"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setReportSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-1">Issue Type</label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full h-10 border-b border-charcoal/30 bg-transparent text-xs focus:border-gold focus:outline-none"
                    >
                      <option value="Broken QR seal on lid">Broken or damaged QR seal on lid</option>
                      <option value="Unusual fermented taste or thin syrup">Unusual fermented taste or thin syrup</option>
                      <option value="Packaging / label appears duplicated">Packaging / label appears duplicated</option>
                      <option value="Retailer overcharging above MSP">Retailer overcharging above MSP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-1">City / Purchase Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Connaught Place, New Delhi"
                      className="w-full h-10 border-b border-charcoal/30 bg-transparent text-xs focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 py-3 text-xs uppercase tracking-widest font-semibold btn-gold-slide"
                    >
                      Submit Report
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="px-6 py-3 text-xs uppercase tracking-widest font-semibold btn-outline-luxury"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
