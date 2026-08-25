"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CameraScanner from "@/components/CameraScanner";
import { QrCode, Search, Sparkles, ArrowRight, Camera, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function VerifySearchPage() {
  const [tokenInput, setTokenInput] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    const clean = tokenInput.trim();
    processScanResult(clean);
  };

  const processScanResult = (decodedText: string) => {
    setShowScanner(false);
    let target = decodedText.trim();

    if (target.includes("/verify/")) {
      const parts = target.split("/verify/");
      const batchPart = parts[1]?.split("?")[0]?.split("/")[0];
      if (batchPart) {
        router.push(`/verify/${batchPart}`);
        return;
      }
    }

    if (/^\d+$/.test(target)) {
      router.push(`/verify/${target}`);
      return;
    }

    if (target.includes("TT-2026-00002")) {
      router.push(`/verify/2`);
      return;
    }

    router.push(`/verify/1?qr=${encodeURIComponent(target)}`);
  };

  const sampleBatches = [
    { id: 1, name: "Muzaffarpur Litchi Honey", qr: "TT-2026-00001", score: 94, farmer: "Rajesh K. Verma (Bihar)" },
    { id: 2, name: "Sundarbans Wild Mangrove Honey", qr: "TT-2026-00002", score: 91, farmer: "Lakshmi Devi & Coop (Bengal)" },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F9F8F6]">
      <Navbar />

      {showScanner && (
        <CameraScanner
          onScanSuccess={(code) => processScanResult(code)}
          onClose={() => setShowScanner(false)}
        />
      )}

      <main className="py-24 px-6 md:px-12 max-w-4xl mx-auto w-full flex-1">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-charcoal/20 bg-white mb-4 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] uppercase tracking-ultra text-charcoal font-bold">
              TrueTag Universal Authentication
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl serif text-charcoal mb-6 font-normal">
            Verify Your <span className="italic text-gold font-serif">Honey</span>
          </h1>
          <p className="text-sm md:text-base text-warm-grey max-w-xl mx-auto leading-relaxed font-normal">
            Scan the TrueTag QR code on your honey jar with your camera or enter the batch identifier to verify harvest origin, lab spectrometry, and Polygon blockchain proof.
          </p>
        </div>

        {/* Action Panel: Camera Scan + Manual Search */}
        <div className="border-2 border-charcoal/20 bg-white p-8 md:p-12 mb-16 shadow-md">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={() => setShowScanner(true)}
              className="flex-1 h-14 px-8 text-xs uppercase tracking-widest font-bold btn-gold-slide flex items-center justify-center gap-3 shadow-sm"
            >
              <Camera className="w-5 h-5 text-gold" />
              <span>Scan Jar With Camera</span>
            </button>
          </div>

          <div className="flex items-center gap-4 my-6">
            <div className="h-px flex-1 bg-charcoal/20" />
            <span className="text-[10px] uppercase tracking-widest text-warm-grey font-bold">Or Enter Token Manually</span>
            <div className="h-px flex-1 bg-charcoal/20" />
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g. TT-2026-00001 or Batch #1"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full h-14 border-b-2 border-charcoal/40 bg-transparent px-4 text-sm font-sans text-charcoal focus:border-gold focus:outline-none placeholder:italic placeholder:text-warm-grey/70 font-medium"
              />
            </div>
            <button
              type="submit"
              className="h-14 px-8 text-xs uppercase tracking-widest font-bold btn-outline-luxury flex items-center justify-center gap-2 shadow-xs"
            >
              <Search className="w-4 h-4 text-charcoal" />
              <span>Verify</span>
            </button>
          </form>
        </div>

        {/* Sample Batches */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-6 text-center font-bold">
            Or Inspect Pre-Authenticated KVIC Batches
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleBatches.map((b) => (
              <Link
                key={b.id}
                href={`/verify/${b.id}`}
                className="p-6 border-2 border-charcoal/15 bg-white hover:border-gold transition-all duration-400 group flex justify-between items-center shadow-xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-charcoal font-bold font-mono">{b.qr}</span>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300 font-bold">
                      Score: {b.score}/100
                    </span>
                  </div>
                  <h3 className="font-serif text-lg text-charcoal font-bold group-hover:text-gold transition-colors duration-300">
                    {b.name}
                  </h3>
                  <p className="text-xs text-warm-grey mt-1">{b.farmer}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-charcoal group-hover:translate-x-1.5 group-hover:text-gold transition-all duration-300" />
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
