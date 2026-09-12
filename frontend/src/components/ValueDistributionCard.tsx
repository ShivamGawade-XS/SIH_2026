"use client";

import React, { useState } from "react";
import {
  Coins,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  HeartHandshake,
  CheckCircle2,
  ExternalLink,
  Users,
  Store,
  Truck,
  FlaskConical,
  PackageCheck,
} from "lucide-react";
import { getTxUrl } from "@/lib/contract-config";

interface ValueDistributionCardProps {
  jarRetailPriceInr?: number;
  beekeeperName?: string;
  cooperativeName?: string;
  settlementTx?: string;
}

export default function ValueDistributionCard({
  jarRetailPriceInr = 650,
  beekeeperName = "Rajesh K. Verma",
  cooperativeName = "Muzaffarpur Litchi Honey Farmers Coop",
  settlementTx = "0x8e2a6288b8cee3e390c55f266f53d68102a1a82e",
}: ValueDistributionCardProps) {
  const [modelView, setModelView] = useState<"truetag" | "traditional">("truetag");

  // Cost breakdown for HoneyChain TrueTag Fair-Trade Model (₹650 jar)
  const trueTagSlices = [
    {
      label: "Primary Beekeeper Farmgate",
      amount: 390,
      pct: 60.0,
      color: "bg-emerald-600",
      textColor: "text-emerald-800",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-300",
      icon: Users,
      desc: "Direct NPCI UPI / Smart Escrow transfer (zero intermediary cuts)",
    },
    {
      label: "Cooperative Aggregation & Storage",
      amount: 65,
      pct: 10.0,
      color: "bg-amber-600",
      textColor: "text-amber-800",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      icon: Store,
      desc: "Hygienic stainless steel centrifuging & bulk holding",
    },
    {
      label: "NABL Laboratory Spectrometry",
      amount: 45,
      pct: 6.9,
      color: "bg-purple-600",
      textColor: "text-purple-800",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      icon: FlaskConical,
      desc: "NMR 400MHz, SMR rice syrup LC-MS/MS, and EA-IRMS testing",
    },
    {
      label: "Glass Packaging & Tamper Seal",
      amount: 50,
      pct: 7.7,
      color: "bg-blue-600",
      textColor: "text-blue-800",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      icon: PackageCheck,
      desc: "100% recyclable flint glass jar + under-cap scratch PIN nonce",
    },
    {
      label: "Direct Logistics & Distribution",
      amount: 35,
      pct: 5.4,
      color: "bg-slate-600",
      textColor: "text-slate-800",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-300",
      icon: Truck,
      desc: "First-mile farm transport & temperature-controlled delivery",
    },
    {
      label: "KVIC Honey Mission Development",
      amount: 65,
      pct: 10.0,
      color: "bg-gold",
      textColor: "text-yellow-900",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300",
      icon: HeartHandshake,
      desc: "Re-invested in Langstroth bee boxes & tribal women apiary training",
    },
  ];

  // Cost breakdown for Traditional Exploitative Middleman Model
  const traditionalSlices = [
    { label: "Beekeeper Farmgate", amount: 110, pct: 16.9, color: "bg-red-500", desc: "Forced distress sale to roving aggregator" },
    { label: "Village Trader & Sub-Agent", amount: 95, pct: 14.6, color: "bg-neutral-500", desc: "Layer 1 cash middleman deduction" },
    { label: "Inter-State Honey Cartel", amount: 160, pct: 24.6, color: "bg-neutral-600", desc: "Wholesale blending & adulterant bulk dilution" },
    { label: "Corporate Marketing & FMCG Brand", amount: 185, pct: 28.5, color: "bg-neutral-700", desc: "Celebrity endorsements & retail slotting fees" },
    { label: "Retail Supermarket Markup", amount: 100, pct: 15.4, color: "bg-neutral-800", desc: "Distributor & shelf-space margins" },
  ];

  return (
    <div className="border-2 border-charcoal/15 bg-white p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-charcoal/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Coins className="w-4 h-4 text-gold" />
            <span className="text-[10px] uppercase tracking-ultra text-warm-grey font-bold">
              Fair-Trade Economic Transparency • Zero Intermediary Exploitation
            </span>
          </div>
          <h3 className="text-2xl serif text-charcoal font-normal">
            Verifiable Supply Chain Value Distribution
          </h3>
          <p className="text-xs text-warm-grey mt-1">
            Every rupee of your ₹{jarRetailPriceInr} jar tracked on Polygon smart escrow. Proof that beekeepers earn fair remuneration.
          </p>
        </div>

        {/* Toggle between TrueTag and Traditional Model */}
        <div className="flex items-center border border-charcoal/20 bg-alabaster p-1 text-xs font-mono font-bold shrink-0">
          <button
            onClick={() => setModelView("truetag")}
            className={`px-3 py-1.5 transition-all ${
              modelView === "truetag"
                ? "bg-charcoal text-alabaster shadow-xs"
                : "text-charcoal hover:text-gold"
            }`}
          >
            HoneyChain TrueTag (60% to Farmer)
          </button>
          <button
            onClick={() => setModelView("traditional")}
            className={`px-3 py-1.5 transition-all ${
              modelView === "traditional"
                ? "bg-charcoal text-alabaster shadow-xs"
                : "text-charcoal hover:text-gold"
            }`}
          >
            Traditional Middleman (17% to Farmer)
          </button>
        </div>
      </div>

      {/* Progress Bar Split Visualizer */}
      <div className="my-6">
        <div className="flex justify-between items-center text-xs font-mono font-bold text-charcoal mb-2">
          <span>₹{jarRetailPriceInr} Consumer Purchase Value Allocation</span>
          <span className={modelView === "truetag" ? "text-emerald-700" : "text-red-600"}>
            {modelView === "truetag" ? "✅ Beekeeper Share: ₹390 (60.0%)" : "⚠️ Beekeeper Share: ₹110 (16.9%)"}
          </span>
        </div>

        <div className="w-full h-5 rounded-full overflow-hidden flex shadow-inner bg-charcoal/10">
          {(modelView === "truetag" ? trueTagSlices : traditionalSlices).map((slice, i) => (
            <div
              key={i}
              className={`${slice.color} h-full transition-all duration-500 hover:opacity-90 relative group`}
              style={{ width: `${slice.pct}%` }}
              title={`${slice.label}: ₹${slice.amount} (${slice.pct}%)`}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-4 text-[10px] font-mono text-warm-grey mt-2">
          {(modelView === "truetag" ? trueTagSlices : traditionalSlices).map((slice, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-xs ${slice.color}`} />
              <span>{slice.label}: <strong>₹{slice.amount}</strong> ({slice.pct}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown Grid for TrueTag Fair-Trade */}
      {modelView === "truetag" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
          {trueTagSlices.map((slice, i) => {
            const Icon = slice.icon;
            return (
              <div key={i} className={`p-4 border ${slice.borderColor} ${slice.bgColor} shadow-2xs flex flex-col justify-between`}>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-charcoal/70" />
                      <span className="text-[11px] font-bold text-charcoal">{slice.label}</span>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border ${slice.borderColor}`}>
                      {slice.pct}%
                    </span>
                  </div>
                  <p className="text-2xl font-serif font-bold text-charcoal">
                    ₹{slice.amount}
                  </p>
                  <p className="text-[11px] text-charcoal/70 mt-1 leading-snug">
                    {slice.desc}
                  </p>
                </div>

                {i === 0 && (
                  <div className="mt-3 pt-2 border-t border-emerald-300/50 flex items-center justify-between text-[10px] font-mono text-emerald-900 font-bold">
                    <span>Beneficiary: {beekeeperName}</span>
                    <span className="flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" /> Settled
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Explanatory Contrast for Middleman Exploitation */
        <div className="p-6 bg-red-50/70 border border-red-200 my-6 space-y-4">
          <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
            <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
            <span>Middleman Distortion: Why Traditional Honey Supply Chains Exploit Indian Beekeepers</span>
          </div>
          <p className="text-xs text-charcoal/80 leading-relaxed">
            In standard commercial supply chains, the primary beekeeper receives only <strong>₹110 / kg</strong>,
            which does not even cover the cost of Langstroth migration and seasonal sugar syrup feeding.
            Middlemen, informal blenders, and branded marketing cartels absorb <strong>83% of consumer expenditure</strong> while
            frequently introducing inverted sugar syrup to boost profit margins.
          </p>
          <div className="p-3 bg-white border border-red-200 rounded text-xs font-mono text-charcoal flex items-center justify-between">
            <span>HoneyChain TrueTag Margin Lift to Beekeepers:</span>
            <span className="font-bold text-emerald-700 text-sm">+254% Farmgate Income</span>
          </div>
        </div>
      )}

      {/* On-Chain Escrow Verification Badge */}
      <div className="p-4 bg-[#F9F8F6] border border-charcoal/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-charcoal">
              Fair-Trade Escrow Executed on Polygon PoS
            </p>
            <p className="text-[10px] text-warm-grey font-mono mt-0.5">
              Cooperative: {cooperativeName} • Aadhaar NPCI APB Seeded
            </p>
          </div>
        </div>

        <a
          href={getTxUrl(settlementTx)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-mono font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 underline"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Verify Procurement Split Tx ({settlementTx.slice(0, 14)}...)</span>
        </a>
      </div>
    </div>
  );
}
