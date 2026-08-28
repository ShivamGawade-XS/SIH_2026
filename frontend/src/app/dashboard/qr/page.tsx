"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { QRCodeSVG } from "qrcode.react";
import { DEMO_BATCHES } from "@/lib/constants";
import { getCustomBatches, fetchBatchesFromDB } from "@/lib/registry";
import { BatchMetadata } from "@/lib/types";
import { QrCode, ArrowLeft, Printer, Download, Sparkles, ShieldCheck } from "lucide-react";

export default function QrLabelsPage() {
  const [batches, setBatches] = useState<BatchMetadata[]>(DEMO_BATCHES);
  const [selectedBatchId, setSelectedBatchId] = useState(1);
  const [labelCount, setLabelCount] = useState(6);

  useEffect(() => {
    fetchBatchesFromDB().then((list) => {
      setBatches(list);
      if (list.length > 0) setSelectedBatchId(list[0].batchId);
    });
  }, []);

  const selectedBatch = batches.find((b) => b.batchId === selectedBatchId) || batches[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="py-16 px-6 md:px-12 max-w-6xl mx-auto w-full flex-1">
        <div className="print:hidden">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-warm-grey hover:text-charcoal transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Operations Dashboard</span>
          </Link>

          <div className="border border-charcoal/20 bg-white p-8 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-ultra text-warm-grey">Tamper-Evident Physical Security</p>
              <h1 className="text-3xl serif text-charcoal font-normal">Printable Honey Jar QR Labels</h1>
              <p className="text-xs text-warm-grey mt-1">
                Attach these cryptographic QR stickers onto the honey jar lids before dispatching from processing units.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(Number(e.target.value))}
                className="h-12 border-b border-charcoal/30 bg-transparent px-2 text-xs font-sans focus:border-gold focus:outline-none"
              >
                {batches.map((b) => (
                  <option key={b.batchId} value={b.batchId}>
                    Batch #00{b.batchId} — {b.farmer.name} ({b.batch.qualityScore} pts)
                  </option>
                ))}
              </select>

              <button
                onClick={handlePrint}
                className="h-12 px-6 text-xs uppercase tracking-widest font-semibold btn-gold-slide flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Sheet</span>
              </button>
            </div>
          </div>
        </div>

        {/* PRINT SHEET CONTAINER */}
        <div className="bg-white p-8 border border-charcoal/15 print:border-none print:p-0">
          <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-6 print:hidden">
            Print Preview — 6 High-Density Labels per Sheet
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
            {Array.from({ length: labelCount }).map((_, idx) => {
              const verifyUrl =
                typeof window !== "undefined"
                  ? `${window.location.origin}/verify/${selectedBatch.batchId}`
                  : `https://honeychain.truetag.in/verify/${selectedBatch.batchId}`;

              return (
                <div
                  key={idx}
                  className="border-2 border-charcoal p-5 bg-alabaster flex flex-col justify-between items-center text-center relative overflow-hidden"
                >
                  {/* Top Seal Header */}
                  <div className="w-full flex justify-between items-center border-b border-charcoal/20 pb-2 mb-3">
                    <div className="text-left">
                      <span className="text-[8px] uppercase tracking-widest text-warm-grey block font-mono font-bold">
                        HONEYCHAIN
                      </span>
                      <span className="text-[7px] text-warm-grey block">KVIC AUTHENTICATED</span>
                    </div>
                    <div className="bg-charcoal text-gold px-1.5 py-0.5 text-[8px] font-bold font-mono">
                      {selectedBatch.batch.qualityScore} PTS
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="p-2 border border-charcoal bg-white my-1">
                    <QRCodeSVG
                      value={verifyUrl}
                      size={110}
                      level="H"
                      includeMargin={false}
                      fgColor="#1A1A1A"
                      bgColor="#FFFFFF"
                    />
                  </div>

                  {/* Token & Scan Label */}
                  <div className="mt-2 w-full pt-2 border-t border-charcoal/20 text-center">
                    <p className="text-[9px] font-mono font-bold text-charcoal">{selectedBatch.qrToken}</p>
                    <p className="text-[7px] uppercase tracking-widest text-warm-grey mt-0.5">
                      Scan with Phone Camera to Verify
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
