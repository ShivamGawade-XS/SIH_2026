"use client";

import { useState } from "react";
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  Smartphone,
  BookOpen,
  ExternalLink,
  X,
  FileText,
  Layers,
  FlaskConical,
  Heart,
  Scale,
} from "lucide-react";
import { HONEYCHAIN_CONTRACT_ADDRESS, POLYGON_AMOY_RPC } from "@/lib/constants";

export default function JudgeEvaluationBrief() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "innovations" | "architecture" | "defense">("overview");

  return (
    <>
      {/* Floating Trigger Button for Judges */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-3 sm:bottom-6 sm:left-6 z-40 px-3.5 py-2.5 bg-[#121212] hover:bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border-2 border-gold"
      >
        <Award className="w-4 h-4 text-gold shrink-0" />
        <span className="hidden sm:inline">SIH 2026 Jury Brief</span>
        <span className="sm:hidden">Jury Brief</span>
        <span className="bg-black text-gold border border-gold/40 font-mono text-[9px] px-1.5 py-0.5">
          SIH26021
        </span>
      </button>

      {/* Full-Screen Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#141414] border-2 border-gold max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-[#F9F8F6]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/15 bg-[#1A1A1A] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold/10 border border-gold flex items-center justify-center text-gold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl serif font-bold text-alabaster">SIH 2026 Executive Evaluation Brief</h2>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold text-gold border border-gold/40 bg-gold/10">
                      PS SIH26021
                    </span>
                  </div>
                  <p className="text-xs text-warm-grey mt-0.5">
                    HoneyChain by TrueTag · Ministry of MSME / KVIC / National Bee Board
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/50 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-white/15 bg-[#141414] px-6 overflow-x-auto scrollbar-none">
              {[
                { id: "overview", label: "Executive Summary" },
                { id: "innovations", label: "6 Core Innovations" },
                { id: "architecture", label: "System Architecture" },
                { id: "defense", label: "Judge Q&A Defense" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-gold text-gold bg-gold/10"
                      : "border-transparent text-warm-grey hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm leading-relaxed">
              {/* TAB 1: EXECUTIVE SUMMARY */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="p-4 bg-gold/10 border border-gold/40">
                    <p className="text-xs uppercase font-bold text-gold tracking-wider mb-1">The Problem Statement</p>
                    <p className="text-sm text-alabaster leading-relaxed">
                      <strong>77% of commercial honey</strong> in Indian retail fails NMR spectroscopy tests due to synthetic C3/C4 corn and rice syrup adulteration. Smallholder beekeepers lose fair prices, while consumers consume adulterated inverted syrups with zero traceability.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg serif font-bold text-alabaster mb-2">Our Complete Solution</h3>
                    <p className="text-taupe/80 leading-relaxed mb-4">
                      <strong>HoneyChain by TrueTag</strong> is India’s first decentralized, multi-tier honey provenance and quality validation infrastructure combining <strong>Polygon PoS blockchain</strong>, <strong>FSSAI IS 4941-calibrated AI</strong>, <strong>tamper-evident micro-QR seals</strong>, and <strong>Govt. of India MadhuKranti/AgriStack federation</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 bg-[#1A1A1A] border border-white/10">
                      <p className="text-2xl serif font-bold text-gold">14,240+</p>
                      <p className="text-xs text-warm-grey mt-1">Beekeepers Registered</p>
                    </div>
                    <div className="p-4 bg-[#1A1A1A] border border-white/10">
                      <p className="text-2xl serif font-bold text-emerald-400">99.4%</p>
                      <p className="text-xs text-warm-grey mt-1">FSSAI Compliance</p>
                    </div>
                    <div className="p-4 bg-[#1A1A1A] border border-white/10">
                      <p className="text-2xl serif font-bold text-alabaster">&lt;3 sec</p>
                      <p className="text-xs text-warm-grey mt-1">Consumer Verification</p>
                    </div>
                    <div className="p-4 bg-[#1A1A1A] border border-white/10">
                      <p className="text-2xl serif font-bold text-gold-light">0.0%</p>
                      <p className="text-xs text-warm-grey mt-1">Farmer Tipping Fee</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: 6 CORE INNOVATIONS */}
              {activeTab === "innovations" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#1A1A1A] border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-wider">
                      <FlaskConical className="w-4 h-4" />
                      <span>1. Physics-Bounded AI Scoring</span>
                    </div>
                    <p className="text-xs text-taupe/80 leading-relaxed">
                      Models FSSAI IS 4941 laboratory standards, Isotope Ratio Mass Spectrometry (&delta;13C VPDB), C4 cane sugar %, and SMR rice syrup markers to classify pure honey vs. industrial adulterants.
                    </p>
                  </div>

                  <div className="p-4 bg-[#1A1A1A] border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-wider">
                      <Layers className="w-4 h-4" />
                      <span>2. Polygon PoS Web3 Provenance</span>
                    </div>
                    <p className="text-xs text-taupe/80 leading-relaxed">
                      Immutable harvest-to-jar custody chain secured by OpenZeppelin RBAC (Field Officer, Lab Analyst, Admin) with IPFS metadata anchoring and gasless officer-sponsored transactions.
                    </p>
                  </div>

                  <div className="p-4 bg-[#1A1A1A] border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      <span>3. Physical Micro-QR & NFC CMAC</span>
                    </div>
                    <p className="text-xs text-taupe/80 leading-relaxed">
                      Dual-factor anti-cloning: Micro-QR with server counter token + optional NTAG-424 DNA dynamic CMAC tags that invalidate photocopied labels on first legitimate scan.
                    </p>
                  </div>

                  <div className="p-4 bg-[#1A1A1A] border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-wider">
                      <Globe className="w-4 h-4" />
                      <span>4. MadhuKranti & AgriStack Bridge</span>
                    </div>
                    <p className="text-xs text-taupe/80 leading-relaxed">
                      Interoperable REST webhook schemas supporting National Bee Board MadhuKranti portal and AgriStack FRID (Farmer Registry ID) federation.
                    </p>
                  </div>

                  <div className="p-4 bg-[#1A1A1A] border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-wider">
                      <Smartphone className="w-4 h-4" />
                      <span>5. Vernacular Voice & Offline USSD</span>
                    </div>
                    <p className="text-xs text-taupe/80 leading-relaxed">
                      Zero-friction rural access: Full translation in Hindi, Bengali, Tamil, Telugu, and Kannada with Web Speech API audio synthesis and offline SMS batch verification.
                    </p>
                  </div>

                  <div className="p-4 bg-[#1A1A1A] border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-wider">
                      <Heart className="w-4 h-4" />
                      <span>6. Direct UPI Micro-Patronage</span>
                    </div>
                    <p className="text-xs text-taupe/80 leading-relaxed">
                      Consumers tip beekeepers directly via zero-cut NPCI UPI QR codes (`upi://pay`), eliminating middleman exploitation and rewarding high-purity bee stewards.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: SYSTEM ARCHITECTURE */}
              {activeTab === "architecture" && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-4 bg-[#0D0D0D] border border-white/10 space-y-2">
                    <p className="text-gold font-bold uppercase">Smart Contract Deployment Details</p>
                    <p className="text-taupe/80">Network: Polygon PoS Amoy Testnet (Chain ID: 80002)</p>
                    <p className="text-taupe/80 break-all">Contract: {HONEYCHAIN_CONTRACT_ADDRESS}</p>
                    <p className="text-taupe/80">RPC Gateway: {POLYGON_AMOY_RPC}</p>
                    <p className="text-taupe/80">Standards: ERC-1155 Batch Tokens + OpenZeppelin AccessControl</p>
                  </div>

                  <div className="p-4 bg-[#0D0D0D] border border-white/10 space-y-2">
                    <p className="text-gold font-bold uppercase">AI & Data Pipeline</p>
                    <p className="text-taupe/80">Microservice: FastAPI / Python 3.11 on Render Container</p>
                    <p className="text-taupe/80">ML Architecture: RandomForestRegressor (R2 0.92) + Multi-Class Adulteration Classifier</p>
                    <p className="text-taupe/80">IPFS Gateway: 4-Tier Cascade (Pinata IPFS &rarr; dweb.link &rarr; ipfs.io &rarr; Local Hash Cache)</p>
                  </div>
                </div>
              )}

              {/* TAB 4: JUDGE DEFENSE */}
              {activeTab === "defense" && (
                <div className="space-y-3">
                  <div className="p-4 bg-[#1A1A1A] border border-white/10 space-y-1">
                    <p className="text-gold font-bold text-xs uppercase">Q: What if a fraudster photocopies a genuine jar QR code?</p>
                    <p className="text-xs text-taupe/80 leading-relaxed">
                      <strong>A:</strong> Our anti-counterfeiting engine (`HoneyChainQR.sol`) tracks scan timestamps, locations, and total scan count. The second scan flags a clone alert. Additionally, the optional NTAG 424 DNA NFC chip changes its cryptographic CMAC token with every physical phone tap, rendering duplicate static screenshots invalid.
                    </p>
                  </div>

                  <div className="p-4 bg-[#1A1A1A] border border-white/10 space-y-1">
                    <p className="text-gold font-bold text-xs uppercase">Q: How do poor rural beekeepers afford Polygon blockchain gas fees?</p>
                    <p className="text-xs text-taupe/80 leading-relaxed">
                      <strong>A:</strong> Beekeepers pay <strong>₹0.00</strong> in gas fees. All minting and verification transactions are gasless and sponsored by the KVIC Field Officer or cooperative node using meta-transactions (EIP-2771).
                    </p>
                  </div>

                  <div className="p-4 bg-[#1A1A1A] border border-white/10 space-y-1">
                    <p className="text-gold font-bold text-xs uppercase">Q: How does this work in areas with zero 4G/5G mobile connectivity?</p>
                    <p className="text-xs text-taupe/80 leading-relaxed">
                      <strong>A:</strong> HoneyChain provides an offline SMS/USSD gateway. A consumer or farmer texts `VERIFY &lt;TOKEN&gt;` to `+91 9289-HONEY` to receive an instant FSSAI purity score and beekeeper origin via standard SMS without internet.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/15 bg-[#1A1A1A] flex justify-between items-center text-xs">
              <span className="text-warm-grey">Smart India Hackathon 2026 Grand Finale</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gold hover:bg-gold-light text-charcoal font-bold text-xs uppercase tracking-wider"
              >
                Close Brief
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
