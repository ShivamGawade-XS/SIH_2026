"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

  const [hives, setHives] = useState([
    { id: "HIVE-001", weight: 34.2, temp: 34.8, humidity: 58.2, status: "Normal (Active Foraging)" },
    { id: "HIVE-002", weight: 31.8, temp: 35.1, humidity: 61.0, status: "Optimal Brood Temp" },
    { id: "HIVE-003", weight: 28.4, temp: 37.4, humidity: 69.5, status: "Harvest Ready" },
  ]);

  // Simulate live IoT fluctuations every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHives((prev) =>
        prev.map((h) => ({
          ...h,
          weight: Number((h.weight + (Math.random() * 0.2 - 0.1)).toFixed(2)),
          temp: Number((h.temp + (Math.random() * 0.2 - 0.1)).toFixed(1)),
        }))
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/dashboard/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="py-16 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full flex-1">
        {/* Officer Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 pb-8 border-b border-charcoal/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-ultra text-warm-grey font-semibold">
                KVIC Field Officer Portal • Station #BH-002
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl serif text-charcoal font-normal">
              Operations <span className="italic text-gold">Dashboard</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs uppercase tracking-widest font-semibold border border-charcoal/20 hover:border-charcoal flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* 1. TOP METRIC STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="p-6 border border-charcoal/10 bg-white">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase tracking-widest text-warm-grey">Registered Farmers</span>
              <Users className="w-4 h-4 text-gold" />
            </div>
            <p className="text-3xl font-serif text-charcoal font-bold">{farmerCount.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-700 mt-2 font-medium">+12 verified this week</p>
          </div>

          <div className="p-6 border border-charcoal/10 bg-white">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase tracking-widest text-warm-grey">Minted Batches</span>
              <Layers className="w-4 h-4 text-gold" />
            </div>
            <p className="text-3xl font-serif text-charcoal font-bold">{(18920 + batchesList.length - 2).toLocaleString()}</p>
            <p className="text-[10px] text-emerald-700 mt-2 font-medium">100% on Polygon PoS</p>
          </div>

          <div className="p-6 border border-charcoal/10 bg-white">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase tracking-widest text-warm-grey">Avg. AI Purity Score</span>
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
            <p className="text-3xl font-serif text-charcoal font-bold">92.8<span className="text-sm font-sans font-normal text-warm-grey">/100</span></p>
            <p className="text-[10px] text-emerald-700 mt-2 font-medium">Grade A+ Average</p>
          </div>

          <div className="p-6 border border-charcoal/10 bg-white">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase tracking-widest text-warm-grey">IoT Hive Telemetry</span>
              <Activity className="w-4 h-4 text-gold" />
            </div>
            <p className="text-3xl font-serif text-charcoal font-bold">24 Nodes</p>
            <p className="text-[10px] text-emerald-700 mt-2 font-medium">Streaming Live</p>
          </div>
        </div>

        {/* 2. ACTION SHORTCUTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Link
            href="/dashboard/register"
            className="p-8 border border-charcoal/20 bg-charcoal text-alabaster hover:border-gold transition-colors duration-500 group flex flex-col justify-between"
          >
            <div>
              <PlusCircle className="w-8 h-8 text-gold mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-2xl serif text-alabaster mb-2">Register Beekeeper</h3>
              <p className="text-xs text-taupe/70 leading-relaxed">
                Onboard a new KVIC honey farmer with KYC, cooperative code, GPS location, and IPFS photo.
              </p>
            </div>
            <div className="mt-8 text-[10px] uppercase tracking-widest text-gold font-semibold flex items-center gap-1">
              <span>Open Registration</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            href="/dashboard/mint"
            className="p-8 border border-charcoal/20 bg-charcoal text-alabaster hover:border-gold transition-colors duration-500 group flex flex-col justify-between"
          >
            <div>
              <Layers className="w-8 h-8 text-gold mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-2xl serif text-alabaster mb-2">Mint Harvest Batch</h3>
              <p className="text-xs text-taupe/70 leading-relaxed">
                Input spectrometry, run live AI NMR anti-adulteration models, and mint on Polygon PoS.
              </p>
            </div>
            <div className="mt-8 text-[10px] uppercase tracking-widest text-gold font-semibold flex items-center gap-1">
              <span>Launch Minting Engine</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            href="/dashboard/custody"
            className="p-8 border border-charcoal/20 bg-charcoal text-alabaster hover:border-gold transition-colors duration-500 group flex flex-col justify-between"
          >
            <div>
              <Truck className="w-8 h-8 text-gold mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-2xl serif text-alabaster mb-2">Log Custody</h3>
              <p className="text-xs text-taupe/70 leading-relaxed">
                Record processing, cold filtration, lab certification, and dispatch events on-chain.
              </p>
            </div>
            <div className="mt-8 text-[10px] uppercase tracking-widest text-gold font-semibold flex items-center gap-1">
              <span>Log Custody Step</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            href="/dashboard/qr"
            className="p-8 border border-charcoal/20 bg-charcoal text-alabaster hover:border-gold transition-colors duration-500 group flex flex-col justify-between"
          >
            <div>
              <QrCode className="w-8 h-8 text-gold mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-2xl serif text-alabaster mb-2">Generate QR Labels</h3>
              <p className="text-xs text-taupe/70 leading-relaxed">
                Produce printable tamper-evident TrueTag QR sticker sheets with direct scan authentication.
              </p>
            </div>
            <div className="mt-8 text-[10px] uppercase tracking-widest text-gold font-semibold flex items-center gap-1">
              <span>Print Label Sheet</span>
              <span>→</span>
            </div>
          </Link>
        </div>

        {/* 3. LIVE IOT HIVE TELEMETRY WIDGET */}
        <div className="border border-charcoal/10 bg-white p-8 mb-16">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-charcoal/10">
            <div className="flex items-center gap-3">
              <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
              <h3 className="text-xl serif text-charcoal">Live Apiary Telemetry Stream</h3>
            </div>
            <span className="text-[10px] uppercase tracking-widest font-mono text-warm-grey">
              Muzaffarpur Litchi Valley Hub
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hives.map((hive) => (
              <div key={hive.id} className="p-5 border border-charcoal/10 bg-alabaster/40">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-xs font-bold text-charcoal">{hive.id}</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                    {hive.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center my-3">
                  <div className="border-r border-charcoal/10 pr-2">
                    <span className="text-[10px] uppercase tracking-widest text-warm-grey block">Weight</span>
                    <span className="text-base font-serif font-bold text-charcoal">{hive.weight} kg</span>
                  </div>
                  <div className="border-r border-charcoal/10 pr-2">
                    <span className="text-[10px] uppercase tracking-widest text-warm-grey block">Temp</span>
                    <span className="text-base font-serif font-bold text-charcoal">{hive.temp}°C</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-warm-grey block">Humidity</span>
                    <span className="text-base font-serif font-bold text-charcoal">{hive.humidity}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. RECENT BATCHES TABLE */}
        <div className="border border-charcoal/10 bg-white p-8">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-charcoal/10">
            <h3 className="text-xl serif text-charcoal">Recently Authenticated Harvest Batches</h3>
            <span className="text-[10px] uppercase tracking-widest text-warm-grey font-mono">
              Polygon Sepolia
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-charcoal/10 text-[10px] uppercase tracking-widest text-warm-grey">
                  <th className="pb-3 font-semibold">Batch ID</th>
                  <th className="pb-3 font-semibold">QR Token</th>
                  <th className="pb-3 font-semibold">Beekeeper / Location</th>
                  <th className="pb-3 font-semibold">Purity Score</th>
                  <th className="pb-3 font-semibold">Grade</th>
                  <th className="pb-3 font-semibold text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {batchesList.map((b) => (
                  <tr key={b.batchId} className="hover:bg-alabaster/50 transition-colors">
                    <td className="py-4 font-mono font-bold text-charcoal">#00{b.batchId}</td>
                    <td className="py-4 font-mono text-warm-grey">{b.qrToken}</td>
                    <td className="py-4">
                      <span className="font-medium text-charcoal block">{b.farmer.name}</span>
                      <span className="text-[10px] text-warm-grey">{b.farmer.location}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-serif font-bold text-gold">{b.batch.qualityScore}</span>
                      <span className="text-[10px] text-warm-grey">/100</span>
                    </td>
                    <td className="py-4 font-medium text-charcoal">{b.batch.grade}</td>
                    <td className="py-4 text-right">
                      <Link
                        href={`/verify/${b.batchId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold text-charcoal hover:text-gold transition-colors"
                      >
                        <span>Verify View</span>
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
