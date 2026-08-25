"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LiveTelemetryStream from "@/components/LiveTelemetryStream";
import { DEMO_BATCHES } from "@/lib/constants";
import { getCustomBatches, getCustomFarmers } from "@/lib/registry";
import { BatchMetadata } from "@/lib/types";
import {
  Users,
  Layers,
  Sparkles,
  Activity,
  PlusCircle,
  Truck,
  QrCode,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Radio,
  FileSpreadsheet,
  ShieldAlert,
} from "lucide-react";

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [batchesList, setBatchesList] = useState<BatchMetadata[]>(DEMO_BATCHES);
  const [farmerCount, setFarmerCount] = useState(14240);

  useEffect(() => {
    const list = getCustomBatches();
    const farmers = getCustomFarmers();
    setBatchesList(list);
    setFarmerCount(14240 + (farmers.length - 2));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/dashboard/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F9F8F6]">
      <Navbar />

      <main className="py-16 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full flex-1">
        {/* Officer Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 pb-8 border-b-2 border-charcoal/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-ultra text-charcoal font-bold">
                KVIC Field Operations Center • Station #BH-002
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl serif text-charcoal font-normal">
              Operations <span className="italic text-gold font-serif">Dashboard</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/admin"
              className="px-4 py-2 text-xs uppercase tracking-widest font-bold border-2 border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Recall Center</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs uppercase tracking-widest font-bold border-2 border-charcoal/30 hover:border-charcoal bg-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5 text-charcoal" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* 1. TOP METRIC STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="p-6 border-2 border-charcoal/15 bg-white shadow-xs hover:border-gold transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase tracking-widest text-warm-grey font-bold">Registered Farmers</span>
              <Users className="w-5 h-5 text-gold" />
            </div>
            <p className="text-3xl font-serif text-charcoal font-bold">{farmerCount.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-800 mt-2 font-bold font-mono">+12 verified this week</p>
          </div>

          <div className="p-6 border-2 border-charcoal/15 bg-white shadow-xs hover:border-gold transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase tracking-widest text-warm-grey font-bold">Minted Batches</span>
              <Layers className="w-5 h-5 text-gold" />
            </div>
            <p className="text-3xl font-serif text-charcoal font-bold">{(18920 + batchesList.length - 2).toLocaleString()}</p>
            <p className="text-[10px] text-emerald-800 mt-2 font-bold font-mono">100% on Polygon PoS</p>
          </div>

          <div className="p-6 border-2 border-charcoal/15 bg-white shadow-xs hover:border-gold transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase tracking-widest text-warm-grey font-bold">Avg. AI Purity Score</span>
              <Sparkles className="w-5 h-5 text-gold" />
            </div>
            <p className="text-3xl font-serif text-charcoal font-bold">92.8<span className="text-sm font-sans font-normal text-warm-grey">/100</span></p>
            <p className="text-[10px] text-emerald-800 mt-2 font-bold font-mono">Grade A+ Average</p>
          </div>

          <div className="p-6 border-2 border-charcoal/15 bg-white shadow-xs hover:border-gold transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase tracking-widest text-warm-grey font-bold">IoT Hive Telemetry</span>
              <Activity className="w-5 h-5 text-gold" />
            </div>
            <p className="text-3xl font-serif text-charcoal font-bold">24 Nodes</p>
            <p className="text-[10px] text-emerald-800 mt-2 font-bold font-mono">Live SSE Streaming</p>
          </div>
        </div>

        {/* 2. ACTION SHORTCUTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          <Link
            href="/dashboard/register"
            className="p-6 border-2 border-charcoal bg-[#141414] text-alabaster hover:border-gold transition-all duration-400 group flex flex-col justify-between shadow-sm"
          >
            <div>
              <PlusCircle className="w-7 h-7 text-gold mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl serif text-alabaster mb-1 font-bold">Register Beekeeper</h3>
              <p className="text-xs text-taupe/70 leading-relaxed font-light">
                KYC, cooperative code, GPS location, IPFS photo.
              </p>
            </div>
            <div className="mt-6 text-[10px] uppercase tracking-widest text-gold font-bold flex items-center gap-1">
              <span>Open Form</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            href="/dashboard/mint"
            className="p-6 border-2 border-charcoal bg-[#141414] text-alabaster hover:border-gold transition-all duration-400 group flex flex-col justify-between shadow-sm"
          >
            <div>
              <Layers className="w-7 h-7 text-gold mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl serif text-alabaster mb-1 font-bold">Mint Batch</h3>
              <p className="text-xs text-taupe/70 leading-relaxed font-light">
                FastAPI NMR anti-adulteration models on Polygon.
              </p>
            </div>
            <div className="mt-6 text-[10px] uppercase tracking-widest text-gold font-bold flex items-center gap-1">
              <span>Launch Mint</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            href="/dashboard/custody"
            className="p-6 border-2 border-charcoal bg-[#141414] text-alabaster hover:border-gold transition-all duration-400 group flex flex-col justify-between shadow-sm"
          >
            <div>
              <Truck className="w-7 h-7 text-gold mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl serif text-alabaster mb-1 font-bold">Log Custody</h3>
              <p className="text-xs text-taupe/70 leading-relaxed font-light">
                Processing, cold filtration, lab certification.
              </p>
            </div>
            <div className="mt-6 text-[10px] uppercase tracking-widest text-gold font-bold flex items-center gap-1">
              <span>Log Step</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            href="/dashboard/bulk"
            className="p-6 border-2 border-charcoal bg-[#141414] text-alabaster hover:border-gold transition-all duration-400 group flex flex-col justify-between shadow-sm"
          >
            <div>
              <FileSpreadsheet className="w-7 h-7 text-gold mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl serif text-alabaster mb-1 font-bold">Bulk CSV Mint</h3>
              <p className="text-xs text-taupe/70 leading-relaxed font-light">
                High-throughput multi-barrel CSV minting.
              </p>
            </div>
            <div className="mt-6 text-[10px] uppercase tracking-widest text-gold font-bold flex items-center gap-1">
              <span>Upload CSV</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            href="/dashboard/qr"
            className="p-6 border-2 border-charcoal bg-[#141414] text-alabaster hover:border-gold transition-all duration-400 group flex flex-col justify-between shadow-sm"
          >
            <div>
              <QrCode className="w-7 h-7 text-gold mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl serif text-alabaster mb-1 font-bold">Print QR Labels</h3>
              <p className="text-xs text-taupe/70 leading-relaxed font-light">
                Printable tamper-evident TrueTag sticker sheets.
              </p>
            </div>
            <div className="mt-6 text-[10px] uppercase tracking-widest text-gold font-bold flex items-center gap-1">
              <span>Print Sheet</span>
              <span>→</span>
            </div>
          </Link>
        </div>

        {/* 3. LIVE IOT HIVE TELEMETRY STREAM (SSE REAL-TIME) */}
        <LiveTelemetryStream />

        {/* 4. RECENT BATCHES TABLE */}
        <div className="border-2 border-charcoal/15 bg-white p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-charcoal/10">
            <h3 className="text-2xl serif text-charcoal font-bold">Recently Authenticated Harvest Batches</h3>
            <span className="text-[10px] uppercase tracking-widest text-charcoal font-mono font-bold">
              Polygon PoS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-charcoal/15 bg-[#F9F8F6] text-[10px] uppercase tracking-widest text-warm-grey">
                  <th className="p-3 font-bold">Batch ID</th>
                  <th className="p-3 font-bold">QR Token</th>
                  <th className="p-3 font-bold">Beekeeper / Location</th>
                  <th className="p-3 font-bold">Purity Score</th>
                  <th className="p-3 font-bold">Grade</th>
                  <th className="p-3 font-bold text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                {batchesList.map((item) => (
                  <tr key={item.batchId} className="hover:bg-[#F9F8F6] transition-colors">
                    <td className="p-3 font-mono font-bold text-charcoal">
                      #00{item.batchId}
                    </td>
                    <td className="p-3 font-mono font-semibold text-charcoal">{item.qrToken}</td>
                    <td className="p-3">
                      <p className="font-semibold text-charcoal">{item.farmer.name}</p>
                      <p className="text-[10px] text-warm-grey">{item.farmer.location}</p>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-serif font-bold text-gold">
                        {item.batch.qualityScore}/100
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                        item.batch.isRevoked
                          ? "border-rose-400 bg-rose-50 text-rose-800"
                          : "border-emerald-300 bg-emerald-50 text-emerald-800"
                      }`}>
                        {item.batch.grade}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/verify/${item.batchId}`}
                        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-charcoal hover:text-gold transition-colors"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
