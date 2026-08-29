"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { QRCodeSVG } from "qrcode.react";
import { DEMO_BATCHES } from "@/lib/constants";
import { fetchBatchesFromDB } from "@/lib/registry";
import { BatchMetadata } from "@/lib/types";
import HoneyChainLogo from "@/components/HoneyChainLogo";
import {
  QrCode,
  ArrowLeft,
  Printer,
  Download,
  Sparkles,
  ShieldCheck,
  Radio,
  Layers,
  Copy,
  CheckCircle2,
  Lock,
  Tag,
  Boxes,
} from "lucide-react";

type LabelFormat = "LID_SEAL_35MM" | "FRONT_LABEL_50X70MM" | "DRUM_TAG_100X150MM";

export default function QrLabelsPage() {
  const [batches, setBatches] = useState<BatchMetadata[]>(DEMO_BATCHES);
  const [selectedBatchId, setSelectedBatchId] = useState(1);
  const [selectedFormat, setSelectedFormat] = useState<LabelFormat>("LID_SEAL_35MM");
  const [sheetCount, setSheetCount] = useState(6);
  const [includeGuilloche, setIncludeGuilloche] = useState(true);
  const [nfcSimulatedCount, setNfcSimulatedCount] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchBatchesFromDB().then((list) => {
      setBatches(list);
      if (list.length > 0) setSelectedBatchId(list[0].batchId);
    });
  }, []);

  const selectedBatch = batches.find((b) => b.batchId === selectedBatchId) || batches[0];
  const originDomain = typeof window !== "undefined" ? window.location.origin : "https://honeychain-truetag.vercel.app";
  const verifyUrl = `${originDomain}/verify/${selectedBatch.batchId}?qr=${selectedBatch.qrToken}`;

  // Simulated Dynamic NTAG 424 DNA Cryptographic CMAC Tag URI
  const nfcDynamicUri = `${originDomain}/verify/${selectedBatch.batchId}?nfc_tag=${selectedBatch.qrToken}&cmac=${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}&ctr=${nfcSimulatedCount}`;

  const handlePrint = () => {
    window.print();
  };

  const handleSimulateNfcTap = () => {
    setNfcSimulatedCount((prev) => prev + 1);
  };

  const handleCopyVerifyUrl = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F9F8F6]">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="py-8 sm:py-16 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full flex-1">
        {/* Top Breadcrumb & Controls (Hidden in Print) */}
        <div className="print:hidden">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-warm-grey hover:text-charcoal transition-colors mb-6 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Operations Dashboard</span>
          </Link>

          <div className="border-2 border-charcoal/15 bg-white p-6 sm:p-8 mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-gold" />
                <p className="text-[10px] uppercase tracking-ultra text-warm-grey font-bold">
                  Physical Cryptographic Security Studio
                </p>
              </div>
              <h1 className="text-3xl serif text-charcoal font-normal">
                TrueTag™ Cryptographic Label & Packaging Generator
              </h1>
              <p className="text-xs text-warm-grey mt-1 max-w-2xl">
                Generate tamper-evident micro-QR seals, anti-counterfeit guilloche waveforms, and dynamic NFC tags for honey jars and bulk transport drums.
              </p>
            </div>

            {/* Batch Selector */}
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label htmlFor="qr-batch-select" className="block text-[9px] uppercase tracking-widest text-warm-grey font-bold mb-1">
                  Active Batch
                </label>
                <select
                  id="qr-batch-select"
                  name="selectedBatchId"
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(Number(e.target.value))}
                  className="h-11 border-2 border-charcoal/30 bg-white px-3 text-xs font-bold text-charcoal focus:border-gold focus:outline-none"
                >
                  {batches.map((b) => (
                    <option key={b.batchId} value={b.batchId}>
                      Batch #{b.batchId} — {b.farmer.name} ({b.qrToken})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2 pt-4">
                <button
                  onClick={handlePrint}
                  className="h-11 px-5 bg-charcoal text-alabaster text-xs uppercase tracking-widest font-bold btn-gold-slide flex items-center gap-2 shadow-sm"
                >
                  <Printer className="w-4 h-4 text-gold" />
                  <span>Print Sticker Sheet</span>
                </button>
              </div>
            </div>
          </div>

          {/* Packaging Format Tabs & Security Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => setSelectedFormat("LID_SEAL_35MM")}
              className={`p-4 border-2 text-left transition-all ${
                selectedFormat === "LID_SEAL_35MM"
                  ? "border-charcoal bg-charcoal text-alabaster shadow-md"
                  : "border-charcoal/15 bg-white text-charcoal hover:border-gold"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase font-bold text-gold">Format 01</span>
                <ShieldCheck className="w-4 h-4 text-gold" />
              </div>
              <h4 className="text-base serif font-bold">Jar Lid Tamper Seal (35mm)</h4>
              <p className={`text-xs mt-1 ${selectedFormat === "LID_SEAL_35MM" ? "text-taupe" : "text-warm-grey"}`}>
                Breakable circular lid strap with micro-QR & hologram slit.
              </p>
            </button>

            <button
              onClick={() => setSelectedFormat("FRONT_LABEL_50X70MM")}
              className={`p-4 border-2 text-left transition-all ${
                selectedFormat === "FRONT_LABEL_50X70MM"
                  ? "border-charcoal bg-charcoal text-alabaster shadow-md"
                  : "border-charcoal/15 bg-white text-charcoal hover:border-gold"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase font-bold text-gold">Format 02</span>
                <Tag className="w-4 h-4 text-gold" />
              </div>
              <h4 className="text-base serif font-bold">Front Jar Luxury Label (50×70mm)</h4>
              <p className={`text-xs mt-1 ${selectedFormat === "FRONT_LABEL_50X70MM" ? "text-taupe" : "text-warm-grey"}`}>
                Editorial gold frame, FSSAI mark, origin floral nectar & QR.
              </p>
            </button>

            <button
              onClick={() => setSelectedFormat("DRUM_TAG_100X150MM")}
              className={`p-4 border-2 text-left transition-all ${
                selectedFormat === "DRUM_TAG_100X150MM"
                  ? "border-charcoal bg-charcoal text-alabaster shadow-md"
                  : "border-charcoal/15 bg-white text-charcoal hover:border-gold"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase font-bold text-gold">Format 03</span>
                <Boxes className="w-4 h-4 text-gold" />
              </div>
              <h4 className="text-base serif font-bold">Bulk Logistics Drum Tag (100×150mm)</h4>
              <p className={`text-xs mt-1 ${selectedFormat === "DRUM_TAG_100X150MM" ? "text-taupe" : "text-warm-grey"}`}>
                High-density 250kg harvest barrel tag with custody barcode.
              </p>
            </button>
          </div>

          {/* Security Customization Toolbar */}
          <div className="p-4 border border-charcoal/15 bg-white mb-8 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-6">
              <label htmlFor="qr-guilloche" className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="qr-guilloche"
                  name="includeGuilloche"
                  type="checkbox"
                  checked={includeGuilloche}
                  onChange={(e) => setIncludeGuilloche(e.target.checked)}
                  className="w-4 h-4 accent-charcoal rounded-none"
                />
                <span className="font-semibold text-charcoal">Anti-Counterfeit Guilloche Wave Background</span>
              </label>

              <div className="flex items-center gap-2">
                <label htmlFor="qr-sheet-count" className="text-warm-grey font-medium">Stickers per Sheet:</label>
                <select
                  id="qr-sheet-count"
                  name="sheetCount"
                  value={sheetCount}
                  onChange={(e) => setSheetCount(Number(e.target.value))}
                  className="border border-charcoal/30 bg-transparent px-2 py-1 font-bold text-charcoal"
                >
                  <option value={1}>1 (Single Master Label)</option>
                  <option value={4}>4 (2×2 Grid)</option>
                  <option value={6}>6 (2×3 Grid)</option>
                  <option value={9}>9 (3×3 Grid)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyVerifyUrl}
                className="px-3 py-1.5 border border-charcoal/20 hover:border-gold transition-colors flex items-center gap-1.5 font-mono text-[11px]"
              >
                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-warm-grey" />}
                <span>{copiedLink ? "Copied URL" : "Copy Verification URL"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── PHYSICAL PRINTABLE LABEL CANVAS ─────────────────────────────── */}
        <div className="bg-white border-2 border-charcoal/20 p-8 sm:p-12 shadow-md">
          {/* Format 1: 35mm Circular Jar Lid Tamper Seal */}
          {selectedFormat === "LID_SEAL_35MM" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
              {Array.from({ length: sheetCount }).map((_, i) => (
                <div
                  key={i}
                  className="w-64 h-64 rounded-full border-4 border-charcoal bg-[#F9F8F6] relative overflow-hidden flex flex-col items-center justify-between p-4 shadow-sm group hover:border-gold transition-colors"
                >
                  {/* Guilloche Security Background */}
                  {includeGuilloche && (
                    <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="1 1" />
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#141414" strokeWidth="0.5" strokeDasharray="2 1" />
                      <circle cx="50" cy="50" r="30" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
                    </svg>
                  )}

                  {/* Tamper Perforation Line Indicator */}
                  <div className="absolute top-1/2 left-0 right-0 h-px border-t border-dashed border-rose-400 opacity-60 pointer-events-none" />

                  {/* Top Seal Header */}
                  <div className="text-center z-10">
                    <span className="text-[7.5px] uppercase tracking-ultra text-charcoal font-bold block">
                      ★ KVIC • NATIONAL BEE BOARD ★
                    </span>
                    <span className="text-[7px] font-mono text-gold font-bold block">
                      TRUETAG™ TAMPER-EVIDENT SEAL
                    </span>
                  </div>

                  {/* Center QR Code with Gold Border */}
                  <div className="p-2 border-2 border-charcoal bg-white z-10 shadow-xs">
                    <QRCodeSVG
                      value={verifyUrl}
                      size={108}
                      level="H"
                      includeMargin={false}
                      imageSettings={{
                        src: "/honeychain_app_icon.jpg",
                        height: 22,
                        width: 22,
                        excavate: true,
                      }}
                    />
                  </div>

                  {/* Bottom Verification Details */}
                  <div className="text-center z-10">
                    <span className="text-[9px] font-mono font-bold text-charcoal block">
                      {selectedBatch.qrToken}
                    </span>
                    <span className="text-[7px] uppercase tracking-widest text-warm-grey block">
                      Purity: {selectedBatch.batch.qualityScore}/100 • Scan To Verify
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Format 2: Front Jar Luxury Label (50x70mm) */}
          {selectedFormat === "FRONT_LABEL_50X70MM" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
              {Array.from({ length: sheetCount }).map((_, i) => (
                <div
                  key={i}
                  className="w-64 h-96 border-4 border-charcoal bg-[#FDFCF7] p-5 flex flex-col justify-between relative overflow-hidden shadow-sm"
                >
                  {/* Outer Gold Border Trim */}
                  <div className="absolute inset-1.5 border border-gold/60 pointer-events-none" />

                  {/* Security Watermark in Label Background */}
                  <div className="absolute right-[-20px] bottom-8 w-44 h-44 opacity-[0.08] pointer-events-none select-none mix-blend-multiply">
                    <img src="/honeychain_logo_badge.jpg" alt="" className="w-full h-full object-contain" />
                  </div>

                  {/* Top Brand Header */}
                  <div className="text-center z-10 border-b border-charcoal/15 pb-2 flex flex-col items-center">
                    <span className="text-[8px] uppercase tracking-ultra text-warm-grey font-bold block mb-1">
                      Govt. of India • Ministry of MSME
                    </span>
                    <HoneyChainLogo size="sm" variant="icon" />
                    <h3 className="text-lg serif font-bold text-charcoal tracking-wide mt-1">
                      Honey<span className="text-gold">Chain</span>
                    </h3>
                    <p className="text-[8px] font-serif italic text-warm-grey">
                      100% Certified Organic Raw Nectar
                    </p>
                  </div>

                  {/* Center QR & Purity Badge */}
                  <div className="flex items-center justify-between gap-3 z-10 my-2">
                    <div className="p-2 border border-charcoal bg-white shrink-0">
                      <QRCodeSVG
                        value={verifyUrl}
                        size={88}
                        level="H"
                        imageSettings={{
                          src: "/honeychain_app_icon.jpg",
                          height: 18,
                          width: 18,
                          excavate: true,
                        }}
                      />
                    </div>
                    <div className="text-left text-xs font-mono">
                      <div className="p-1.5 bg-gold/15 border border-gold text-center mb-1.5">
                        <span className="text-[8px] uppercase tracking-widest text-charcoal font-bold block">Purity</span>
                        <span className="text-base font-serif font-bold text-charcoal">{selectedBatch.batch.qualityScore}/100</span>
                      </div>
                      <p className="text-[8px] text-warm-grey font-sans">
                        <strong>FSSAI IS 4941</strong>
                      </p>
                      <p className="text-[8px] text-warm-grey font-sans">
                        Polygon PoS Tokenized
                      </p>
                    </div>
                  </div>

                  {/* Origin & Beekeeper */}
                  <div className="z-10 border-t border-charcoal/15 pt-2.5 text-[9px]">
                    <div className="flex justify-between font-mono font-bold text-charcoal">
                      <span>Batch #{selectedBatch.batchId}</span>
                      <span>{selectedBatch.qrToken}</span>
                    </div>
                    <p className="text-warm-grey truncate mt-0.5">
                      Beekeeper: <strong className="text-charcoal">{selectedBatch.farmer.name}</strong>
                    </p>
                    <p className="text-warm-grey truncate">
                      Origin: {selectedBatch.farmer.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Format 3: Bulk Transport Drum Tag (100x150mm) */}
          {selectedFormat === "DRUM_TAG_100X150MM" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
              {Array.from({ length: Math.min(sheetCount, 2) }).map((_, i) => (
                <div
                  key={i}
                  className="w-full max-w-md border-4 border-charcoal bg-[#141414] text-alabaster p-6 flex flex-col justify-between relative shadow-lg overflow-hidden"
                >
                  {/* Security Watermark in Drum Tag Background */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-56 h-56 opacity-[0.07] pointer-events-none select-none">
                    <img src="/honeychain_logo_badge.jpg" alt="" className="w-full h-full object-contain" />
                  </div>

                  <div className="flex justify-between items-start border-b border-white/20 pb-4 relative z-10">
                    <div>
                      <span className="text-[10px] uppercase tracking-ultra text-gold font-mono font-bold block">
                        KVIC HEAVY TRANSPORT DRUM TAG
                      </span>
                      <h3 className="text-2xl serif text-alabaster font-bold">
                        Batch #{selectedBatch.batchId} — 250 KG DRUM
                      </h3>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500 text-charcoal font-mono font-bold text-xs uppercase">
                      Pass Verified
                    </span>
                  </div>

                  <div className="flex items-center gap-6 my-6 relative z-10">
                    <div className="p-3 bg-white border border-white shrink-0">
                      <QRCodeSVG
                        value={verifyUrl}
                        size={110}
                        level="H"
                        imageSettings={{
                          src: "/honeychain_app_icon.jpg",
                          height: 24,
                          width: 24,
                          excavate: true,
                        }}
                      />
                    </div>
                    <div className="text-xs font-mono space-y-1.5">
                      <p className="text-warm-grey">TrueTag Token: <span className="text-alabaster font-bold">{selectedBatch.qrToken}</span></p>
                      <p className="text-warm-grey">Beekeeper: <span className="text-alabaster">{selectedBatch.farmer.name}</span></p>
                      <p className="text-warm-grey">Cooperative: <span className="text-alabaster">{selectedBatch.farmer.cooperativeId}</span></p>
                      <p className="text-warm-grey">Quality Score: <span className="text-gold font-bold">{selectedBatch.batch.qualityScore}/100</span></p>
                      <p className="text-[10px] text-emerald-400 font-sans mt-2">
                        ✓ Tamper Sensor ID: TT-SENS-8841-A
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-3 text-[10px] font-mono text-warm-grey flex justify-between relative z-10">
                    <span>Tamper Law: Section 16 FSSAI Act 2006</span>
                    <span>Chain: Polygon PoS (Amoy)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── DYNAMIC NFC (NTAG 424 DNA) CRYPTOGRAPHIC SIMULATOR ─────────── */}
        <div className="mt-12 p-6 sm:p-8 border-2 border-charcoal/15 bg-white shadow-sm print:hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-charcoal/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="text-[10px] uppercase tracking-ultra text-warm-grey font-bold">
                  Hardware Tamper Verification
                </span>
              </div>
              <h3 className="text-2xl serif text-charcoal font-normal">
                TrueTag™ Dynamic NFC (NTAG 424 DNA) Anti-Clone Engine
              </h3>
            </div>

            <button
              onClick={handleSimulateNfcTap}
              className="px-4 py-2 bg-charcoal text-alabaster text-xs uppercase tracking-widest font-bold btn-gold-slide flex items-center gap-2"
            >
              <Radio className="w-3.5 h-3.5 text-gold" />
              <span>Simulate Physical NFC Tap (Tap #{nfcSimulatedCount})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 text-xs font-mono">
            <div className="p-4 bg-[#F9F8F6] border border-charcoal/10">
              <span className="text-[10px] uppercase tracking-widest text-warm-grey font-bold block mb-1">
                Hardware Tap Counter
              </span>
              <span className="text-2xl font-bold text-charcoal">{nfcSimulatedCount}</span>
              <p className="text-[10px] text-emerald-700 mt-1 font-sans">
                Anti-replay monotonic counter incremented
              </p>
            </div>

            <div className="p-4 bg-[#F9F8F6] border border-charcoal/10 md:col-span-2">
              <span className="text-[10px] uppercase tracking-widest text-warm-grey font-bold block mb-1">
                Single-Use AES-128 CMAC Token Generated
              </span>
              <span className="text-[11px] text-charcoal break-all block">
                {nfcDynamicUri}
              </span>
              <p className="text-[10px] text-warm-grey mt-1 font-sans">
                Each phone tap mathematically produces a unique cryptographic signature preventing QR screenshot counterfeits.
              </p>
            </div>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
