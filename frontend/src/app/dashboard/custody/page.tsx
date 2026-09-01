"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import confetti from "canvas-confetti";
import { getCustomBatches, saveCustomBatch, fetchBatchesFromDB } from "@/lib/registry";
import { BatchMetadata } from "@/lib/types";
import { generateSecureHex } from "@/lib/crypto-utils";
import { Truck, ArrowLeft, ShieldCheck, CheckCircle2, Factory, FlaskConical, Store, ExternalLink } from "lucide-react";

export default function CustodyLoggingPage() {
  const [batches, setBatches] = useState<BatchMetadata[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<number>(1);
  const [facility, setFacility] = useState("KVIC Regional Honey Processing Center, Patna");
  const [action, setAction] = useState("Cold Micro-Filtration & TrueTag NFC Sealing");
  const [actorName, setActorName] = useState("Dr. Ananya Ray (Lead Chemist)");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchBatchesFromDB().then((list) => {
      setBatches(list);
      if (list.length > 0) setSelectedBatchId(list[0].batchId);
    });
  }, []);

  const selectedBatch = batches.find((b) => b.batchId === selectedBatchId) || batches[0];

  const handleAddCustody = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const newEntry = {
        actor: `0x${generateSecureHex(20)}`,
        entity: facility,
        timestamp: Math.floor(Date.now() / 1000),
        action: `${action} (Logged by: ${actorName})`,
      };

      const updatedBatch: BatchMetadata = {
        ...selectedBatch,
        custodyChain: [...selectedBatch.custodyChain, newEntry],
      };

      saveCustomBatch(updatedBatch);
      setBatches(getCustomBatches());
      setSuccess(true);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#D4AF37", "#1A1A1A"],
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="py-8 sm:py-16 px-4 sm:px-6 md:px-12 max-w-4xl mx-auto w-full flex-1">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm md:text-xs uppercase tracking-widest text-warm-grey hover:text-charcoal transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Operations Dashboard</span>
        </Link>

        <div className="border border-charcoal/20 bg-white p-5 sm:p-8 md:p-12 shadow-luxury-card">
          <div className="flex items-center gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-charcoal/10">
            <div className="w-10 sm:w-12 h-10 sm:h-12 border border-charcoal bg-charcoal text-gold flex items-center justify-center shrink-0">
              <Truck className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
            <div>
              <p className="text-sm md:text-xs md:text-[10px] uppercase tracking-ultra text-warm-grey font-semibold">Supply Chain Governance</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl serif text-charcoal font-normal">Log Custody Transfer Event</h1>
            </div>
          </div>

          {success ? (
            <div className="p-8 border border-emerald-300 bg-emerald-50/50 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl serif text-charcoal mb-2">Custody Transfer Recorded On-Chain</h2>
              <p className="text-sm md:text-xs text-warm-grey max-w-md mx-auto mb-6">
                Step 0{selectedBatch.custodyChain.length} has been permanently appended to Batch{" "}
                <span className="font-mono font-bold text-charcoal">#00{selectedBatch.batchId}</span> ({selectedBatch.qrToken}).
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href={`/verify/${selectedBatch.batchId}`}
                  target="_blank"
                  className="px-8 py-4 text-sm md:text-xs uppercase tracking-widest font-semibold btn-gold-slide inline-flex items-center justify-center gap-2"
                >
                  <span>View Updated Timeline</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-8 py-4 text-sm md:text-xs uppercase tracking-widest font-semibold btn-outline-luxury inline-block"
                >
                  Log Another Custody Transfer
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAddCustody} className="space-y-8">
              {/* Batch selection */}
              <div>
                <label htmlFor="custody-batch" className="block text-sm md:text-xs md:text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                  Select Harvest Batch
                </label>
                <select
                  id="custody-batch"
                  name="selectedBatchId"
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(Number(e.target.value))}
                  className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans focus:border-gold focus:outline-none"
                >
                  {batches.map((b) => (
                    <option key={b.batchId} value={b.batchId}>
                      Batch #00{b.batchId} — {b.farmer.name} ({b.qrToken} - {b.custodyChain.length} steps)
                    </option>
                  ))}
                </select>
              </div>

              {/* Facility */}
              <div>
                <label htmlFor="custody-facility" className="block text-sm md:text-xs md:text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                  Receiving Facility / Location Entity
                </label>
                <select
                  id="custody-facility"
                  name="facility"
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans focus:border-gold focus:outline-none"
                >
                  <option value="KVIC Regional Honey Processing Center, Patna">KVIC Regional Honey Processing Center, Patna</option>
                  <option value="KVIC Kolkata Central Processing & Packaging Hub">KVIC Kolkata Central Processing & Packaging Hub</option>
                  <option value="National Bee Board Central Quality Lab, New Delhi">National Bee Board Central Quality Lab, New Delhi</option>
                  <option value="TrueTag Secure Distribution Center, Delhi NCR">TrueTag Secure Distribution Center, Delhi NCR</option>
                  <option value="Khadi India Flagship Store, Connaught Place, New Delhi">Khadi India Flagship Store, Connaught Place, New Delhi</option>
                </select>
              </div>

              {/* Action */}
              <div>
                <label className="block text-sm md:text-xs md:text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium" htmlFor="custody-action">
                  Action Performed
                </label>
                <input
id="custody-action" name="action"                   type="text"
                  required
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="e.g. Cold Filtration & NFC Tamper Sealing Applied"
                  className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans focus:border-gold focus:outline-none"
                />
              </div>

              {/* Operator */}
              <div>
                <label className="block text-sm md:text-xs md:text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium" htmlFor="custody-actor">
                  Authorized Operator / Officer Name
                </label>
                <input
id="custody-actor" name="actorName"                   type="text"
                  required
                  value={actorName}
                  onChange={(e) => setActorName(e.target.value)}
                  className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans focus:border-gold focus:outline-none"
                />
              </div>

              <div className="p-6 border border-charcoal/10 bg-alabaster/40 flex items-start gap-4">
                <ShieldCheck className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <p className="text-sm md:text-xs text-warm-grey leading-relaxed">
                  Logging this custody step generates a cryptographic event on the Polygon PoS HoneyChain contract, permanently sealing the supply chain chain-of-custody.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-sm md:text-xs uppercase tracking-widest font-semibold btn-gold-slide flex items-center justify-center gap-2"
              >
                <span>{loading ? "Signing on Polygon PoS..." : "Record Custody Transfer on Blockchain"}</span>
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
