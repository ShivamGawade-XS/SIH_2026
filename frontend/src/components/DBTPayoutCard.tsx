"use client";

import React, { useState } from "react";
import { Landmark, CheckCircle2, ArrowRight, Wallet, ShieldCheck, Sparkles, ReceiptText } from "lucide-react";
import confetti from "canvas-confetti";
import { getSecureRandomInt } from "@/lib/crypto-utils";

interface DBTPayoutCardProps {
  beekeeperName: string;
  cooperativeId: string;
  upiVpa?: string | null;
  qualityScore: number;
  grade: string;
  quantityKg?: number;
  batchId: number;
}

export default function DBTPayoutCard({
  beekeeperName,
  cooperativeId,
  upiVpa,
  qualityScore,
  grade,
  quantityKg = 250,
  batchId,
}: DBTPayoutCardProps) {
  const [isDisbursing, setIsDisbursing] = useState(false);
  const [disbursed, setDisbursed] = useState(false);
  const [utrNumber, setUtrNumber] = useState<string | null>(null);

  // KVIC Honey Mission Subsidy Calculation:
  // Base Price Support = ₹20/kg
  // Purity Incentive (Score >= 90: ₹40/kg, Score >= 75: ₹25/kg)
  // Adulterated/Disputed batches (< 50) have subsidies frozen
  const isWithheld = qualityScore < 50;
  const baseSubsidyPerKg = isWithheld ? 0 : 20;
  const purityBonusPerKg = isWithheld ? 0 : qualityScore >= 90 ? 40 : qualityScore >= 75 ? 25 : 0;
  const totalRatePerKg = baseSubsidyPerKg + purityBonusPerKg;
  const totalSubsidyAmount = quantityKg * totalRatePerKg;

  const handleSimulatePayout = () => {
    if (isWithheld) return;
    setIsDisbursing(true);
    setTimeout(() => {
      const utrRef = `DBT-KVIC-2026-${getSecureRandomInt(100000000, 999999999)}`;
      setUtrNumber(utrRef);
      setIsDisbursing(false);
      setDisbursed(true);
      confetti({ particleCount: 70, spread: 55, origin: { y: 0.8 } });
    }, 1400);
  };

  return (
    <div className="border-2 border-charcoal/15 bg-white p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-charcoal/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="w-4 h-4 text-gold" />
            <span className="text-[10px] uppercase tracking-ultra text-warm-grey font-bold">
              KVIC Honey Mission • DBT Escrow Protocol
            </span>
          </div>
          <h3 className="text-2xl serif text-charcoal font-normal">
            Direct Benefit Transfer (DBT) Subsidy
          </h3>
        </div>

        <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold">
          PFMS Ministry Linked
        </div>
      </div>

      {/* Subsidy Calculation Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        <div className="p-4 bg-[#F9F8F6] border border-charcoal/10">
          <p className="text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-1">
            Certified Harvest Volume
          </p>
          <p className="text-2xl font-serif font-bold text-charcoal">
            {quantityKg} <span className="text-sm font-normal text-warm-grey">kg</span>
          </p>
          <p className="text-[10px] text-warm-grey mt-1 font-mono">
            Batch #{batchId} Verified
          </p>
        </div>

        <div className="p-4 bg-[#F9F8F6] border border-charcoal/10">
          <p className="text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-1">
            Purity Quality Incentive
          </p>
          <p className="text-2xl font-serif font-bold text-gold">
            +₹{purityBonusPerKg} <span className="text-sm font-normal text-warm-grey">/ kg</span>
          </p>
          <p className="text-[10px] text-emerald-700 mt-1 font-mono">
            {qualityScore}/100 Purity Score Bonus
          </p>
        </div>

        <div className="p-4 bg-[#141414] text-alabaster border border-charcoal">
          <p className="text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-1">
            Total Govt. Direct Grant
          </p>
          <p className="text-2xl font-serif font-bold text-gold">
            ₹{totalSubsidyAmount.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-emerald-400 mt-1 font-mono">
            Zero Intermediary Deduction
          </p>
        </div>
      </div>

      {/* Beneficiary & Disbursement Status */}
      <div className="p-5 border-2 border-charcoal/10 bg-[#F9F8F6] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-0.5">
            Registered Primary Beneficiary
          </p>
          <p className="text-base font-bold text-charcoal">{beekeeperName}</p>
          <p className="text-xs font-mono text-warm-grey mt-0.5">
            Cooperative: {cooperativeId} • UPI ID: {upiVpa || "beekeeper@upi (Aadhaar Seeded)"}
          </p>
        </div>

        {disbursed ? (
          <div className="flex items-center gap-2 p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <p className="font-bold">Grant Transferred Successfully</p>
              <p className="text-[10px] text-emerald-800">UTR: {utrNumber}</p>
            </div>
          </div>
        ) : isWithheld ? (
          <div className="px-5 py-3 bg-red-100 border-2 border-red-400 text-red-800 text-xs uppercase tracking-wider font-bold flex items-center gap-2 shrink-0">
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span>Subsidy Withheld — FSSAI Adulteration Flag</span>
          </div>
        ) : (
          <button
            onClick={handleSimulatePayout}
            disabled={isDisbursing}
            className="px-5 py-3 bg-charcoal text-alabaster text-xs uppercase tracking-widest font-bold btn-gold-slide flex items-center gap-2 shrink-0 shadow-sm"
          >
            <Wallet className="w-4 h-4 text-gold" />
            <span>{isDisbursing ? "Initiating Direct Bank Transfer..." : "Simulate DBT Grant Payout"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
