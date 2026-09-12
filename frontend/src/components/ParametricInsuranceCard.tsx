"use client";

import React, { useState } from "react";
import {
  Umbrella,
  CloudRain,
  Sun,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Zap,
  RotateCcw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { getSecureRandomInt } from "@/lib/crypto-utils";
import { getTxUrl } from "@/lib/contract-config";

interface ParametricInsuranceCardProps {
  beekeeperName?: string;
  apiaryLocation?: string;
  beeBoxesCount?: number;
}

export default function ParametricInsuranceCard({
  beekeeperName = "Rajesh K. Verma",
  apiaryLocation = "Muzaffarpur, Bihar (Litchi Belt)",
  beeBoxesCount = 20,
}: ParametricInsuranceCardProps) {
  const [isTriggering, setIsTriggering] = useState(false);
  const [claimSettled, setClaimSettled] = useState(false);
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null);
  const [utrNumber, setUtrNumber] = useState<string | null>(null);
  const [triggerCondition, setTriggerCondition] = useState<"heatwave" | "drought" | "unseasonal_rain">("heatwave");

  // Payout calculation: ₹1,250 per box emergency survival grant
  const emergencyGrantPerBox = 1250;
  const totalPayout = beeBoxesCount * emergencyGrantPerBox;

  const handleSimulateTrigger = () => {
    setIsTriggering(true);

    setTimeout(() => {
      const generatedTx = `0x${Date.now().toString(16).padEnd(64, "a")}`;
      const generatedUtr = `AIC-INS-2026-${getSecureRandomInt(10000000, 99999999)}`;
      setClaimTxHash(generatedTx);
      setUtrNumber(generatedUtr);
      setIsTriggering(false);
      setClaimSettled(true);

      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#138808", "#D4AF37", "#1A1A1A"],
      });
    }, 800);
  };

  const handleReset = () => {
    setClaimSettled(false);
    setClaimTxHash(null);
    setUtrNumber(null);
  };

  return (
    <div className="border-2 border-charcoal/15 bg-white p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-charcoal/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Umbrella className="w-4 h-4 text-gold" />
            <span className="text-[10px] uppercase tracking-ultra text-warm-grey font-bold">
              KVIC • AIC India Parametric Yield Shock Escrow
            </span>
          </div>
          <h3 className="text-2xl serif text-charcoal font-normal">
            Automated Parametric Micro-Insurance Shield
          </h3>
          <p className="text-xs text-warm-grey mt-1">
            Zero-paperwork index insurance. IoT weather satellite telemetry triggers instant emergency payouts when climate shocks endanger bee colony survival.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 bg-blue-50 border border-blue-300 text-blue-800 text-[11px] font-mono font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-blue-600" /> Automated Smart Contract Payout
          </span>
        </div>
      </div>

      {/* 3 Parametric Trigger Thresholds */}
      <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {/* Trigger 1: Heatwave */}
        <div
          onClick={() => !claimSettled && setTriggerCondition("heatwave")}
          className={`p-4 border cursor-pointer transition-all ${
            triggerCondition === "heatwave"
              ? "bg-amber-500/10 border-amber-500 shadow-xs"
              : "bg-[#F9F8F6] border-charcoal/15 opacity-80 hover:opacity-100"
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase font-bold text-amber-900 flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-600" /> Climate Index 1
            </span>
            <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">
              &gt; 42.0°C / 3-Days
            </span>
          </div>
          <p className="font-bold text-charcoal text-sm mt-1">Extreme Heatwave Shock</p>
          <p className="text-[11px] text-warm-grey mt-1 font-sans">
            Desiccates blossom nectar gland secretion; colonies suffer brood overheating.
          </p>
        </div>

        {/* Trigger 2: Hive Weight Loss */}
        <div
          onClick={() => !claimSettled && setTriggerCondition("drought")}
          className={`p-4 border cursor-pointer transition-all ${
            triggerCondition === "drought"
              ? "bg-amber-500/10 border-amber-500 shadow-xs"
              : "bg-[#F9F8F6] border-charcoal/15 opacity-80 hover:opacity-100"
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase font-bold text-amber-900 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> IoT Hive Telemetry
            </span>
            <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">
              &lt; -0.2 kg/day x 5d
            </span>
          </div>
          <p className="font-bold text-charcoal text-sm mt-1">Colony Starvation Dearth</p>
          <p className="text-[11px] text-warm-grey mt-1 font-sans">
            Continuous negative scale weight gain signals complete floral nectar failure.
          </p>
        </div>

        {/* Trigger 3: Unseasonal Flood/Rain */}
        <div
          onClick={() => !claimSettled && setTriggerCondition("unseasonal_rain")}
          className={`p-4 border cursor-pointer transition-all ${
            triggerCondition === "unseasonal_rain"
              ? "bg-amber-500/10 border-amber-500 shadow-xs"
              : "bg-[#F9F8F6] border-charcoal/15 opacity-80 hover:opacity-100"
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase font-bold text-amber-900 flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5 text-amber-600" /> Precipitation Index
            </span>
            <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">
              &gt; 75 mm / Bloom Day
            </span>
          </div>
          <p className="font-bold text-charcoal text-sm mt-1">Unseasonal Torrential Rain</p>
          <p className="text-[11px] text-warm-grey mt-1 font-sans">
            Washes away delicate litchi blossom pollen, terminating foraging activity.
          </p>
        </div>
      </div>

      {/* Policy Details & Simulation Action */}
      <div className="p-5 border-2 border-charcoal/10 bg-[#F9F8F6] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 my-6">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-warm-grey font-bold">
            Active Beneficiary Policy: POL-AIC-KVIC-2026-884
          </p>
          <p className="text-base font-bold text-charcoal">{beekeeperName} • {apiaryLocation}</p>
          <p className="text-xs font-mono text-warm-grey">
            Covered Apiary: <strong>{beeBoxesCount} Langstroth Boxes</strong> @ ₹{emergencyGrantPerBox}/box feeding grant
          </p>
        </div>

        {claimSettled ? (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-mono space-y-1.5 w-full md:w-auto">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Emergency Climate Relief Disbursed: ₹{totalPayout.toLocaleString("en-IN")}</span>
            </div>
            <p className="text-[11px] text-warm-grey">UTR: <strong>{utrNumber}</strong> (Aadhaar APB Direct)</p>
            {claimTxHash && (
              <a
                href={getTxUrl(claimTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-emerald-700 flex items-center gap-1 hover:text-emerald-900 underline"
              >
                <ExternalLink className="w-3 h-3" />
                <span>On-Chain Insurance Smart Payout: {claimTxHash.slice(0, 18)}...</span>
              </a>
            )}
            <button
              onClick={handleReset}
              className="mt-2 text-[10px] uppercase tracking-wider text-charcoal/60 hover:text-charcoal flex items-center gap-1 underline pt-1"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset Simulation</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-mono text-warm-grey block">Automated Indemnity</span>
              <span className="text-xl font-serif font-bold text-charcoal">₹{totalPayout.toLocaleString("en-IN")}</span>
            </div>
            <button
              onClick={handleSimulateTrigger}
              disabled={isTriggering}
              className="w-full sm:w-auto px-6 py-3.5 bg-amber-700 hover:bg-amber-800 text-white text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>
                {isTriggering ? "Evaluating Satellite Index..." : "Simulate 43.5°C Climate Shock Trigger"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Institutional Value Proposition */}
      <p className="text-[11px] text-warm-grey font-mono leading-relaxed">
        <strong>Why Parametric Insurance Wins for KVIC:</strong> Traditional agricultural insurance fails in apiculture
        because physical surveyors cannot inspect remote forest apiaries. By synchronizing ISRO/IMD weather grid feeds with
        on-chain IoT hive load cell sensors, HoneyChain guarantees instant survival feeding liquidity before colonies starve or abscond.
      </p>
    </div>
  );
}
