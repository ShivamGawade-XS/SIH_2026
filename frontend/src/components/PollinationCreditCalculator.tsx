"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Leaf,
  Sparkles,
  TrendingUp,
  Award,
  Download,
  RefreshCw,
  CheckCircle2,
  TreePine,
  Coins,
  Globe,
  BarChart3,
  Zap,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import HoneyChainLogo, { HoneyChainBadge } from "./HoneyChainLogo";

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
// Avg Indian bee colony foraging radius ~ 2.5 km, pollinates ~0.8 ha per day
const HA_PER_COLONY_PER_DAY = 0.8;
// Pollination services yield boost ~20% for agri crops
const YIELD_BOOST_PERCENT = 0.20;
// Avg Indian crop revenue ₹ per ha from major crops
const AVG_CROP_REVENUE_PER_HA = 65000;
// 1 ha forest + crop pollinated sequesters ~5.4 tCO2e / year
const CO2_TONNES_PER_HA = 5.4;
// KVIC Green Credit rate (₹ per tCO2e)
const KVIC_CREDIT_RATE_INR = 850;
// National Carbon Credit (India Carbon Market) ₹ / tCO2e
const INDIA_CARBON_MARKET_RATE_INR = 1100;

interface CalculatorInput {
  colonyCount: number;
  activeDays: number;
  cropType: string;
  stateName: string;
  farmerName: string;
  cooperativeCode: string;
}

const CROP_MULTIPLIERS: Record<string, { label: string; yieldBoost: number; revenuePerHa: number }> = {
  mustard: { label: "Mustard / Sarson", yieldBoost: 0.22, revenuePerHa: 55000 },
  litchi: { label: "Litchi / Lychee", yieldBoost: 0.35, revenuePerHa: 120000 },
  apple: { label: "Apple (Kashmir)", yieldBoost: 0.30, revenuePerHa: 180000 },
  sunflower: { label: "Sunflower (Hybrid)", yieldBoost: 0.25, revenuePerHa: 45000 },
  cotton: { label: "BT Cotton", yieldBoost: 0.18, revenuePerHa: 75000 },
  watermelon: { label: "Watermelon / Cucurbit", yieldBoost: 0.40, revenuePerHa: 95000 },
  cardamom: { label: "Cardamom (Spice)", yieldBoost: 0.28, revenuePerHa: 450000 },
  mango: { label: "Alphonso Mango", yieldBoost: 0.20, revenuePerHa: 250000 },
};

const STATE_OPTIONS = [
  "Rajasthan", "Bihar", "Uttarakhand", "Jammu & Kashmir",
  "West Bengal", "Karnataka", "Maharashtra", "Punjab",
  "Madhya Pradesh", "Himachal Pradesh", "Gujarat", "Odisha",
];

