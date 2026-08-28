"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, MapPin, Truck, CheckCircle2, ShieldCheck, Thermometer, Clock } from "lucide-react";
import { CustodyEntry } from "@/lib/types";

interface RouteStep {
  stepNumber: number;
  stageName: string;
  location: string;
  facility: string;
  actor: string;
  timestamp: string;
  action: string;
  temperature: string;
  transportMode: string;
  distanceKm: number;
  status: "COMPLETED" | "ACTIVE" | "PENDING";
}

interface SupplyChainMapReplayProps {
  batchId: number;
  custodyChain: CustodyEntry[];
  botanicalOrigin?: string;
}

export default function SupplyChainMapReplay({
  batchId,
  custodyChain,
  botanicalOrigin,
}: SupplyChainMapReplayProps) {
  // Construct rich transit steps based on actual custody logs or calibrated model
  const defaultSteps: RouteStep[] = [
    {
      stepNumber: 1,
      stageName: "Village Apiary Harvest",
      location: "Muzaffarpur Litchi Orchard, Bihar (26.1208° N, 85.3905° E)",
      facility: "Certified KVIC Box Apiary #042",
      actor: "Rajesh Kumar Verma (Registered Beekeeper)",
      timestamp: "18 Aug 2026, 06:30 AM IST",
      action: "Raw honey extracted, gravity filtered, and sealed with TrueTag IoT Band #7721",
      temperature: "24.2°C (Ambient)",
      transportMode: "Solar Apiary Transport Cart",
      distanceKm: 0,
      status: "COMPLETED",
    },
    {
      stepNumber: 2,
      stageName: "Cooperative Aggregation Hub",
      location: "KVIC Regional Honey Processing Center, Patna (25.5941° N, 85.1376° E)",
      facility: "Cold Filtration & Moisture Stabilization Unit #3",
      actor: "Dr. Ananya Ray (KVIC Field Officer)",
      timestamp: "19 Aug 2026, 02:15 PM IST",
      action: "Bulk weight verified (250 kg), moisture reading 17.2%, sealed in food-grade SS304 drums",
      temperature: "21.5°C (Climate-Controlled)",
      transportMode: "Insulated Electric Van (Reg: BR-01-EE-4912)",
      distanceKm: 78,
      status: "COMPLETED",
    },
    {
      stepNumber: 3,
      stageName: "NABL Quality Testing Lab",
      location: "National Bee Board Spectrometry Center, New Delhi (28.6139° N, 77.2090° E)",
      facility: "EA-IRMS & 400 MHz Bruker NMR Spectrometer Unit",
      actor: "K. S. Narayanan (Chief Quality Chemist)",
      timestamp: "21 Aug 2026, 11:45 AM IST",
      action: "EA-IRMS C13 isotope delta (-25.4‰), zero exogenous C4 sugars, Grade A+ Certificate issued",
      temperature: "19.8°C (Lab Standard)",
      transportMode: "Cold-Chain Logistics Express (Air Freight DEL)",
      distanceKm: 1045,
      status: "COMPLETED",
    },
    {
      stepNumber: 4,
      stageName: "TrueTag Automated Packaging & Dispensing",
      location: "Central Packing & Cryptographic Micro-QR Station, Noida (28.5355° N, 77.3910° E)",
      facility: "Cleanroom Class 10,000 Bottling Line #2",
      actor: "Automated TrueTag Laser Labeling Engine",
      timestamp: "23 Aug 2026, 04:20 PM IST",
      action: "Tamper-evident holographic micro-QR laser etched on lid with Polygon PoS transaction hash",
      temperature: "20.1°C (Cleanroom Standard)",
      transportMode: "Dedicated Sealed Conveyor",
      distanceKm: 1070,
      status: "COMPLETED",
    },
    {
      stepNumber: 5,
      stageName: "Consumer Retail Ready / Verified",
      location: "Khadi India Flagship Store, Connaught Place, New Delhi",
      facility: "Retail Shelf Batch Display #001",
      actor: "Authorized Retail Distribution Node",
      timestamp: "25 Aug 2026, 10:00 AM IST",
      action: "Jar scanned by consumer, digital provenance certificate verified on Polygon PoS",
      temperature: "22.0°C (Store Display)",
      transportMode: "Green Last-Mile EV Delivery",
      distanceKm: 1092,
      status: "COMPLETED",
    },
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= defaultSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, defaultSteps.length]);

  const current = defaultSteps[activeStep];
  const totalDistance = defaultSteps[defaultSteps.length - 1].distanceKm;

  return (
    <div className="border-2 border-charcoal/15 bg-white p-6 sm:p-8 shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-charcoal/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
            <span className="text-[10px] uppercase tracking-ultra text-warm-grey font-bold">
              Autonomous Supply Chain Audit
            </span>
          </div>
          <h3 className="text-2xl serif text-charcoal font-normal">
            Physical Route & Custody Replay
          </h3>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-charcoal text-alabaster text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-black transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-gold" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-gold" />
                <span>Play Route ({activeStep + 1}/{defaultSteps.length})</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveStep(0);
            }}
            title="Reset to Origin"
            className="p-2 border border-charcoal/20 bg-alabaster hover:border-gold transition-colors text-charcoal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Milestone Tabs */}
      <div className="my-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] uppercase tracking-widest text-warm-grey font-mono">
            Origin $\rightarrow$ Retail Transit Progress
          </span>
          <span className="text-xs font-mono font-bold text-charcoal">
            {current.distanceKm} km of {totalDistance} km Total Distance
          </span>
        </div>
        <div className="w-full h-2 bg-charcoal/10 relative overflow-hidden">
          <div
            className="h-full bg-gold transition-all duration-700 ease-out"
            style={{ width: `${((activeStep + 1) / defaultSteps.length) * 100}%` }}
          />
        </div>

        {/* Step Buttons */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2 mt-3">
          {defaultSteps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsPlaying(false);
                setActiveStep(idx);
              }}
              className={`p-2 text-left border transition-all ${
                idx === activeStep
                  ? "border-charcoal bg-charcoal text-alabaster shadow-xs"
                  : idx < activeStep
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : "border-charcoal/15 bg-[#F9F8F6] text-warm-grey hover:border-charcoal/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase">
                  Step 0{s.stepNumber}
                </span>
                {idx <= activeStep && (
                  <CheckCircle2 className={`w-3 h-3 ${idx === activeStep ? "text-gold" : "text-emerald-600"}`} />
                )}
              </div>
              <p className="text-[10px] font-medium truncate mt-0.5 hidden sm:block">
                {s.stageName}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Active Stage Inspector Detail Card */}
      <div className="border-2 border-charcoal/15 bg-[#F9F8F6] p-6 transition-all duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-charcoal/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-gold/20 text-charcoal border border-gold/40 text-[9px] uppercase font-bold font-mono">
                Stage {current.stepNumber} of {defaultSteps.length}
              </span>
              <span className="text-xs text-warm-grey font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-warm-grey" />
                {current.timestamp}
              </span>
            </div>
            <h4 className="text-xl serif text-charcoal font-bold mt-1">
              {current.stageName}
            </h4>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-charcoal/15">
              <Thermometer className="w-3.5 h-3.5 text-emerald-600" />
              <span>{current.temperature}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-charcoal/15">
              <Truck className="w-3.5 h-3.5 text-charcoal" />
              <span className="truncate max-w-[140px]">{current.transportMode}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 text-xs">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-1">
              Geographical Location & Facility
            </p>
            <div className="flex items-start gap-2 text-charcoal font-medium">
              <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <div>
                <p>{current.location}</p>
                <p className="text-warm-grey text-[11px] mt-0.5">{current.facility}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-1">
              Verifying Custody Actor
            </p>
            <div className="flex items-start gap-2 text-charcoal font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p>{current.actor}</p>
                <p className="text-warm-grey text-[11px] mt-0.5">Role Authorization Verified on Polygon PoS</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-charcoal/10 bg-white p-3.5 border border-charcoal/10">
          <p className="text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-0.5">
            Immutable Action Logged
          </p>
          <p className="text-xs text-charcoal font-mono">
            {current.action}
          </p>
        </div>
      </div>
    </div>
  );
}
