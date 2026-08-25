import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Sparkles, QrCode, ArrowRight, Layers, Award, Activity } from "lucide-react";
import { DEMO_BATCHES } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="py-32 px-6 md:px-12 lg:px-24 border-b border-charcoal/10 relative overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-10 bg-gold" />
                <span className="text-xs uppercase tracking-ultra text-warm-grey font-semibold">
                  KVIC • National Bee Board • TrueTag Platform
                </span>
              </div>
              <h1 className="text-6xl sm:text-7xl md:text-9xl serif text-charcoal font-normal leading-[0.9] tracking-tight mb-8">
                Purity, <br />
                <span className="italic text-gold">Proven</span> On-Chain.
              </h1>
              <p className="text-lg md:text-xl text-warm-grey font-light leading-relaxed mb-12 max-w-2xl">
                India’s first decentralized honey provenance infrastructure. Eliminating adulteration through physical tamper-evident micro-QR seals, Polygon PoS immutable custody, and AI spectrometry scoring.
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <Link
                  href="/verify"
                  className="h-14 px-10 text-xs uppercase tracking-widest font-semibold btn-gold-slide flex items-center justify-center gap-3"
                >
                  <QrCode className="w-4 h-4 text-gold" />
                  <span>Verify A Honey Jar</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="h-14 px-8 text-xs uppercase tracking-widest font-semibold btn-outline-luxury flex items-center justify-center gap-3"
                >
                  <span>Field Officer Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. STATS BAR */}
        <section className="py-16 px-6 md:px-12 lg:px-24 bg-charcoal text-alabaster border-b border-charcoal">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="border-t border-white/10 pt-6">
              <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-1">Registered Beekeepers</p>
              <p className="text-4xl serif text-gold font-bold">14,200+</p>
              <p className="text-[10px] text-taupe/60 mt-1">Across 18 States</p>
            </div>
            <div className="border-t border-white/10 pt-6">
              <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-1">Batches Authenticated</p>
              <p className="text-4xl serif text-alabaster font-bold">1.8M+</p>
              <p className="text-[10px] text-taupe/60 mt-1">100% On-Chain</p>
            </div>
            <div className="border-t border-white/10 pt-6">
              <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-1">FSSAI Compliance</p>
              <p className="text-4xl serif text-emerald-400 font-bold">99.4%</p>
              <p className="text-[10px] text-taupe/60 mt-1">Spectrometry Passed</p>
            </div>
            <div className="border-t border-white/10 pt-6">
              <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-1">Consumer Scans</p>
              <p className="text-4xl serif text-gold font-bold">4.2M+</p>
              <p className="text-[10px] text-taupe/60 mt-1">Zero Gas Cost for Users</p>
            </div>
          </div>
        </section>

        {/* 3. THREE CORE PILLARS */}
        <section className="py-32 px-6 md:px-12 lg:px-24 bg-alabaster border-b border-charcoal/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-left mb-20">
              <p className="text-[10px] uppercase tracking-ultra text-warm-grey mb-2 font-semibold">The TrueTag Architecture</p>
              <h2 className="text-4xl md:text-6xl serif font-normal text-charcoal">
                Engineered For <span className="italic text-gold">Zero Trust</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Card 1 */}
              <div className="p-8 border border-charcoal/10 bg-white hover:border-gold transition-colors duration-500 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 border border-charcoal bg-charcoal text-gold flex items-center justify-center mb-8">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl serif text-charcoal mb-4">Polygon Immutable Ledger</h3>
                  <p className="text-xs text-warm-grey leading-relaxed">
                    Harvest events, custody transfers, and lab test results are minted permanently onto the Polygon PoS network. Tamper-evident and independently auditable.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-charcoal/10 text-[10px] uppercase tracking-widest text-warm-grey">
                  Solidity 0.8.24 • OpenZeppelin RBAC
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-8 border border-charcoal/10 bg-white hover:border-gold transition-colors duration-500 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 border border-charcoal bg-charcoal text-gold flex items-center justify-center mb-8">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl serif text-charcoal mb-4">AI Purity Scoring</h3>
                  <p className="text-xs text-warm-grey leading-relaxed">
                    FastAPI microservice trained on thousands of FSSAI spectrometry samples evaluates moisture, Brix index, HMF freshness, and diastase activity in real-time.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-charcoal/10 text-[10px] uppercase tracking-widest text-warm-grey">
                  Scikit-Learn • Random Forest Model
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-8 border border-charcoal/10 bg-white hover:border-gold transition-colors duration-500 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 border border-charcoal bg-charcoal text-gold flex items-center justify-center mb-8">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl serif text-charcoal mb-4">Direct Beekeeper Identity</h3>
                  <p className="text-xs text-warm-grey leading-relaxed">
                    Consumers scan a jar to see the beekeeper’s face, cooperative affiliation, GPS village location, and harvest timestamp—ensuring fair compensation.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-charcoal/10 text-[10px] uppercase tracking-widest text-warm-grey">
                  IPFS Decentralized Media Storage
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. LIVE VERIFIED BATCHES PREVIEW */}
        <section className="py-24 px-6 md:px-12 lg:px-24 bg-white border-b border-charcoal/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-ultra text-warm-grey mb-2 font-semibold">Live Ledger Explorer</p>
                <h2 className="text-4xl serif text-charcoal font-normal">Recent Verified Batches</h2>
              </div>
              <Link
                href="/verify"
                className="text-xs uppercase tracking-widest text-charcoal hover:text-gold transition-colors flex items-center gap-2"
              >
                <span>Search by QR Code</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {DEMO_BATCHES.map((b) => (
                <div key={b.batchId} className="border border-charcoal/10 p-8 hover:border-gold transition-colors duration-500 group bg-alabaster/30">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-warm-grey font-mono block mb-1">
                        Token: {b.qrToken}
                      </span>
                      <h3 className="text-2xl serif text-charcoal group-hover:text-gold transition-colors">
                        {b.batch.grade}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-widest text-warm-grey block">Purity Score</span>
                      <span className="text-3xl font-serif font-bold text-gold">{b.batch.qualityScore}/100</span>
                    </div>
                  </div>

                  <div className="space-y-2 py-4 border-t border-b border-charcoal/10 text-xs">
                    <p className="text-warm-grey">
                      Beekeeper: <span className="text-charcoal font-medium">{b.farmer.name}</span> ({b.farmer.location})
                    </p>
                    <p className="text-warm-grey">
                      Cooperative: <span className="font-mono text-charcoal">{b.farmer.cooperativeId}</span>
                    </p>
                    <p className="text-warm-grey truncate font-mono text-[10px]">
                      Polygon Tx: {b.txHash}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      KVIC Verified
                    </span>
                    <Link
                      href={`/verify/${b.batchId}`}
                      className="text-xs uppercase tracking-widest font-semibold text-charcoal group-hover:text-gold transition-colors flex items-center gap-1.5"
                    >
                      <span>View Provenance</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
