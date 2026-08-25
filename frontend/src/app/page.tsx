import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Sparkles, QrCode, ArrowRight, Layers, Award, Activity, CheckCircle2, ChevronRight } from "lucide-react";
import { DEMO_BATCHES } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F9F8F6]">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="py-28 px-6 md:px-12 lg:px-24 border-b-2 border-charcoal/10 relative overflow-hidden bg-[#F9F8F6]">
          {/* Subtle gold decorative gradient corner */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 px-3 py-1.5 border border-charcoal/20 bg-white mb-6 shadow-xs">
                <span className="h-2 w-2 bg-gold" />
                <span className="text-[10px] uppercase tracking-ultra text-charcoal font-bold">
                  KVIC • National Bee Board • TrueTag Platform
                </span>
              </div>
              <h1 className="text-6xl sm:text-7xl md:text-8xl serif text-charcoal font-normal leading-[0.95] tracking-tight mb-8">
                Purity, <br />
                <span className="italic text-gold">Proven</span> On-Chain.
              </h1>
              <p className="text-base md:text-lg text-warm-grey font-normal leading-relaxed mb-10 max-w-2xl">
                India’s decentralized honey provenance infrastructure. Eliminating adulteration through physical tamper-evident micro-QR seals, Polygon PoS immutable custody, and AI spectrometry scoring.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/verify"
                  className="h-14 px-8 text-xs uppercase tracking-widest font-bold btn-gold-slide flex items-center justify-center gap-3 shadow-md"
                >
                  <QrCode className="w-4 h-4 text-gold" />
                  <span>Verify A Honey Jar</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="h-14 px-8 text-xs uppercase tracking-widest font-bold btn-outline-luxury flex items-center justify-center gap-3 shadow-xs"
                >
                  <span>Field Officer Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. STATS BAR (Dark Obsidian) */}
        <section className="py-16 px-6 md:px-12 lg:px-24 bg-[#141414] text-alabaster border-b-2 border-charcoal">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="border-t border-white/15 pt-6">
              <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-1 font-semibold">Registered Beekeepers</p>
              <p className="text-4xl serif text-gold font-bold">14,240+</p>
              <p className="text-[10px] text-taupe/70 mt-1 font-mono">Across 18 States</p>
            </div>
            <div className="border-t border-white/15 pt-6">
              <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-1 font-semibold">Batches Authenticated</p>
              <p className="text-4xl serif text-alabaster font-bold">1.8M+</p>
              <p className="text-[10px] text-taupe/70 mt-1 font-mono">100% On-Chain</p>
            </div>
            <div className="border-t border-white/15 pt-6">
              <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-1 font-semibold">FSSAI Compliance</p>
              <p className="text-4xl serif text-emerald-400 font-bold">99.4%</p>
              <p className="text-[10px] text-taupe/70 mt-1 font-mono">Spectrometry Passed</p>
            </div>
            <div className="border-t border-white/15 pt-6">
              <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-1 font-semibold">Consumer Scans</p>
              <p className="text-4xl serif text-gold font-bold">4.2M+</p>
              <p className="text-[10px] text-taupe/70 mt-1 font-mono">Zero Gas Cost</p>
            </div>
          </div>
        </section>

        {/* 3. THREE CORE PILLARS */}
        <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F9F8F6] border-b-2 border-charcoal/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-left mb-16">
              <p className="text-[10px] uppercase tracking-ultra text-warm-grey mb-2 font-bold">The TrueTag Architecture</p>
              <h2 className="text-4xl md:text-5xl serif font-normal text-charcoal">
                Engineered For <span className="italic text-gold font-serif">Zero Trust</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="p-8 border-2 border-charcoal/15 bg-white hover:border-gold transition-all duration-400 flex flex-col justify-between shadow-sm hover:shadow-md group">
                <div>
                  <div className="w-12 h-12 border border-charcoal bg-charcoal text-gold flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl serif text-charcoal mb-3">Polygon Immutable Ledger</h3>
                  <p className="text-xs text-warm-grey leading-relaxed">
                    Harvest events, custody transfers, and lab test results are minted permanently onto the Polygon PoS network. Tamper-evident and independently auditable.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-charcoal/10 text-[10px] uppercase tracking-widest text-charcoal font-semibold font-mono">
                  Solidity 0.8.24 • OpenZeppelin RBAC
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-8 border-2 border-charcoal/15 bg-white hover:border-gold transition-all duration-400 flex flex-col justify-between shadow-sm hover:shadow-md group">
                <div>
                  <div className="w-12 h-12 border border-charcoal bg-charcoal text-gold flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl serif text-charcoal mb-3">AI Purity & NMR Classifier</h3>
                  <p className="text-xs text-warm-grey leading-relaxed">
                    FastAPI microservice trained on thousands of FSSAI spectrometry samples evaluates moisture, Brix index, HMF freshness, and 13C Carbon Isotope sugar peaks in real-time.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-charcoal/10 text-[10px] uppercase tracking-widest text-charcoal font-semibold font-mono">
                  Scikit-Learn • Random Forest Model
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-8 border-2 border-charcoal/15 bg-white hover:border-gold transition-all duration-400 flex flex-col justify-between shadow-sm hover:shadow-md group">
                <div>
                  <div className="w-12 h-12 border border-charcoal bg-charcoal text-gold flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl serif text-charcoal mb-3">Direct Beekeeper Identity</h3>
                  <p className="text-xs text-warm-grey leading-relaxed">
                    Consumers scan a jar to see the beekeeper’s face, cooperative affiliation, GPS village location, and harvest timestamp—ensuring fair compensation.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-charcoal/10 text-[10px] uppercase tracking-widest text-charcoal font-semibold font-mono">
                  IPFS Decentralized Media Storage
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. LIVE VERIFIED BATCHES PREVIEW */}
        <section className="py-24 px-6 md:px-12 lg:px-24 bg-white border-b-2 border-charcoal/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 pb-6 border-b border-charcoal/10">
              <div>
                <p className="text-[10px] uppercase tracking-ultra text-warm-grey mb-1 font-bold">Live Ledger Explorer</p>
                <h2 className="text-3xl md:text-4xl serif text-charcoal font-normal">Recent Verified Batches</h2>
              </div>
              <Link
                href="/verify"
                className="text-xs uppercase tracking-widest font-bold text-charcoal hover:text-gold transition-colors flex items-center gap-1.5"
              >
                <span>Search All Batches</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {DEMO_BATCHES.map((batch) => (
                <div
                  key={batch.batchId}
                  className="p-8 border-2 border-charcoal/15 bg-[#F9F8F6] hover:border-gold transition-all duration-400 flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-warm-grey font-bold block mb-1">
                        Batch #00{batch.batchId}
                      </span>
                      <h4 className="text-2xl serif text-charcoal font-bold">{batch.farmer.name}</h4>
                      <p className="text-xs text-warm-grey">{batch.farmer.location}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-widest text-warm-grey block">Purity</span>
                      <span className="text-2xl font-serif font-bold text-gold">{batch.batch.qualityScore}/100</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-charcoal/10 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-charcoal font-bold">{batch.qrToken}</span>
                    <Link
                      href={`/verify/${batch.batchId}`}
                      className="text-xs uppercase tracking-widest font-bold text-charcoal hover:text-gold transition-colors flex items-center gap-1"
                    >
                      <span>Verify Jar</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
