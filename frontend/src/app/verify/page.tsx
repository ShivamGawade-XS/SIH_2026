"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { QrCode, Search, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function VerifySearchPage() {
  const [tokenInput, setTokenInput] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    const clean = tokenInput.trim();
    // Support batch ID or QR token
    if (/^\d+$/.test(clean)) {
      router.push(`/verify/${clean}`);
    } else {
      router.push(`/verify/1?qr=${encodeURIComponent(clean)}`);
    }
  };

  const sampleBatches = [
    { id: 1, name: "Muzaffarpur Litchi Honey", qr: "TT-2026-00001", score: 94, farmer: "Rajesh K. Verma" },
    { id: 2, name: "Sundarbans Wild Mangrove Honey", qr: "TT-2026-00002", score: 91, farmer: "Lakshmi Devi & Coop" },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="py-24 px-6 md:px-12 max-w-4xl mx-auto w-full flex-1">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[10px] uppercase tracking-ultra text-warm-grey mb-3 font-semibold">
            TrueTag Universal Authentication
          </p>
          <h1 className="text-5xl md:text-7xl serif text-charcoal mb-6 font-normal">
            Verify Your <span className="italic text-gold">Honey</span>
          </h1>
          <p className="text-base text-warm-grey max-w-xl mx-auto leading-relaxed">
            Enter the TrueTag QR identifier printed on your honey jar label or inspect a demo batch to verify harvest origins, lab spectrometry, and Polygon blockchain proof.
          </p>
        </div>

        {/* Search Bar */}
        <div className="border border-charcoal/20 bg-white p-8 md:p-12 mb-16 shadow-luxury-card">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g. TT-2026-00001 or Batch #1"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full h-14 border-b border-charcoal/30 bg-transparent px-4 text-sm font-sans text-charcoal focus:border-gold focus:outline-none placeholder:italic placeholder:text-warm-grey/60"
              />
            </div>
            <button
              type="submit"
              className="h-14 px-8 text-xs uppercase tracking-widest font-semibold btn-gold-slide flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Authenticate</span>
            </button>
          </form>
        </div>

        {/* Sample Batches */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-6 text-center">
            Or Inspect Pre-Authenticated KVIC Batches
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleBatches.map((b) => (
              <Link
                key={b.id}
                href={`/verify/${b.id}`}
                className="p-6 border border-charcoal/10 bg-white hover:border-gold transition-all duration-500 group flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-widest text-warm-grey font-mono">{b.qr}</span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                      Score: {b.score}/100
                    </span>
                  </div>
                  <h3 className="font-serif text-lg text-charcoal group-hover:text-gold transition-colors duration-300">
                    {b.name}
                  </h3>
                  <p className="text-xs text-warm-grey mt-1">Beekeeper: {b.farmer}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-charcoal group-hover:translate-x-1 group-hover:text-gold transition-all duration-300" />
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
