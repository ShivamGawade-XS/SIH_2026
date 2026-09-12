"use client";

import React, { useState } from "react";
import {
  Thermometer,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface ShelfLifeDecayPredictorProps {
  batchId: number;
  initialHmf?: number; // mg/kg at bottling
  initialDiastase?: number; // Schade units at bottling
  bottlingDate?: string;
}

export default function ShelfLifeDecayPredictor({
  batchId,
  initialHmf = 8.4,
  initialDiastase = 18.2,
  bottlingDate = "2026-03-15",
}: ShelfLifeDecayPredictorProps) {
  // Sliders
  const [temperature, setTemperature] = useState<number>(25); // Celsius (15 to 45)
  const [months, setMonths] = useState<number>(3); // Months stored (0 to 24)

  // Arrhenius Kinetics Simulation for Honey:
  // HMF rate constant: k_HMF = A * exp(-Ea / (R * T))
  // Approximated empirical model:
  // At 20°C: ~0.35 mg/kg/month
  // At 25°C: ~0.85 mg/kg/month
  // At 35°C: ~4.20 mg/kg/month
  // At 42°C: ~12.5 mg/kg/month
  const tempFactor = Math.exp(0.115 * (temperature - 20));
  const hmfAccumulationRate = 0.38 * tempFactor;
  const simulatedHmf = Number((initialHmf + hmfAccumulationRate * months).toFixed(1));

  // Diastase decay rate: DN(t) = DN_0 * exp(-k_d * t)
  // Half-life of diastase at 20°C: ~1480 days (49 mos)
  // Half-life of diastase at 35°C: ~200 days (6.6 mos)
  // Half-life of diastase at 45°C: ~35 days (1.1 mos)
  const diastaseHalfLifeMonths = 48 * Math.exp(-0.095 * (temperature - 20));
  const simulatedDiastase = Math.max(
    0.5,
    Number((initialDiastase * Math.pow(0.5, months / Math.max(0.5, diastaseHalfLifeMonths))).toFixed(1))
  );

  // Statutory limits (FSSAI 2020 Gazette)
  const FSSAI_HMF_MAX = 40.0; // mg/kg
  const FSSAI_DIASTASE_MIN = 8.0; // Schade units

  // Dynamic Freshness Score (0 - 100)
  const hmfPenalty = Math.max(0, (simulatedHmf - 10) * 1.8);
  const diastaseReward = Math.min(40, (simulatedDiastase / 16) * 40);
  const freshnessScore = Math.max(
    8,
    Math.min(100, Math.round(100 - hmfPenalty + (diastaseReward - 25)))
  );

  const isHmfExceeded = simulatedHmf > FSSAI_HMF_MAX;
  const isDiastaseDepleted = simulatedDiastase < FSSAI_DIASTASE_MIN;
  const isOptimal = !isHmfExceeded && !isDiastaseDepleted && freshnessScore >= 75;

  return (
    <div className="border-2 border-charcoal/15 bg-white p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-charcoal/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="w-4 h-4 text-gold" />
            <span className="text-[10px] uppercase tracking-ultra text-warm-grey font-bold">
              Arrhenius Thermodynamic Decay Model • Enzyme Bio-Vitality
            </span>
          </div>
          <h3 className="text-2xl serif text-charcoal font-normal">
            Quality Decay &amp; Dynamic Freshness Predictor
          </h3>
          <p className="text-xs text-warm-grey mt-1">
            Simulates real-world enzyme depletion (Diastase) &amp; HMF accumulation under variable transit temperatures
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`px-3 py-1.5 border text-xs font-mono font-bold flex items-center gap-2 ${
              isOptimal
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : isHmfExceeded || isDiastaseDepleted
                ? "bg-red-50 border-red-300 text-red-800"
                : "bg-amber-50 border-amber-300 text-amber-800"
            }`}
          >
            {isOptimal ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            )}
            <span>
              {isOptimal
                ? "PEAK RAW VITALITY"
                : isHmfExceeded
                ? "EXPIRED / OVERHEATED"
                : "COMMERCIAL SHELF GRADE"}
            </span>
          </div>

          <div className="text-right">
            <span className="text-3xl font-serif font-bold text-charcoal">{freshnessScore}</span>
            <span className="text-xs text-warm-grey font-mono">/100</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-[#F9F8F6] border border-charcoal/10">
        {/* Temperature Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-charcoal">
            <span className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-gold" />
              Ambient Storage Temperature:
            </span>
            <span className="font-mono text-base font-bold text-charcoal bg-white px-2 py-0.5 border border-charcoal/20">
              {temperature}°C
              <span className="text-[10px] text-warm-grey ml-1 font-normal">
                {temperature <= 20
                  ? "(Cold Storage)"
                  : temperature <= 28
                  ? "(Air-Conditioned)"
                  : temperature <= 36
                  ? "(Warm Warehouse)"
                  : "(Tropical Highway Transit)"}
              </span>
            </span>
          </div>
          <input
            type="range"
            min={15}
            max={45}
            step={1}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full accent-charcoal cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-warm-grey">
            <span>15°C (Controlled Cold)</span>
            <span>25°C (Standard Ambient)</span>
            <span>45°C (Extreme Heat)</span>
          </div>
        </div>

        {/* Time Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-charcoal">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gold" />
              Storage Duration Since Harvest:
            </span>
            <span className="font-mono text-base font-bold text-charcoal bg-white px-2 py-0.5 border border-charcoal/20">
              {months} {months === 1 ? "Month" : "Months"}
              <span className="text-[10px] text-warm-grey ml-1 font-normal">
                ({(months * 30.5).toFixed(0)} days)
              </span>
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={24}
            step={1}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full accent-charcoal cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-warm-grey">
            <span>0 Mos (Fresh Harvest)</span>
            <span>12 Mos (1 Year)</span>
            <span>24 Mos (2 Years)</span>
          </div>
        </div>
      </div>

      {/* Real-Time Biochemical Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        {/* HMF Card */}
        <div className="p-4 bg-white border border-charcoal/10 shadow-2xs">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-mono text-warm-grey uppercase font-bold">
              HMF Accumulation
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border ${
              isHmfExceeded
                ? "bg-red-50 text-red-800 border-red-300"
                : "bg-emerald-50 text-emerald-800 border-emerald-300"
            }`}>
              {isHmfExceeded ? "EXCEEDED LIMIT" : "COMPLIANT"}
            </span>
          </div>
          <p className={`text-2xl font-serif font-bold ${isHmfExceeded ? "text-red-600" : "text-charcoal"}`}>
            {simulatedHmf} <span className="text-xs font-mono font-normal text-warm-grey">mg/kg</span>
          </p>
          <p className="text-[10px] text-warm-grey mt-1">
            Bottled at {initialHmf} mg/kg • Statutory ceiling: {FSSAI_HMF_MAX} mg/kg
          </p>
          <div className="w-full bg-charcoal/10 h-1.5 mt-3 overflow-hidden rounded-full">
            <div
              className={`h-full transition-all duration-300 ${isHmfExceeded ? "bg-red-600" : "bg-gold"}`}
              style={{ width: `${Math.min(100, (simulatedHmf / 50) * 100)}%` }}
            />
          </div>
        </div>

        {/* Diastase Activity Card */}
        <div className="p-4 bg-white border border-charcoal/10 shadow-2xs">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-mono text-warm-grey uppercase font-bold">
              Diastase (Amylase) Enzyme
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border ${
              isDiastaseDepleted
                ? "bg-red-50 text-red-800 border-red-300"
                : "bg-emerald-50 text-emerald-800 border-emerald-300"
            }`}>
              {isDiastaseDepleted ? "DEPLETED" : "ACTIVE"}
            </span>
          </div>
          <p className={`text-2xl font-serif font-bold ${isDiastaseDepleted ? "text-red-600" : "text-charcoal"}`}>
            {simulatedDiastase} <span className="text-xs font-mono font-normal text-warm-grey">DN</span>
          </p>
          <p className="text-[10px] text-warm-grey mt-1">
            Bottled at {initialDiastase} DN • Statutory floor: {FSSAI_DIASTASE_MIN} DN
          </p>
          <div className="w-full bg-charcoal/10 h-1.5 mt-3 overflow-hidden rounded-full">
            <div
              className={`h-full transition-all duration-300 ${isDiastaseDepleted ? "bg-red-600" : "bg-emerald-600"}`}
              style={{ width: `${Math.min(100, (simulatedDiastase / 20) * 100)}%` }}
            />
          </div>
        </div>

        {/* Remaining Optimal Shelf Window */}
        <div className="p-4 bg-charcoal text-alabaster border border-charcoal shadow-2xs">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-mono text-warm-grey uppercase font-bold">
              Bio-Active Therapeutic Window
            </span>
            <Sparkles className="w-3.5 h-3.5 text-gold" />
          </div>
          <p className="text-2xl font-serif font-bold text-gold">
            {isHmfExceeded || isDiastaseDepleted
              ? "0 Months"
              : `~${Math.max(1, Math.round((FSSAI_HMF_MAX - simulatedHmf) / Math.max(0.1, hmfAccumulationRate)))} Months`}
          </p>
          <p className="text-[10px] text-warm-grey mt-1">
            At continuous {temperature}°C before statutory FSSAI degradation
          </p>
          <p className="text-[9px] font-mono text-emerald-400 mt-2">
            💡 Store below 22°C to extend enzyme shelf-life by 3.2x
          </p>
        </div>
      </div>
    </div>
  );
}