export default function PollinationCreditCalculator() {
  const [input, setInput] = useState<CalculatorInput>({
    colonyCount: 120,
    activeDays: 45,
    cropType: "litchi",
    stateName: "Bihar",
    farmerName: "Ramesh Kumar Yadav",
    cooperativeCode: "KVIC-BR-C-0882",
  });
  const [showCertificate, setShowCertificate] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificateId, setCertificateId] = useState("KVIC-GPC-INIT01");

  useEffect(() => {
    setCertificateId(`KVIC-GPC-${Date.now().toString(36).toUpperCase().slice(-6)}`);
  }, []);

  const crop = CROP_MULTIPLIERS[input.cropType] || CROP_MULTIPLIERS.litchi;

  const results = useMemo(() => {
    const hectaresPollinatedTotal = input.colonyCount * HA_PER_COLONY_PER_DAY * input.activeDays;
    const yieldBoostRevenue = hectaresPollinatedTotal * crop.revenuePerHa * crop.yieldBoost;
    const co2Sequestered = hectaresPollinatedTotal * CO2_TONNES_PER_HA;
    const kvicGreenCredits = co2Sequestered;
    const kvicCreditValue = kvicGreenCredits * KVIC_CREDIT_RATE_INR;
    const carbonMarketValue = co2Sequestered * INDIA_CARBON_MARKET_RATE_INR;
    const totalEcologicalValue = yieldBoostRevenue + carbonMarketValue;
    const creditTokens = Math.floor(kvicGreenCredits * 100);
    return {
      hectaresPollinatedTotal: hectaresPollinatedTotal.toFixed(1),
      yieldBoostRevenue: yieldBoostRevenue.toFixed(0),
      co2Sequestered: co2Sequestered.toFixed(2),
      kvicGreenCredits: kvicGreenCredits.toFixed(2),
      kvicCreditValue: kvicCreditValue.toFixed(0),
      carbonMarketValue: carbonMarketValue.toFixed(0),
      totalEcologicalValue: totalEcologicalValue.toFixed(0),
      creditTokens,
    };
  }, [input, crop]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowCertificate(true);
    }, 1400);
  };

  return (
    <div className="border-2 border-charcoal/20 bg-white shadow-luxury-card overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-charcoal text-alabaster border-b border-charcoal flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-gold bg-[#121212] rounded-xl flex items-center justify-center text-gold">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-ultra text-gold font-mono font-bold">
                KVIC Green Pollination Credits
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[8px] font-mono uppercase font-bold">
                India Carbon Market
              </span>
            </div>
            <h2 className="text-xl serif text-alabaster font-normal">
              Pollination Ecological Impact & Carbon Offset Credit Tokenizer
            </h2>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-4 py-2 bg-gold text-charcoal hover:bg-gold/90 text-xs uppercase tracking-widest font-mono font-bold flex items-center gap-2 shadow-xs transition-colors self-start md:self-auto disabled:opacity-70"
        >
          {isGenerating ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /><span>Calculating...</span></>
          ) : (
            <><Award className="w-4 h-4" /><span>Generate Credit Certificate</span></>
          )}
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ─── Left: Calculator Inputs ────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-5">
          <h3 className="text-sm uppercase tracking-widest font-mono font-bold text-warm-grey flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gold" />
            Apiary Season Parameters
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-1.5 font-bold font-mono">
                Active Bee Colonies (boxes)
              </label>
              <input
                type="number"
                min={1}
                max={5000}
                value={input.colonyCount}
                onChange={(e) => setInput((p) => ({ ...p, colonyCount: +e.target.value }))}
                className="w-full border-2 border-charcoal/20 bg-alabaster px-4 py-2.5 font-mono text-sm text-charcoal focus:border-gold focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-1.5 font-bold font-mono">
                Active Bloom Days
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={input.activeDays}
                onChange={(e) => setInput((p) => ({ ...p, activeDays: +e.target.value }))}
                className="w-full border-2 border-charcoal/20 bg-alabaster px-4 py-2.5 font-mono text-sm text-charcoal focus:border-gold focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-1.5 font-bold font-mono">
              Primary Crop Pollinated
            </label>
            <select
              value={input.cropType}
              onChange={(e) => setInput((p) => ({ ...p, cropType: e.target.value }))}
              className="w-full border-2 border-charcoal/20 bg-alabaster px-4 py-2.5 font-mono text-sm text-charcoal focus:border-gold focus:outline-none transition-colors"
            >
              {Object.entries(CROP_MULTIPLIERS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-1.5 font-bold font-mono">
              State / UT of Apiary
            </label>
            <select
              value={input.stateName}
              onChange={(e) => setInput((p) => ({ ...p, stateName: e.target.value }))}
              className="w-full border-2 border-charcoal/20 bg-alabaster px-4 py-2.5 font-mono text-sm text-charcoal focus:border-gold focus:outline-none transition-colors"
            >
              {STATE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-1.5 font-bold font-mono">
                Registered Beekeeper / Farmer Name
              </label>
              <input
                type="text"
                value={input.farmerName}
                onChange={(e) => setInput((p) => ({ ...p, farmerName: e.target.value }))}
                className="w-full border-2 border-charcoal/20 bg-alabaster px-4 py-2.5 font-mono text-sm text-charcoal focus:border-gold focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-1.5 font-bold font-mono">
                KVIC Cooperative Code
              </label>
              <input
                type="text"
                value={input.cooperativeCode}
                onChange={(e) => setInput((p) => ({ ...p, cooperativeCode: e.target.value }))}
                className="w-full border-2 border-charcoal/20 bg-alabaster px-4 py-2.5 font-mono text-sm text-charcoal focus:border-gold focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Methodology note */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-800">
            <strong>Methodology:</strong> Based on FAO Bee Pollination Services Standard (2018),
            ICAR foraging radius model, and India Carbon Market (ICM) 2024 credit schedule for
            agroforestry & pollination ecosystem services.
          </div>
        </div>

        {/* ─── Right: Impact Results Dashboard ───────────────────────────── */}
        <div className="lg:col-span-7 space-y-5">
          <h3 className="text-sm uppercase tracking-widest font-mono font-bold text-warm-grey flex items-center gap-2">
            <Globe className="w-4 h-4 text-gold" />
            Computed Ecological Impact & Credit Value
          </h3>

          {/* Primary metric grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: <TreePine className="w-5 h-5 text-emerald-600" />,
                label: "Hectares Pollinated",
                value: `${Number(results.hectaresPollinatedTotal).toLocaleString('en-IN')} ha`,
                sub: `${input.colonyCount} colonies × ${input.activeDays} days`,
                color: "emerald",
              },
              {
                icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
                label: "Crop Yield Boost Revenue",
                value: `₹${Number(results.yieldBoostRevenue).toLocaleString('en-IN')}`,
                sub: `${(crop.yieldBoost * 100).toFixed(0)}% yield multiplier — ${crop.label}`,
                color: "blue",
              },
              {
                icon: <Leaf className="w-5 h-5 text-teal-600" />,
                label: "CO₂ Sequestered",
                value: `${results.co2Sequestered} tCO₂e`,
                sub: "5.4 tCO₂e per ha (IPCC Tier 1)",
                color: "teal",
              },
              {
                icon: <Coins className="w-5 h-5 text-gold" />,
                label: "KVIC Green Credits",
                value: `${results.kvicGreenCredits} GPC`,
                sub: `Value: ₹${Number(results.kvicCreditValue).toLocaleString('en-IN')} @ ₹850/tCO₂e`,
                color: "amber",
              },
            ].map((m) => (
              <div key={m.label} className={`p-4 border-2 border-charcoal/15 bg-[#F9F8F6]`}>
                <div className="flex items-center gap-2 mb-2">
                  {m.icon}
                  <span className="text-[10px] uppercase tracking-widest text-warm-grey font-bold font-mono truncate">{m.label}</span>
                </div>
                <p className="text-2xl serif font-bold text-charcoal leading-tight">{m.value}</p>
                <p className="text-[10px] font-mono text-warm-grey mt-0.5">{m.sub}</p>
              </div>
            ))}
          </div>

          {/* Total Ecological Value Banner */}
          <div className="p-5 bg-charcoal border-2 border-charcoal text-center">
            <span className="text-[10px] uppercase tracking-ultra text-gold font-mono font-bold block mb-1">
              Total Ecological Service Value (Carbon + Crop Yield)
            </span>
            <p className="text-4xl serif text-gold font-bold">
              ₹{Number(results.totalEcologicalValue).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] font-mono text-warm-grey mt-1">
              India Carbon Market Trade Value: ₹{Number(results.carbonMarketValue).toLocaleString('en-IN')}
              &nbsp;•&nbsp;Credit Tokens Issued: {results.creditTokens.toLocaleString('en-IN')} GPC-tokens
            </p>
          </div>

          {/* Token breakdown bar */}
          <div className="p-4 border border-charcoal/15 bg-alabaster space-y-2">
            <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-widest">
              <span className="text-emerald-700">Crop Yield Boost</span>
              <span className="text-charcoal">{((+results.yieldBoostRevenue / +results.totalEcologicalValue) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-charcoal/10 overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${((+results.yieldBoostRevenue / +results.totalEcologicalValue) * 100)}%` }}
              />
              <div className="h-full bg-teal-500 flex-1" />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-warm-grey">
              <span>Crop Pollination Value: ₹{Number(results.yieldBoostRevenue).toLocaleString('en-IN')}</span>
              <span>Carbon Credits: ₹{Number(results.carbonMarketValue).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Certificate Modal ──────────────────────────────────────────── */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="border-4 border-charcoal bg-[#FDFCF7] max-w-2xl w-full p-4 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="absolute inset-2 border border-gold/50 pointer-events-none" />
            <div className="absolute inset-4 border border-gold/20 pointer-events-none" />

            <div className="text-center border-b-2 border-charcoal/20 pb-4 sm:pb-5 mb-4 sm:mb-5">
              <div className="flex justify-center mb-2">
                <HoneyChainLogo size="sm" variant="icon" />
              </div>
              <p className="text-[9px] uppercase tracking-ultra text-warm-grey font-bold">
                Government of India • Ministry of MSME • KVIC • National Bee Board
              </p>
              <h3 className="text-xl sm:text-2xl serif font-bold text-charcoal mt-1">
                Green Pollination Credit Certificate
              </h3>
              <p className="text-[10px] font-mono text-gold font-bold">
                Certificate ID: {certificateId} &nbsp;|&nbsp; India Carbon Market — Agroforestry Registry
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
              <div className="sm:col-span-2 space-y-2 text-xs font-mono">
                <p><span className="text-warm-grey">Beekeeper / Farmer:</span> <strong className="text-charcoal">{input.farmerName}</strong></p>
                <p><span className="text-warm-grey">KVIC Cooperative Code:</span> <strong className="text-charcoal">{input.cooperativeCode}</strong></p>
                <p><span className="text-warm-grey">State / UT:</span> <strong className="text-charcoal">{input.stateName}</strong></p>
                <p><span className="text-warm-grey">Primary Crop Pollinated:</span> <strong className="text-charcoal">{crop.label}</strong></p>
                <p><span className="text-warm-grey">Active Colonies:</span> <strong className="text-charcoal">{input.colonyCount} Apis mellifera / Cerana boxes</strong></p>
                <p><span className="text-warm-grey">Active Season:</span> <strong className="text-charcoal">{input.activeDays} days</strong></p>
                <p><span className="text-warm-grey">Hectares Ecologically Serviced:</span> <strong className="text-gold font-bold">{results.hectaresPollinatedTotal} ha</strong></p>
                <p><span className="text-warm-grey">CO₂ Equivalent Sequestered:</span> <strong className="text-teal-700 font-bold">{results.co2Sequestered} tCO₂e</strong></p>
                <p><span className="text-warm-grey">KVIC Green Credits Awarded:</span> <strong className="text-gold font-bold">{results.kvicGreenCredits} GPC</strong></p>
                <p><span className="text-warm-grey">Total Ecological Service Value:</span> <strong className="text-charcoal font-bold">₹{Number(results.totalEcologicalValue).toLocaleString('en-IN')}</strong></p>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-white border border-charcoal/20">
                <QRCodeSVG
                  value={`https://honeychain-truetag.vercel.app/verify-credit/${certificateId}`}
                  size={110}
                  level="H"
                  imageSettings={{ src: "/honeychain_app_icon.jpg", height: 24, width: 24, excavate: true }}
                />
                <span className="text-[8px] font-mono text-warm-grey mt-1 text-center">Scan to verify on ICM</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-300 text-[9px] font-mono text-emerald-800 mb-6">
              ✓ Certified under India Carbon Market (ICM) — Agroforestry & Pollination Ecosystem Services Protocol (ICM-APES-2024).
              Corporate sponsors and government bodies may purchase these credits for CSR obligations under the Energy Conservation (Amendment) Act, 2022.
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => setShowCertificate(false)} className="px-4 py-2 border border-charcoal text-xs uppercase tracking-widest font-mono font-bold text-charcoal hover:bg-alabaster">
                Close
              </button>
              <button onClick={() => window.print()} className="px-6 py-2.5 bg-charcoal text-gold hover:bg-black text-xs uppercase tracking-widest font-mono font-bold flex items-center gap-2">
                <Download className="w-4 h-4" />
                Print Official Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
