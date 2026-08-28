"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CameraScanner from "@/components/CameraScanner";
import OfflineSMSSimulator from "@/components/OfflineSMSSimulator";
import { QrCode, Search, Sparkles, ArrowRight, Camera, ShieldCheck, MessageSquare } from "lucide-react";
import Link from "next/link";
import { getCustomBatches } from "@/lib/registry";
import { useLanguage } from "@/lib/LanguageContext";

export default function VerifySearchPage() {
  const [tokenInput, setTokenInput] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    const clean = tokenInput.trim();
    processScanResult(clean);
  };

  const processScanResult = (decodedText: string) => {
    setShowScanner(false);
    const clean = decodedText.trim();

    if (clean.includes("/verify/")) {
      const parts = clean.split("/verify/");
      const batchPart = parts[1]?.split("?")[0]?.split("/")[0];
      if (batchPart) {
        router.push(`/verify/${batchPart}`);
        return;
      }
    }

    // Check custom batch registry
    const customList = getCustomBatches();
    const match = customList.find(
      (b) =>
        b.qrToken.toLowerCase() === clean.toLowerCase() ||
        String(b.batchId) === clean
    );

    if (match) {
      router.push(`/verify/${match.batchId}?qr=${encodeURIComponent(match.qrToken)}`);
      return;
    }

    if (/^\d+$/.test(clean)) {
      router.push(`/verify/${clean}`);
      return;
    }

    router.push(`/verify/1?qr=${encodeURIComponent(clean)}`);
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

      <OfflineSMSSimulator
        isOpen={showSmsModal}
        onClose={() => setShowSmsModal(false)}
      />

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
            {t("heroDescription")}
          </p>
        </div>

        {/* Action Panel: Camera Scan + SMS Simulation + Manual Search */}
        <div className="border-2 border-charcoal/20 bg-white p-8 md:p-12 mb-16 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setShowScanner(true)}
              className="h-14 px-6 text-xs uppercase tracking-widest font-bold btn-gold-slide flex items-center justify-center gap-3 shadow-sm"
            >
              <Camera className="w-5 h-5 text-gold" />
              <span>{t("scanWithCamera")}</span>
            </button>

            <button
              onClick={() => setShowSmsModal(true)}
              className="h-14 px-6 text-xs uppercase tracking-widest font-bold border-2 border-charcoal bg-alabaster hover:bg-charcoal hover:text-gold text-charcoal flex items-center justify-center gap-2.5 transition-colors shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-gold" />
              <span>{t("offlineSms")}</span>
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

        {/* Quick Sample Batches */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] uppercase tracking-ultra text-warm-grey font-semibold">
              Instant Verified Batch Samples (Click to Inspect)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleBatches.map((batch) => (
              <Link
                key={batch.id}
                href={`/verify/${batch.id}?qr=${batch.qr}` }
                className="p-6 border-2 border-charcoal/15 bg-white hover:border-gold transition-all block group shadow-xs hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-warm-grey uppercase tracking-widest block font-bold">
                      {batch.qr}
                    </span>
                    <h3 className="text-xl serif text-charcoal font-bold group-hover:text-gold transition-colors">
                      {batch.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 border border-emerald-300">
                      Score: {batch.score}/100
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-warm-grey pt-3 border-t border-charcoal/10">
                  <span>{batch.farmer}</span>
                  <span className="text-charcoal font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {t("verifyJarLink")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
