"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getCustomBatches,
  saveCustomBatch,
  getComplaints,
  fetchBatchesFromDB,
  fetchComplaintsFromDB,
  ConsumerComplaint,
} from "@/lib/registry";
import { BatchMetadata } from "@/lib/types";
import GovtInteroperabilityCard from "@/components/GovtInteroperabilityCard";
import { ShieldAlert, ArrowLeft, AlertTriangle, CheckCircle2, Ban, QrCode, ExternalLink, RefreshCw } from "lucide-react";

export default function AdminRecallPage() {
  const [batches, setBatches] = useState<BatchMetadata[]>([]);
  const [complaints, setComplaints] = useState<ConsumerComplaint[]>([]);
  const [revokedId, setRevokedId] = useState<number | null>(null);
  const [modalBatchId, setModalBatchId] = useState<number | null>(null);
  const [recallReason, setRecallReason] = useState("Suspected Adulteration / Broken Tamper Seal");

  useEffect(() => {
    fetchBatchesFromDB().then((b) => setBatches(b));
    fetchComplaintsFromDB().then((c) => setComplaints(c));
  }, []);

  const openRecallModal = (batchId: number) => {
    setModalBatchId(batchId);
  };

  const confirmRevocation = () => {
    if (!modalBatchId) return;
    const target = batches.find((b) => b.batchId === modalBatchId);
    if (!target) return;

    const updated: BatchMetadata = {
      ...target,
      batch: {
        ...target.batch,
        isRevoked: true,
        isAuthentic: false,
        grade: `REVOKED / FOOD SAFETY RECALL (${recallReason})`,
      },
    };

    saveCustomBatch(updated);
    setBatches(getCustomBatches());
    setRevokedId(modalBatchId);
    setModalBatchId(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="py-16 px-6 md:px-12 max-w-6xl mx-auto w-full flex-1">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-warm-grey hover:text-charcoal transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Operations Dashboard</span>
        </Link>

        {/* National Bee Board & AgriStack Interoperability Card */}
        <GovtInteroperabilityCard />

        {/* Header */}
        <div className="border border-charcoal/20 bg-white p-8 md:p-12 shadow-luxury-card mb-12">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-charcoal/10">
            <div className="w-12 h-12 border border-charcoal bg-charcoal text-rose-500 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-ultra text-warm-grey font-semibold">KVIC Administration & Food Safety</p>
              <h1 className="text-3xl serif text-charcoal font-normal">Emergency Recall & Quality Oversight</h1>
            </div>
          </div>

          {/* 1. Consumer Complaints Queue */}
          <div className="mb-12">
            <h3 className="text-xl serif text-charcoal mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Consumer Tampering & Adulteration Inquiries</span>
            </h3>

            <div className="border border-charcoal/10 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-alabaster border-b border-charcoal/10 text-[10px] uppercase tracking-widest text-warm-grey">
                  <tr>
                    <th className="p-3">Complaint ID</th>
                    <th className="p-3">Batch / QR Token</th>
                    <th className="p-3">Reported By</th>
                    <th className="p-3">Issue Description</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/5">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-alabaster/40">
                      <td className="p-3 font-mono font-bold text-charcoal">{c.id}</td>
                      <td className="p-3 font-mono">#{c.batchId} ({c.qrToken})</td>
                      <td className="p-3 font-medium">{c.reportedBy}</td>
                      <td className="p-3 text-warm-grey">{c.reason}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border ${
                          c.status.includes("Authentic")
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : "border-amber-300 bg-amber-50 text-amber-800"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Batch Revocation Table */}
          <div>
            <h3 className="text-xl serif text-charcoal mb-4 flex items-center gap-2">
              <Ban className="w-4 h-4 text-rose-600" />
              <span>Active Batches & On-Chain Revocation Controls</span>
            </h3>

            <div className="border border-charcoal/10 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-alabaster border-b border-charcoal/10 text-[10px] uppercase tracking-widest text-warm-grey">
                  <tr>
                    <th className="p-3">Batch ID</th>
                    <th className="p-3">Beekeeper / Location</th>
                    <th className="p-3">Purity Score</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/5">
                  {batches.map((b) => (
                    <tr key={b.batchId} className="hover:bg-alabaster/40">
                      <td className="p-3 font-mono font-bold">#00{b.batchId} ({b.qrToken})</td>
                      <td className="p-3">{b.farmer.name} ({b.farmer.location})</td>
                      <td className="p-3 font-serif font-bold text-gold">{b.batch.qualityScore}/100</td>
                      <td className="p-3">
                        {b.batch.isRevoked ? (
                          <span className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border border-rose-300 bg-rose-50 text-rose-800">
                            REVOKED / RECALLED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border border-emerald-300 bg-emerald-50 text-emerald-800">
                            AUTHENTIC & ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {b.batch.isRevoked ? (
                          <span className="text-[10px] text-warm-grey font-mono">Ledger Sealed</span>
                        ) : (
                          <button
                            onClick={() => openRecallModal(b.batchId)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] uppercase tracking-widest font-semibold transition-colors shadow-xs"
                          >
                            Emergency Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Custom Luxury Recall Confirmation Modal */}
        {modalBatchId && (
          <div className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="border-2 border-rose-500 bg-white max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-charcoal/10 text-rose-600">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="text-xl serif font-bold">Confirm Batch Revocation</h3>
              </div>

              <p className="text-xs text-warm-grey mb-4">
                You are about to issue a permanent emergency food safety revocation for <strong>Batch #{modalBatchId}</strong>.
                All consumer verification scans for this batch token will immediately flag as <strong>REVOKED / RECALLED</strong> across all distributed nodes and active sessions.
              </p>

              <div className="mb-6">
                <label className="block text-[10px] uppercase tracking-widest text-charcoal font-bold mb-1.5">
                  Official Revocation Reason:
                </label>
                <select
                  value={recallReason}
                  onChange={(e) => setRecallReason(e.target.value)}
                  className="w-full h-10 border border-charcoal/30 bg-alabaster px-3 text-xs font-mono font-bold focus:border-rose-600 focus:outline-none"
                >
                  <option value="Suspected Adulteration / Broken Tamper Seal">Suspected Adulteration / Broken Tamper Seal</option>
                  <option value="High Exogenous C4 Corn/Cane Syrup Detected">High Exogenous C4 Corn/Cane Syrup Detected</option>
                  <option value="SMR Rice Syrup Oligosaccharides Marker Positive">SMR Rice Syrup Oligosaccharides Marker Positive</option>
                  <option value="FSSAI IS 4941 Moisture / HMF Threshold Violation">FSSAI IS 4941 Moisture / HMF Threshold Violation</option>
                  <option value="Physical Packaging Tampering Reported by Retailer">Physical Packaging Tampering Reported by Retailer</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalBatchId(null)}
                  className="flex-1 h-11 border border-charcoal/30 text-charcoal text-xs uppercase tracking-widest font-bold hover:bg-alabaster transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRevocation}
                  className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white text-xs uppercase tracking-widest font-bold transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <Ban className="w-4 h-4" />
                  <span>Execute Revoke</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
