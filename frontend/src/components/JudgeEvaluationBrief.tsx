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
  Sparkles,
  ExternalLink,
  X,
  FileText,
  Layers,
  FlaskConical,
  Heart,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HONEYCHAIN_CONTRACT_ADDRESS, POLYGON_AMOY_RPC } from "@/lib/constants";

export default function JudgeEvaluationBrief() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "innovations" | "architecture" | "defense">("overview");

  return (
    <>
      {/* Floating Trigger Button for Judges */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-3 sm:bottom-6 sm:left-6 z-40 px-3.5 py-2.5 bg-brand-amber hover:bg-brand-amber-light text-black font-bold text-xs uppercase tracking-wider rounded-lg shadow-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border border-brand-amber"
      >
        <Award className="w-4 h-4 text-black shrink-0" />
        <span className="hidden sm:inline">SIH 2026 Jury Brief</span>
        <span className="sm:hidden">Jury Brief</span>
        <Badge variant="secondary" className="bg-black text-brand-amber font-mono text-[9px] px-1.5 py-0">
          SIH26021
        </Badge>
      </button>

      {/* Full-Screen Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-text-primary">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border bg-surface-raised flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-amber/10 border border-brand-amber/30 rounded-lg flex items-center justify-center text-brand-amber">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-text-primary">SIH 2026 Executive Evaluation Brief</h2>
                    <Badge variant="outline" className="text-brand-amber border-brand-amber text-[10px]">
                      PS SIH26021
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary">
                    HoneyChain by TrueTag · Ministry of MSME / KVIC / National Bee Board
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-border bg-surface px-6 overflow-x-auto scrollbar-none">
              {[
                { id: "overview", label: "Executive Summary" },
                { id: "innovations", label: "6 Core Innovations" },
                { id: "architecture", label: "System Architecture" },
                { id: "defense", label: "Judge Q&A Defense" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-brand-amber text-brand-amber bg-brand-amber/5"
                      : "border-transparent text-text-secondary hover:text-text-primary"
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
                  <div className="p-4 bg-brand-amber/10 border border-brand-amber/30 rounded-lg">
                    <p className="text-xs uppercase font-bold text-brand-amber tracking-wider mb-1">The Problem Statement</p>
                    <p className="text-sm text-text-primary leading-relaxed">
                      <strong>77% of commercial honey</strong> in Indian retail fails NMR spectroscopy tests due to synthetic C3/C4 corn and rice syrup adulteration. Smallholder beekeepers lose fair prices, while consumers consume adulterated inverted syrups with zero traceability.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-text-primary mb-3">Our Complete Solution</h3>
                    <p className="text-text-secondary leading-relaxed mb-4">
                      <strong>HoneyChain by TrueTag</strong> is India’s first decentralized, multi-tier honey provenance and quality validation infrastructure combining <strong>Polygon PoS blockchain</strong>, <strong>FSSAI IS 4941-calibrated AI</strong>, <strong>tamper-evident micro-QR seals</strong>, and <strong>Govt. of India MadhuKranti/AgriStack federation</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="bg-surface-raised border-border">
                      <CardContent className="p-4">
                        <p className="text-2xl font-bold text-brand-amber">14,240+</p>
                        <p className="text-xs text-text-secondary mt-1">Beekeepers Registered</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-surface-raised border-border">
                      <CardContent className="p-4">
                        <p className="text-2xl font-bold text-success">99.4%</p>
                        <p className="text-xs text-text-secondary mt-1">FSSAI Compliance</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-surface-raised border-border">
                      <CardContent className="p-4">
                        <p className="text-2xl font-bold text-text-primary">&lt;3 sec</p>
                        <p className="text-xs text-text-secondary mt-1">Consumer Verification</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-surface-raised border-border">
                      <CardContent className="p-4">
                        <p className="text-2xl font-bold text-brand-amber-light">0.0%</p>
                        <p className="text-xs text-text-secondary mt-1">Farmer Tipping Fee</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 2: 6 CORE INNOVATIONS */}
              {activeTab === "innovations" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-surface-raised border border-border rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-brand-amber font-bold text-xs uppercase tracking-wider">
                      <FlaskConical className="w-4 h-4" />
                      <span>1. Physics-Bounded AI Scoring</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Models FSSAI IS 4941 laboratory standards, Isotope Ratio Mass Spectrometry (&delta;13C VPDB), C4 cane sugar %, and SMR rice syrup markers to classify pure honey vs. industrial adulterants.
                    </p>
                  </div>

                  <div className="p-4 bg-surface-raised border border-border rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-brand-amber font-bold text-xs uppercase tracking-wider">
                      <Layers className="w-4 h-4" />
                      <span>2. Polygon PoS Web3 Provenance</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Immutable harvest-to-jar custody chain secured by OpenZeppelin RBAC (Field Officer, Lab Analyst, Admin) with IPFS metadata anchoring and gasless officer-sponsored transactions.
                    </p>
                  </div>

                  <div className="p-4 bg-surface-raised border border-border rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-brand-amber font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      <span>3. Physical Micro-QR & NFC CMAC</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Dual-factor anti-cloning: Micro-QR with server counter token + optional NTAG-424 DNA dynamic CMAC tags that invalidate photocopied labels on first legitimate scan.
                    </p>
                  </div>

                  <div className="p-4 bg-surface-raised border border-border rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-brand-amber font-bold text-xs uppercase tracking-wider">
                      <Globe className="w-4 h-4" />
                      <span>4. Govt. Portal Interoperability</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Native JSON API schemas federated with MadhuKranti v2.4, AgriStack Farmer Registry ID (FRID), DigiLocker W3C Verifiable Credentials, and DBT Direct Benefit Settlement.
                    </p>
                  </div>

                  <div className="p-4 bg-surface-raised border border-border rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-brand-amber font-bold text-xs uppercase tracking-wider">
                      <Smartphone className="w-4 h-4" />
                      <span>5. Rural Offline Inclusivity</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Voice Field Assistant in 6 Indian languages (Hindi, Bengali, Tamil, Kannada, Marathi, English) plus offline USSD/SMS fallback (<code>*99*4941*001#</code>) for 2G keypad phones.
                    </p>
                  </div>

                  <div className="p-4 bg-surface-raised border border-border rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-brand-amber font-bold text-xs uppercase tracking-wider">
                      <Heart className="w-4 h-4" />
                      <span>6. Direct UPI & Green Credits</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Consumers can scan and tip beekeepers directly via UPI (Zero-Cut platform commission) and beekeepers tokenize ecological pollination impact into Green Credits.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: ARCHITECTURE */}
              {activeTab === "architecture" && (
                <div className="space-y-4">
                  <div className="p-4 bg-surface-raised border border-border rounded-lg font-mono text-xs space-y-2 text-text-secondary">
                    <p className="text-brand-amber font-bold uppercase tracking-wider">Smart Contract Details</p>
                    <p>Network: <span className="text-text-primary">Polygon PoS (Amoy Testnet)</span></p>
                    <p>Contract Address: <span className="text-brand-amber-light break-all">{HONEYCHAIN_CONTRACT_ADDRESS}</span></p>
                    <p>Solidity Version: <span className="text-text-primary">0.8.24 (OpenZeppelin AccessControl + ReentrancyGuard)</span></p>
                    <p>IPFS Gateways: <span className="text-text-primary">Pinata · IPFS.io · Cloudflare · dWeb.link (4-tier cascade)</span></p>
                  </div>

                  <div className="p-4 bg-surface-raised border border-border rounded-lg font-mono text-xs space-y-2 text-text-secondary">
                    <p className="text-brand-amber font-bold uppercase tracking-wider">AI Microservice & Compute</p>
                    <p>Framework: <span className="text-text-primary">FastAPI + Scikit-Learn RandomForest</span></p>
                    <p>Standards: <span className="text-text-primary">FSSAI IS 4941 Honey Standard Calibration</span></p>
                    <p>Protection: <span className="text-text-primary">Sliding-window IP Token Bucket Rate Limiter (30 req/min)</span></p>
                  </div>
                </div>
              )}

              {/* TAB 4: JUDGE DEFENSE */}
              {activeTab === "defense" && (
                <div className="space-y-4">
                  <div className="p-4 bg-surface-raised border border-border rounded-lg space-y-1">
                    <p className="font-bold text-text-primary text-xs">Q: What if the QR code is photocopied?</p>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      A: Our system pairs micro-QR with server counter tokens and optional NFC NTAG-424 DNA dynamic CMAC tags. Once scanned legitimately, secondary clones fail cryptographic authentication.
                    </p>
                  </div>

                  <div className="p-4 bg-surface-raised border border-border rounded-lg space-y-1">
                    <p className="font-bold text-text-primary text-xs">Q: How do rural beekeepers without smartphones participate?</p>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      A: KVIC Field Officers handle GPS onboarding and batch minting. Farmers verify status and receive advisories via offline USSD/SMS (<code>*99*4941*001#</code>) or vernacular voice assistance.
                    </p>
                  </div>

                  <div className="p-4 bg-surface-raised border border-border rounded-lg space-y-1">
                    <p className="font-bold text-text-primary text-xs">Q: Who pays Polygon gas fees?</p>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      A: The KVIC administrative node sponsors gas via ERC-2771 meta-transaction relayers. The blockchain operates 100% gasless and frictionless for farmers and consumers.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-surface-raised flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>Lead Dev: Shivam Gawade</span>
                <span>·</span>
                <a
                  href="https://github.com/ShivamGawade-XS/SIH_2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-amber hover:underline flex items-center gap-1"
                >
                  GitHub <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                className="bg-brand-amber hover:bg-brand-amber-light text-black font-semibold"
              >
                Close Brief
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
